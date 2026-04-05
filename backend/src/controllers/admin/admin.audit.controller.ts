import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import { randomUUID } from 'crypto';

const ts = () => new Date().toISOString();
const reqId = () => randomUUID();
const errResp = (res: Response, status: number, code: string, msg: string) =>
    res.status(status).json({ success: false, error: { code, message: msg }, timestamp: ts(), requestId: reqId() });

// GET /api/admin/audit-logs?adminId=&entityType=&action=&page=
export const listAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
        const { adminId, entityType, action, page = '1', pageSize = '50', dateFrom, dateTo } = req.query as Record<string, string>;
        const offset = (Number(page) - 1) * Number(pageSize);
        const conditions: string[] = [];
        const params: unknown[] = [];
        let i = 1;

        if (adminId) { conditions.push(`admin_id = $${i++}`); params.push(adminId); }
        if (entityType) { conditions.push(`entity_type = $${i++}`); params.push(entityType); }
        if (action) { conditions.push(`action ilike $${i++}`); params.push(`%${action}%`); }
        if (dateFrom) { conditions.push(`acted_at >= $${i++}`); params.push(dateFrom); }
        if (dateTo) { conditions.push(`acted_at <= $${i++}`); params.push(dateTo); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [total, rows] = await Promise.all([
            pool.query(`SELECT COUNT(*) FROM admin_audit_logs ${where}`, params),
            pool.query(`SELECT * FROM admin_audit_logs ${where} ORDER BY acted_at DESC LIMIT $${i++} OFFSET $${i}`, [...params, Number(pageSize), offset])
        ]);

        res.status(200).json({
            success: true,
            data: { items: rows.rows, total: Number(total.rows[0].count), page: Number(page), pageSize: Number(pageSize) },
            timestamp: ts(), requestId: reqId()
        });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// POST /api/admin/export-jobs
export const createExportJob = async (req: AuthRequest, res: Response) => {
    try {
        const { entityType, format = 'csv', dateFrom, dateTo, filters } = req.body as {
            entityType: string; format?: string; dateFrom?: string; dateTo?: string; filters?: Record<string, unknown>;
        };

        const job = await pool.query(
            `INSERT INTO export_jobs (requested_by, entity_type, format, status, progress_percent, filters, date_from, date_to)
             VALUES ($1,$2,$3,'pending',0,$4,$5,$6) RETURNING *`,
            [req.user!.userId, entityType, format, filters ? JSON.stringify(filters) : null, dateFrom ?? null, dateTo ?? null]
        );

        res.status(201).json({ success: true, data: job.rows[0], message: 'Export job queued', timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// GET /api/admin/export-jobs
export const listExportJobs = async (req: AuthRequest, res: Response) => {
    try {
        const rows = await pool.query(
            `SELECT * FROM export_jobs WHERE requested_by = $1 ORDER BY requested_at DESC LIMIT 50`,
            [req.user!.userId]
        );
        res.status(200).json({ success: true, data: { items: rows.rows }, timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};

// GET /api/admin/export-jobs/:jobId
export const getExportJobStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId } = req.params;
        const result = await pool.query(`SELECT * FROM export_jobs WHERE id = $1 AND requested_by = $2`, [jobId, req.user!.userId]);
        if (!result.rows.length) return errResp(res, 404, 'NOT_FOUND', 'Export job not found');
        res.status(200).json({ success: true, data: result.rows[0], timestamp: ts(), requestId: reqId() });
    } catch (err) { return errResp(res, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error'); }
};
