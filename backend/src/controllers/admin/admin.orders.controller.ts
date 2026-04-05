import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import { randomUUID } from 'crypto';

const ts = () => new Date().toISOString();
const reqId = () => randomUUID();
const errResp = (res: Response, status: number, code: string, message: string) =>
    res.status(status).json({ success: false, error: { code, message }, timestamp: ts(), requestId: reqId() });

// GET /api/admin/orders?page=1&status=&vendorId=&hubId=&dateFrom=&dateTo=
export const listOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { page = '1', pageSize = '20', status, vendorId, hubId, dateFrom, dateTo } = req.query as Record<string, string>;
        const offset = (Number(page) - 1) * Number(pageSize);
        const conditions: string[] = [];
        const params: unknown[] = [];
        let i = 1;

        if (status) { conditions.push(`o.status = $${i++}`); params.push(status); }
        if (vendorId) { conditions.push(`o.vendor_id = $${i++}`); params.push(vendorId); }
        if (hubId) { conditions.push(`o.hub_id = $${i++}`); params.push(hubId); }
        if (dateFrom) { conditions.push(`o.created_at >= $${i++}`); params.push(dateFrom); }
        if (dateTo) { conditions.push(`o.created_at <= $${i++}`); params.push(dateTo); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [totalRes, rows] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM orders o ${where}`, params),
            pool.query(`
                SELECT o.id, o.order_number, o.customer_id, o.vendor_id, o.hub_id,
                       o.status, o.delivery_mode, o.total_amount, o.paid_amount,
                       o.estimated_delivery, o.created_at,
                       u.name as customer_name, u.phone_number as customer_phone
                FROM orders o
                LEFT JOIN users u ON u.id = o.customer_id
                ${where}
                ORDER BY o.created_at DESC LIMIT $${i++} OFFSET $${i}`,
                [...params, Number(pageSize), offset])
        ]);

        res.status(200).json({
            success: true,
            data: { items: rows.rows, total: Number(totalRes.rows[0].count), page: Number(page), pageSize: Number(pageSize) },
            timestamp: ts(), requestId: reqId()
        });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// GET /api/admin/orders/:orderId
export const getOrderDetail = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const [orderRes, itemsRes, historyRes, refundRes] = await Promise.all([
            pool.query(`SELECT o.*, u.name as customer_name, u.phone_number as customer_phone FROM orders o LEFT JOIN users u ON u.id = o.customer_id WHERE o.id = $1`, [orderId]),
            pool.query(`SELECT * FROM order_items WHERE order_id = $1`, [orderId]),
            pool.query(`SELECT * FROM order_status_events WHERE order_id = $1 ORDER BY timestamp ASC`, [orderId]),
            pool.query(`SELECT * FROM refund_records WHERE order_id = $1 ORDER BY initiated_at DESC LIMIT 1`, [orderId])
        ]);

        if (!orderRes.rows.length) return errResp(res, 404, 'ORDER_NOT_FOUND', 'Order not found');

        res.status(200).json({
            success: true,
            data: { ...orderRes.rows[0], items: itemsRes.rows, statusHistory: historyRes.rows, refund: refundRes.rows[0] ?? null },
            timestamp: ts(), requestId: reqId()
        });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// PATCH /api/admin/orders/:orderId/cancel
export const cancelOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body as { reason: string };
        if (!reason) return errResp(res, 400, 'VALIDATION_ERROR', 'Cancellation reason is required');

        const orderRes = await pool.query(`SELECT status FROM orders WHERE id = $1`, [orderId]);
        if (!orderRes.rows.length) return errResp(res, 404, 'ORDER_NOT_FOUND', 'Order not found');

        const currentStatus = orderRes.rows[0].status;
        const nonCancellable = ['DELIVERED', 'REFUNDED', 'CANCELLED'];
        if (nonCancellable.includes(currentStatus)) return errResp(res, 400, 'ORDER_ALREADY_CANCELLED', `Order is already ${currentStatus}`);

        await pool.query(`UPDATE orders SET status = 'CANCELLED', cancellation_reason = 'admin_cancelled', cancelled_at = NOW(), cancelled_by = $1, updated_at = NOW() WHERE id = $2`, [req.user!.userId, orderId]);
        await pool.query(
            `INSERT INTO order_status_events (id, order_id, from_status, to_status, triggered_by, triggered_by_role, reason, timestamp)
             VALUES ($1, $2, $3, 'CANCELLED', $4, 'admin', $5, NOW())`,
            [randomUUID(), orderId, currentStatus, req.user!.userId, reason]
        );
        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address, reason)
             VALUES ($1, $2, 'cancel_order', 'order', $3, $4, $5, $6)`,
            [req.user!.userId, req.user!.role, orderId, JSON.stringify({ before: { status: currentStatus }, after: { status: 'CANCELLED' } }), req.ip ?? '', reason]
        );

        res.status(200).json({ success: true, data: { orderId, status: 'CANCELLED' }, message: 'Order cancelled', timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// POST /api/admin/orders/:orderId/reprint
export const approveReprint = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body as { reason: string };

        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address, reason)
             VALUES ($1, $2, 'approve_reprint', 'order', $3, $4, $5, $6)`,
            [req.user!.userId, req.user!.role, orderId, JSON.stringify({ before: {}, after: { reprint_approved: true } }), req.ip ?? '', reason]
        );

        res.status(200).json({ success: true, data: { orderId, reprintApproved: true }, message: 'Reprint approved', timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// GET /api/admin/refunds?status=PENDING_ADMIN_APPROVAL
export const listRefunds = async (req: AuthRequest, res: Response) => {
    try {
        const { status, page = '1', pageSize = '20' } = req.query as Record<string, string>;
        const offset = (Number(page) - 1) * Number(pageSize);
        const params: unknown[] = [];
        let where = '';
        if (status) { where = 'WHERE status = $1'; params.push(status); }

        const [total, rows] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM refund_records ${where}`, params),
            pool.query(`SELECT rr.*, o.order_number, u.name as customer_name FROM refund_records rr
                        LEFT JOIN orders o ON o.id = rr.order_id
                        LEFT JOIN users u ON u.id = rr.customer_id
                        ${where} ORDER BY rr.initiated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
                [...params, Number(pageSize), offset])
        ]);

        res.status(200).json({
            success: true,
            data: { items: rows.rows, total: Number(total.rows[0].count), page: Number(page), pageSize: Number(pageSize) },
            timestamp: ts(), requestId: reqId()
        });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// POST /api/admin/refunds/:refundId/review
export const reviewRefund = async (req: AuthRequest, res: Response) => {
    try {
        const { refundId } = req.params;
        const { decision, reason, overrideAmount, overrideMethod } = req.body as { decision: 'approve' | 'reject'; reason: string; overrideAmount?: number; overrideMethod?: string };

        const newStatus = decision === 'approve' ? 'APPROVED' : 'REJECTED';
        const statusEvent = { fromStatus: 'PENDING_ADMIN_APPROVAL', toStatus: newStatus, changedBy: req.user!.userId, changedByRole: req.user!.role, note: reason, timestamp: ts() };

        await pool.query(
            `UPDATE refund_records SET status = $1, admin_note = $2, approved_amount = COALESCE($3, approved_amount), method = COALESCE($4, method),
             reviewed_by = $5, reviewed_at = NOW(), status_history = status_history || $6::jsonb WHERE id = $7`,
            [newStatus, reason, overrideAmount ?? null, overrideMethod ?? null, req.user!.userId, JSON.stringify([statusEvent]), refundId]
        );

        await pool.query(
            `INSERT INTO admin_audit_logs (admin_id, admin_name, action, entity_type, entity_id, changes, ip_address, reason)
             VALUES ($1, $2, 'review_refund', 'refund', $3, $4, $5, $6)`,
            [req.user!.userId, req.user!.role, refundId, JSON.stringify({ before: { status: 'PENDING' }, after: { status: newStatus } }), req.ip ?? '', reason]
        );

        res.status(200).json({ success: true, data: { refundId, status: newStatus }, message: `Refund ${decision}d`, timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};
