import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import { randomUUID } from 'crypto';

const ts = () => new Date().toISOString();
const reqId = () => randomUUID();
const errResp = (res: Response, s: number, code: string, msg: string) =>
    res.status(s).json({ success: false, error: { code, message: msg }, timestamp: ts(), requestId: reqId() });

// GET /api/admin/payouts
export const listPayouts = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId, status, page = '1', pageSize = '20' } = req.query as Record<string, string>;
        const offset = (Number(page) - 1) * Number(pageSize);
        const conds: string[] = []; const params: unknown[] = []; let i = 1;
        if (vendorId) { conds.push(`vendor_id = $${i++}`); params.push(vendorId); }
        if (status) { conds.push(`status = $${i++}`); params.push(status); }
        const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
        const [tot, rows] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM vendor_payout_records ${where}`, params),
            pool.query(`SELECT * FROM vendor_payout_records ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`, [...params, Number(pageSize), offset])
        ]);
        res.json({ success: true, data: { items: rows.rows, total: Number(tot.rows[0].count), page: Number(page), pageSize: Number(pageSize) }, timestamp: ts(), requestId: reqId() });
    } catch { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// GET /api/admin/payouts/:vendorId/summary
export const getVendorPayoutSummary = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId } = req.params;
        const result = await pool.query(`
            SELECT vendor_id,
                COALESCE(SUM(net_payable) FILTER (WHERE status='pending'),0) AS pending_amount,
                MAX(paid_at) FILTER (WHERE status='paid') AS last_paid_at,
                COALESCE(SUM(net_payable) FILTER (WHERE status='paid'),0) AS total_lifetime_paid,
                COALESCE(SUM(net_payable) FILTER (WHERE status='on_hold'),0) AS on_hold_amount
            FROM vendor_payout_records WHERE vendor_id=$1 GROUP BY vendor_id`, [vendorId]
        );
        const r = result.rows[0] ?? { pending_amount: 0, last_paid_at: null, total_lifetime_paid: 0, on_hold_amount: 0 };
        res.json({ success: true, data: { vendorId, pendingAmount: Number(r.pending_amount), lastPaidAt: r.last_paid_at, totalLifetimePaid: Number(r.total_lifetime_paid), onHoldAmount: Number(r.on_hold_amount) }, timestamp: ts(), requestId: reqId() });
    } catch { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// GET /api/admin/payouts/batches
export const listSettlementBatches = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId, status, page = '1', pageSize = '20' } = req.query as Record<string, string>;
        const offset = (Number(page) - 1) * Number(pageSize);
        const conds: string[] = []; const params: unknown[] = []; let i = 1;
        if (vendorId) { conds.push(`vendor_id = $${i++}`); params.push(vendorId); }
        if (status) { conds.push(`status = $${i++}`); params.push(status); }
        const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
        const [tot, rows] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM vendor_settlement_batches ${where}`, params),
            pool.query(`SELECT * FROM vendor_settlement_batches ${where} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i}`, [...params, Number(pageSize), offset])
        ]);
        res.json({ success: true, data: { items: rows.rows, total: Number(tot.rows[0].count), page: Number(page), pageSize: Number(pageSize) }, timestamp: ts(), requestId: reqId() });
    } catch { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// POST /api/admin/payouts/batches
export const createSettlementBatch = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId, cycle, periodFrom, periodTo, bankAccountNumber, bankIFSC } = req.body;
        const payoutsRes = await pool.query(
            `SELECT id, net_payable, platform_fee, tds_deducted FROM vendor_payout_records WHERE vendor_id=$1 AND status='pending' AND created_at BETWEEN $2 AND $3`,
            [vendorId, periodFrom, periodTo]
        );
        if (!payoutsRes.rows.length) return errResp(res, 400, 'VALIDATION_ERROR', 'No pending payouts found for this period');
        const payoutIds = payoutsRes.rows.map(r => r.id);
        const gross = payoutsRes.rows.reduce((s, r) => s + Number(r.net_payable) + Number(r.platform_fee), 0);
        const fee = payoutsRes.rows.reduce((s, r) => s + Number(r.platform_fee), 0);
        const tds = payoutsRes.rows.reduce((s, r) => s + Number(r.tds_deducted), 0);
        const net = payoutsRes.rows.reduce((s, r) => s + Number(r.net_payable), 0);
        const ref = `BATCH-${vendorId.slice(0, 8).toUpperCase()}-${Date.now()}`;
        const batch = await pool.query(
            `INSERT INTO vendor_settlement_batches (batch_reference,cycle,period_from,period_to,vendor_id,payout_record_ids,gross_amount,total_platform_fee,total_tds,net_amount,bank_account_number,bank_ifsc) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [ref, cycle, periodFrom, periodTo, vendorId, payoutIds, gross, fee, tds, net, bankAccountNumber ?? null, bankIFSC ?? null]
        );
        await pool.query(`UPDATE vendor_payout_records SET status='in_settlement', settlement_batch_id=$1 WHERE id=ANY($2)`, [batch.rows[0].id, payoutIds]);
        await pool.query(`INSERT INTO admin_audit_logs(admin_id,admin_name,action,entity_type,entity_id,changes,ip_address) VALUES($1,$2,'create_settlement_batch','vendor_settlement_batch',$3,$4,$5)`,
            [req.user!.userId, req.user!.role, batch.rows[0].id, JSON.stringify({ after: { vendorId, net, count: payoutIds.length } }), req.ip ?? '']);
        res.status(201).json({ success: true, data: batch.rows[0], message: 'Settlement batch created', timestamp: ts(), requestId: reqId() });
    } catch { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// POST /api/admin/payouts/batches/:batchId/process
export const processSettlementBatch = async (req: AuthRequest, res: Response) => {
    try {
        const { batchId } = req.params;
        const { transactionReference, processedAt, reason } = req.body;
        const b = await pool.query(`SELECT * FROM vendor_settlement_batches WHERE id=$1`, [batchId]);
        if (!b.rows.length) return errResp(res, 404, 'NOT_FOUND', 'Batch not found');
        if (b.rows[0].status !== 'approved') return errResp(res, 400, 'VALIDATION_ERROR', 'Batch must be approved first');
        const ids: string[] = b.rows[0].payout_record_ids;
        await pool.query(`UPDATE vendor_settlement_batches SET status='paid', transaction_reference=$1, processed_at=$2, updated_at=NOW() WHERE id=$3`, [transactionReference, processedAt, batchId]);
        await pool.query(`UPDATE vendor_payout_records SET status='paid', paid_at=$1, transaction_reference=$2, updated_at=NOW() WHERE id=ANY($3)`, [processedAt, transactionReference, ids]);
        await pool.query(`INSERT INTO admin_audit_logs(admin_id,admin_name,action,entity_type,entity_id,changes,ip_address,reason) VALUES($1,$2,'process_batch','vendor_settlement_batch',$3,$4,$5,$6)`,
            [req.user!.userId, req.user!.role, batchId, JSON.stringify({ after: { status: 'paid', transactionReference } }), req.ip ?? '', reason]);
        res.json({ success: true, data: { batchId, status: 'paid', transactionReference }, timestamp: ts(), requestId: reqId() });
    } catch { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};
