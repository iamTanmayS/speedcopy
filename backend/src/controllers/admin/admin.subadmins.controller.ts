import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import { randomUUID } from 'crypto';

const ts = () => new Date().toISOString();
const reqId = () => randomUUID();
const errResp = (res: Response, status: number, code: string, message: string) =>
    res.status(status).json({ success: false, error: { code, message }, timestamp: ts(), requestId: reqId() });

// GET /api/admin/sub-admins
export const listSubAdmins = async (req: AuthRequest, res: Response) => {
    try {
        const rows = await pool.query(`SELECT id, name, email, phone, role, permissions, hub_ids, city_ids, is_active, last_login_at, created_at FROM sub_admins ORDER BY created_at DESC`);
        res.status(200).json({ success: true, data: { items: rows.rows, total: rows.rowCount }, timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// POST /api/admin/sub-admins
export const createSubAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, phone, role = 'sub_admin', permissions = [], hubIds = [], cityIds = [] } = req.body;

        // Create user record first
        const userRes = await pool.query(
            `INSERT INTO users (name, email, phone_number, role, password_hash) VALUES ($1,$2,$3,$4,'') RETURNING id`,
            [name, email, phone, role]
        );
        const userId = userRes.rows[0].id;

        const saRes = await pool.query(
            `INSERT INTO sub_admins (user_id, name, email, phone, role, permissions, hub_ids, city_ids)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [userId, name, email, phone, role, permissions, hubIds, cityIds]
        );

        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address)
             VALUES ($1,$2,'create_sub_admin','sub_admin',$3,$4,$5)`,
            [req.user!.userId, req.user!.role, saRes.rows[0].id, JSON.stringify({ before: {}, after: { name, email, role, permissions } }), req.ip ?? '']
        );

        res.status(201).json({ success: true, data: saRes.rows[0], message: 'Sub-admin created', timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// PATCH /api/admin/sub-admins/:adminId
export const updateSubAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { adminId } = req.params;
        const { permissions, hubIds, cityIds, isActive, name } = req.body;

        await pool.query(
            `UPDATE sub_admins SET
                name = COALESCE($1, name),
                permissions = COALESCE($2, permissions),
                hub_ids = COALESCE($3, hub_ids),
                city_ids = COALESCE($4, city_ids),
                is_active = COALESCE($5, is_active),
                updated_at = NOW()
             WHERE id = $6`,
            [name ?? null, permissions ?? null, hubIds ?? null, cityIds ?? null, isActive ?? null, adminId]
        );

        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address)
             VALUES ($1,$2,'update_sub_admin','sub_admin',$3,$4,$5)`,
            [req.user!.userId, req.user!.role, adminId, JSON.stringify({ before: {}, after: req.body }), req.ip ?? '']
        );

        res.status(200).json({ success: true, data: { adminId }, message: 'Sub-admin updated', timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// DELETE /api/admin/sub-admins/:adminId
export const deactivateSubAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { adminId } = req.params;
        await pool.query(`UPDATE sub_admins SET is_active = false, updated_at = NOW() WHERE id = $1`, [adminId]);
        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address)
             VALUES ($1,$2,'deactivate_sub_admin','sub_admin',$3,$4,$5)`,
            [req.user!.userId, req.user!.role, adminId, JSON.stringify({ before: { is_active: true }, after: { is_active: false } }), req.ip ?? '']
        );
        res.status(200).json({ success: true, data: { adminId, deactivated: true }, timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};
