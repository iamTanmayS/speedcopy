import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import { randomUUID } from 'crypto';

const ts = () => new Date().toISOString();
const reqId = () => randomUUID();
const errResp = (res: Response, status: number, code: string, message: string) =>
    res.status(status).json({ success: false, error: { code, message }, timestamp: ts(), requestId: reqId() });

// GET /api/admin/hubs
export const listHubs = async (req: AuthRequest, res: Response) => {
    try {
        const { cityId, paused, active } = req.query as Record<string, string>;
        const conditions: string[] = [];
        const params: unknown[] = [];
        let i = 1;
        if (cityId) { conditions.push(`city_id = $${i++}`); params.push(cityId); }
        if (paused !== undefined) { conditions.push(`is_paused = $${i++}`); params.push(paused === 'true'); }
        if (active !== undefined) { conditions.push(`is_active = $${i++}`); params.push(active === 'true'); }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const rows = await pool.query(`SELECT * FROM hubs ${where} ORDER BY created_at DESC`, params);
        res.status(200).json({ success: true, data: { items: rows.rows, total: rows.rowCount }, timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// GET /api/admin/hubs/:hubId
export const getHubDetail = async (req: AuthRequest, res: Response) => {
    try {
        const { hubId } = req.params;
        const [hubRes, vendorCount, activeOrders] = await Promise.all([
            pool.query(`SELECT * FROM hubs WHERE id = $1`, [hubId]),
            pool.query(`SELECT COUNT(*) FROM vendors WHERE hub_id = $1 AND is_active = true`, [hubId]),
            pool.query(`SELECT COUNT(*) FROM orders WHERE hub_id = $1 AND status IN ('ACCEPTED','IN_PRODUCTION','AWAITING_VENDOR_ACCEPTANCE')`, [hubId])
        ]);

        if (!hubRes.rows.length) return errResp(res, 404, 'HUB_NOT_FOUND', 'Hub not found');

        res.status(200).json({
            success: true,
            data: { ...hubRes.rows[0], activeVendors: Number(vendorCount.rows[0].count), activeOrders: Number(activeOrders.rows[0].count) },
            timestamp: ts(), requestId: reqId()
        });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// POST /api/admin/hubs
export const createHub = async (req: AuthRequest, res: Response) => {
    try {
        const { name, cityId, address, latitude, longitude, managerName, managerPhone, pincodesCovered, sameDayCutoffTime, nextDayCutoffTime } = req.body;
        const result = await pool.query(
            `INSERT INTO hubs (name, city_id, address, latitude, longitude, manager_name, manager_phone, pincodes_covered, same_day_cutoff_time, next_day_cutoff_time)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [name, cityId, address, latitude, longitude, managerName, managerPhone, pincodesCovered, sameDayCutoffTime, nextDayCutoffTime]
        );
        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address)
             VALUES ($1,$2,'create_hub','hub',$3,$4,$5)`,
            [req.user!.userId, req.user!.role, result.rows[0].id, JSON.stringify({ before: {}, after: { name, cityId } }), req.ip ?? '']
        );
        res.status(201).json({ success: true, data: result.rows[0], message: 'Hub created', timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// PATCH /api/admin/hubs/:hubId
export const updateHub = async (req: AuthRequest, res: Response) => {
    try {
        const { hubId } = req.params;
        const updates = req.body as Record<string, unknown>;
        const fields = Object.entries(updates).map(([k, _], i) => `${k} = $${i + 1}`).join(', ');
        const values = Object.values(updates);
        await pool.query(`UPDATE hubs SET ${fields}, updated_at = NOW() WHERE id = $${values.length + 1}`, [...values, hubId]);
        res.status(200).json({ success: true, data: { hubId }, message: 'Hub updated', timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// POST /api/admin/hubs/:hubId/pause
export const pauseHub = async (req: AuthRequest, res: Response) => {
    try {
        const { hubId } = req.params;
        const { reason } = req.body as { reason: string };
        if (!reason) return errResp(res, 400, 'VALIDATION_ERROR', 'Pause reason is required');

        await pool.query(`UPDATE hubs SET is_paused = true, pause_reason = $1, updated_at = NOW() WHERE id = $2`, [reason, hubId]);
        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address, reason)
             VALUES ($1,$2,'pause_hub','hub',$3,$4,$5,$6)`,
            [req.user!.userId, req.user!.role, hubId, JSON.stringify({ before: { is_paused: false }, after: { is_paused: true, reason } }), req.ip ?? '', reason]
        );
        res.status(200).json({ success: true, data: { hubId, paused: true }, message: 'Hub paused', timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// POST /api/admin/hubs/:hubId/resume
export const resumeHub = async (req: AuthRequest, res: Response) => {
    try {
        const { hubId } = req.params;
        await pool.query(`UPDATE hubs SET is_paused = false, pause_reason = NULL, updated_at = NOW() WHERE id = $1`, [hubId]);
        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address)
             VALUES ($1,$2,'resume_hub','hub',$3,$4,$5)`,
            [req.user!.userId, req.user!.role, hubId, JSON.stringify({ before: { is_paused: true }, after: { is_paused: false } }), req.ip ?? '']
        );
        res.status(200).json({ success: true, data: { hubId, paused: false }, message: 'Hub resumed', timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// GET /api/admin/hubs/:hubId/go-live-checklist
export const getGoLiveChecklist = async (req: AuthRequest, res: Response) => {
    try {
        const { hubId } = req.params;
        const [hubRes, vendorsRes, ordersRes] = await Promise.all([
            pool.query(`SELECT id, name, manager_name, manager_phone, same_day_cutoff_time, next_day_cutoff_time FROM hubs WHERE id = $1`, [hubId]),
            pool.query(`SELECT COUNT(*) FROM vendors WHERE hub_id = $1 AND is_active = true`, [hubId]),
            pool.query(`SELECT COUNT(*) FROM orders WHERE hub_id = $1 AND status = 'DELIVERED' LIMIT 1`, [hubId])
        ]);

        if (!hubRes.rows.length) return errResp(res, 404, 'HUB_NOT_FOUND', 'Hub not found');

        const hub = hubRes.rows[0];
        const vendorCount = Number(vendorsRes.rows[0].count);
        const testOrderCount = Number(ordersRes.rows[0].count);

        const checklist = {
            hubConfigured: !!(hub.manager_name && hub.manager_phone),
            vendorsMapped: vendorCount >= 1,
            skusPriced: false,                   // requires sku pricing table check
            capacitySet: vendorCount > 0,
            testOrderCompleted: testOrderCount > 0,
            gstValidated: false,                 // requires GST config field
            isReadyToLive: vendorCount >= 1 && !!(hub.manager_name)
        };

        res.status(200).json({ success: true, data: { hubId, checklist }, timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};
