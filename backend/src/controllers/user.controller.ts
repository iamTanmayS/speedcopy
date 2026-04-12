import type { Response } from 'express';
import pool from '../config/db/db.js';
import { randomUUID } from 'crypto';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import type { CustomerProfile } from '../types/auth.js';
import type { ApiSuccess, ApiError } from '../types/shared.js';

const ts = () => new Date().toISOString();
const rid = () => randomUUID();

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            const e: ApiError = { success: false, error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' }, timestamp: ts(), requestId: rid() };
            res.status(401).json(e); return;
        }
        const result = await pool.query(
            `SELECT id, name, email, phone_number as phone, city, is_active, created_at FROM users WHERE id = $1`, [userId]
        );
        if (!result.rows.length) {
            const e: ApiError = { success: false, error: { code: 'NOT_FOUND', message: 'User not found' }, timestamp: ts(), requestId: rid() };
            res.status(404).json(e); return;
        }
        const row = result.rows[0];
        const user: CustomerProfile = { id: row.id, name: row.name || 'User', email: row.email, phone: row.phone || '', city: row.city ?? undefined, isActive: row.is_active ?? true, createdAt: row.created_at ? new Date(row.created_at).toISOString() : ts() };
        const resp: ApiSuccess<CustomerProfile> = { success: true, data: user, timestamp: ts(), requestId: rid() };
        res.status(200).json(resp);
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }, timestamp: ts(), requestId: rid() });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            const e: ApiError = { success: false, error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' }, timestamp: ts(), requestId: rid() };
            res.status(401).json(e); return;
        }
        const { name, phone, city, email } = req.body;
        const result = await pool.query(
            `UPDATE users SET name=COALESCE($1,name), phone_number=COALESCE($2,phone_number), city=COALESCE($3,city), email=COALESCE($4,email), updated_at=NOW() WHERE id=$5
             RETURNING id, name, email, phone_number as phone, city, is_active, created_at`,
            [name ?? null, phone ?? null, city ?? null, email ?? null, userId]
        );
        const row = result.rows[0];
        const user: CustomerProfile = { id: row.id, name: row.name || 'User', email: row.email, phone: row.phone || '', city: row.city ?? undefined, isActive: row.is_active ?? true, createdAt: row.created_at ? new Date(row.created_at).toISOString() : ts() };
        const resp: ApiSuccess<CustomerProfile> = { success: true, data: user, message: 'Profile updated', timestamp: ts(), requestId: rid() };
        res.status(200).json(resp);
    } catch (err: any) {
        console.error('Update profile error:', err);
        if (err.code === '23505') {
            res.status(400).json({ success: false, error: { code: 'CONFLICT', message: 'This mobile number is already connected to another account.' }, timestamp: ts(), requestId: rid() });
            return;
        }
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }, timestamp: ts(), requestId: rid() });
    }
};
