import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import type { ApiSuccess } from '../../types/shared.js';
import { randomUUID } from 'crypto';

const ts = () => new Date().toISOString();
const reqId = () => randomUUID();

const errResp = (res: Response, status: number, code: string, message: string) =>
    res.status(status).json({ success: false, error: { code, message }, timestamp: ts(), requestId: reqId() });

// GET /api/admin/users?page=1&pageSize=20&city=&flagged=&active=
export const listUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { page = 1, pageSize = 20, city, flagged, active, search } = req.query as Record<string, string>;
        const offset = (Number(page) - 1) * Number(pageSize);

        const conditions: string[] = [];
        const params: unknown[] = [];
        let i = 1;

        if (flagged !== undefined) { conditions.push(`is_flagged = $${i++}`); params.push(flagged === 'true'); }
        if (active !== undefined) { conditions.push(`is_active = $${i++}`); params.push(active === 'true'); }
        if (city) { conditions.push(`city ilike $${i++}`); params.push(`%${city}%`); }
        if (search) { conditions.push(`(name ilike $${i} OR phone_number ilike $${i++})`); params.push(`%${search}%`); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const totalRes = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);
        const total = Number(totalRes.rows[0].count);

        params.push(Number(pageSize), offset);
        const rows = await pool.query(
            `SELECT id, name, email, phone_number as phone, city, is_active, is_flagged, flag_reason,
                    wallet_balance, total_orders, created_at
             FROM users ${where}
             ORDER BY created_at DESC
             LIMIT $${i++} OFFSET $${i}`,
            params
        );

        const resp: ApiSuccess<object> = {
            success: true,
            data: {
                items: rows.rows,
                total,
                page: Number(page),
                pageSize: Number(pageSize),
                hasNextPage: offset + rows.rows.length < total,
                hasPrevPage: Number(page) > 1
            },
            timestamp: ts(),
            requestId: reqId()
        };
        res.status(200).json(resp);
    } catch (err) {
        console.error('List users error:', err);
        return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
    }
};

// GET /api/admin/users/:userId
export const getUserDetail = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            `SELECT id, name, email, phone_number as phone, city, is_active, is_flagged, flag_reason,
                    wallet_balance, total_orders, referral_code, created_at, updated_at
             FROM users WHERE id = $1`,
            [userId]
        );
        if (!result.rows.length) return errResp(res, 404, 'NOT_FOUND', 'User not found');

        res.status(200).json({ success: true, data: result.rows[0], timestamp: ts(), requestId: reqId() });
    } catch (err) {
        console.error('Get user detail error:', err);
        return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
    }
};

// PATCH /api/admin/users/:userId/flag
export const flagUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { flagged, reason } = req.body as { flagged: boolean; reason?: string };
        const adminId = req.user!.userId;

        await pool.query(
            `UPDATE users SET is_flagged = $1, flag_reason = $2, updated_at = NOW() WHERE id = $3`,
            [flagged, reason ?? null, userId]
        );

        // Audit log
        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address)
             VALUES ($1, $2, $3, 'user', $4, $5, $6)`,
            [adminId, req.user!.role, flagged ? 'flag_user' : 'unflag_user', userId,
             JSON.stringify({ before: {}, after: { is_flagged: flagged, flag_reason: reason } }),
             req.ip ?? '']
        );

        res.status(200).json({ success: true, data: { userId, flagged }, message: flagged ? 'User flagged' : 'User unflagged', timestamp: ts(), requestId: reqId() });
    } catch (err) {
        console.error('Flag user error:', err);
        return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
    }
};

// PATCH /api/admin/users/:userId/deactivate
export const deactivateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body as { reason?: string };
        const adminId = req.user!.userId;

        await pool.query(`UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`, [userId]);

        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address, reason)
             VALUES ($1, $2, 'deactivate_user', 'user', $3, $4, $5, $6)`,
            [adminId, req.user!.role, userId, JSON.stringify({ before: { is_active: true }, after: { is_active: false } }), req.ip ?? '', reason ?? '']
        );

        res.status(200).json({ success: true, data: { userId }, message: 'User deactivated', timestamp: ts(), requestId: reqId() });
    } catch (err) {
        console.error('Deactivate error:', err);
        return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
    }
};

// PATCH /api/admin/users/:userId/activate
export const activateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body as { reason?: string };
        const adminId = req.user!.userId;

        await pool.query(`UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1`, [userId]);

        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address, reason)
             VALUES ($1, $2, 'activate_user', 'user', $3, $4, $5, $6)`,
            [adminId, req.user!.role, userId, JSON.stringify({ before: { is_active: false }, after: { is_active: true } }), req.ip ?? '', reason ?? '']
        );

        res.status(200).json({ success: true, data: { userId }, message: 'User activated', timestamp: ts(), requestId: reqId() });
    } catch (err) {
        console.error('Activate error:', err);
        return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
    }
};
