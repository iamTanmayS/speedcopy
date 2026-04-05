import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import { randomUUID } from 'crypto';

const ts = () => new Date().toISOString();
const reqId = () => randomUUID();
const errResp = (res: Response, status: number, code: string, message: string) =>
    res.status(status).json({ success: false, error: { code, message }, timestamp: ts(), requestId: reqId() });

// GET /api/admin/vendors?page=1&pageSize=20&locked=&active=&hubId=
export const listVendors = async (req: AuthRequest, res: Response) => {
    try {
        const { page = '1', pageSize = '20', locked, active, hubId, search } = req.query as Record<string, string>;
        const offset = (Number(page) - 1) * Number(pageSize);

        const conditions: string[] = [];
        const params: unknown[] = [];
        let i = 1;

        if (locked !== undefined) { conditions.push(`is_locked = $${i++}`); params.push(locked === 'true'); }
        if (active !== undefined) { conditions.push(`is_active = $${i++}`); params.push(active === 'true'); }
        if (hubId) { conditions.push(`hub_id = $${i++}`); params.push(hubId); }
        if (search) { conditions.push(`(business_name ilike $${i} OR owner_name ilike $${i++} OR phone ilike $${i++})`); params.push(`%${search}%`, `%${search}%`, `%${search}%`); i++; }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [totalRes, rows] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM vendors ${where}`, params),
            pool.query(`SELECT id, business_name, owner_name, phone, hub_id, city_id, is_available, is_active, is_locked, lock_reason, priority_score, daily_capacity, current_capacity, created_at
                        FROM vendors ${where}
                        ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`, [...params, Number(pageSize), offset])
        ]);

        res.status(200).json({
            success: true,
            data: {
                items: rows.rows,
                total: Number(totalRes.rows[0].count),
                page: Number(page), pageSize: Number(pageSize),
                hasNextPage: offset + rows.rows.length < Number(totalRes.rows[0].count),
                hasPrevPage: Number(page) > 1
            },
            timestamp: ts(), requestId: reqId()
        });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// GET /api/admin/vendors/:vendorId
export const getVendorDetail = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId } = req.params;
        const result = await pool.query(
            `SELECT v.*, 
                    COUNT(vpr.id) AS total_payouts_count,
                    COALESCE(SUM(vpr.net_payable) FILTER (WHERE vpr.status = 'paid'), 0) AS total_paid
             FROM vendors v
             LEFT JOIN vendor_payout_records vpr ON vpr.vendor_id = v.id
             WHERE v.id = $1
             GROUP BY v.id`, [vendorId]
        );
        if (!result.rows.length) return errResp(res, 404, 'VENDOR_NOT_FOUND', 'Vendor not found');
        res.status(200).json({ success: true, data: result.rows[0], timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// PATCH /api/admin/vendors/:vendorId/lock
export const lockVendor = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId } = req.params;
        const { reason } = req.body as { reason: string };
        if (!reason) return errResp(res, 400, 'VALIDATION_ERROR', 'Lock reason is required');

        await pool.query(`UPDATE vendors SET is_locked = true, lock_reason = $1, is_available = false, updated_at = NOW() WHERE id = $2`, [reason, vendorId]);
        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address, reason)
             VALUES ($1, $2, 'lock_vendor', 'vendor', $3, $4, $5, $6)`,
            [req.user!.userId, req.user!.role, vendorId, JSON.stringify({ before: { is_locked: false }, after: { is_locked: true, lock_reason: reason } }), req.ip ?? '', reason]
        );
        res.status(200).json({ success: true, data: { vendorId, locked: true, reason }, timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// PATCH /api/admin/vendors/:vendorId/unlock
export const unlockVendor = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId } = req.params;
        await pool.query(`UPDATE vendors SET is_locked = false, lock_reason = NULL, updated_at = NOW() WHERE id = $1`, [vendorId]);
        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address)
             VALUES ($1, $2, 'unlock_vendor', 'vendor', $3, $4, $5)`,
            [req.user!.userId, req.user!.role, vendorId, JSON.stringify({ before: { is_locked: true }, after: { is_locked: false } }), req.ip ?? '']
        );
        res.status(200).json({ success: true, data: { vendorId, locked: false }, timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// GET /api/admin/vendors/onboarding?status=pending
export const listOnboardingApplications = async (req: AuthRequest, res: Response) => {
    try {
        const { status = 'pending', page = '1', pageSize = '20' } = req.query as Record<string, string>;
        const offset = (Number(page) - 1) * Number(pageSize);

        const [total, rows] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM vendor_onboarding_applications WHERE status = $1`, [status]),
            pool.query(`SELECT * FROM vendor_onboarding_applications WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [status, Number(pageSize), offset])
        ]);

        res.status(200).json({
            success: true,
            data: { items: rows.rows, total: Number(total.rows[0].count), page: Number(page), pageSize: Number(pageSize) },
            timestamp: ts(), requestId: reqId()
        });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// POST /api/admin/vendors/onboarding/:applicationId/review
export const reviewOnboardingApplication = async (req: AuthRequest, res: Response) => {
    try {
        const { applicationId } = req.params;
        const { decision, reason } = req.body as { decision: 'approve' | 'reject' | 'request_documents'; reason: string };

        await pool.query(
            `UPDATE vendor_onboarding_applications SET status = $1, rejection_reason = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW() WHERE id = $4`,
            [decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'documents_required', reason, req.user!.userId, applicationId]
        );

        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address, reason)
             VALUES ($1, $2, 'review_vendor_onboarding', 'vendor_onboarding_application', $3, $4, $5, $6)`,
            [req.user!.userId, req.user!.role, applicationId, JSON.stringify({ before: { status: 'pending' }, after: { status: decision } }), req.ip ?? '', reason]
        );

        res.status(200).json({ success: true, data: { applicationId, decision }, message: `Application ${decision}d`, timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};
