import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db/db.js';
import { generateTokens } from '../utils/jwt.util.js';
import { randomUUID } from 'crypto';
import type { AuthenticatedUser, LoginRequest, LoginResponse } from '../types/auth.js';
import type { ApiSuccess, ApiError } from '../types/shared.js';

const ts = () => new Date().toISOString();
const rid = () => randomUUID();

export function formatUserObject(row: any): AuthenticatedUser {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone_number || '',
        role: row.role || 'customer',
        permissions: row.permissions ?? []
    };
}

export const register = async (req: Request, res: Response) => {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
        const e: ApiError = { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name, phone, and password are required' }, timestamp: ts(), requestId: rid() };
        res.status(400).json(e); return;
    }
    try {
        const existing = await pool.query('SELECT id FROM users WHERE phone_number = $1', [phone]);
        if (existing.rows.length) {
            const e: ApiError = { success: false, error: { code: 'VALIDATION_ERROR', message: 'Phone number already in use' }, timestamp: ts(), requestId: rid() };
            res.status(400).json(e); return;
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            `INSERT INTO users (name, phone_number, password_hash, provider, email_verified) VALUES ($1,$2,$3,'phone',true) RETURNING *`,
            [name, phone, passwordHash]
        );
        const user = newUser.rows[0];
        const tokens = generateTokens({ userId: user.id, role: user.role ?? 'customer', permissions: user.permissions ?? [] });
        const resp: ApiSuccess<LoginResponse> = { success: true, data: { tokens: { accessToken: tokens.accessToken }, user: formatUserObject(user) }, message: 'Registration successful', timestamp: ts(), requestId: rid() };
        res.status(201).json(resp);
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }, timestamp: ts(), requestId: rid() });
    }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
        const e: ApiError = { success: false, error: { code: 'VALIDATION_ERROR', message: 'Phone and password are required' }, timestamp: ts(), requestId: rid() };
        res.status(400).json(e); return;
    }
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone]);
        if (!userResult.rows.length) {
            const e: ApiError = { success: false, error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid credentials' }, timestamp: ts(), requestId: rid() };
            res.status(401).json(e); return;
        }
        const user = userResult.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            const e: ApiError = { success: false, error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid credentials' }, timestamp: ts(), requestId: rid() };
            res.status(401).json(e); return;
        }
        const tokens = generateTokens({ userId: user.id, role: user.role ?? 'customer', permissions: user.permissions ?? [] });
        const resp: ApiSuccess<LoginResponse> = { success: true, data: { tokens: { accessToken: tokens.accessToken }, user: formatUserObject(user) }, message: 'Login successful', timestamp: ts(), requestId: rid() };
        res.status(200).json(resp);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }, timestamp: ts(), requestId: rid() });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) { res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Refresh token required' }, timestamp: ts(), requestId: rid() }); return; }
    try {
        const { verifyRefreshToken } = await import('../utils/jwt.util.js');
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) { res.status(401).json({ success: false, error: { code: 'AUTH_REFRESH_TOKEN_INVALID', message: 'Invalid or expired refresh token' }, timestamp: ts(), requestId: rid() }); return; }
        const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [payload.userId]);
        if (!userResult.rows.length) { res.status(401).json({ success: false, error: { code: 'AUTH_UNAUTHORIZED', message: 'User not found' }, timestamp: ts(), requestId: rid() }); return; }
        const tokens = generateTokens({ userId: payload.userId });
        res.status(200).json({ success: true, data: tokens, timestamp: ts(), requestId: rid() });
    } catch (err) {
        console.error('Refresh error:', err);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' }, timestamp: ts(), requestId: rid() });
    }
};
