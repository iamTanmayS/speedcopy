import type { Request, Response } from 'express';
import pool from '../config/db/db.js';
import { generateTokens } from '../utils/jwt.util.js';
import { randomUUID } from 'crypto';
import { sendOTP } from '../services/email.service.js';
import type { AuthenticatedUser, OTPRequest, VerifyOTPRequest, LoginResponse, LoginRequest } from '../types/auth.js';
import type { ApiSuccess, ApiError } from '../types/shared.js';

import bcrypt from 'bcrypt';

const ts = () => new Date().toISOString();
const rid = () => randomUUID();

export function formatUserObject(row: any): AuthenticatedUser {
    return {
        id: row.id,
        name: row.name || 'User',
        email: row.email,
        phone: row.phone_number || '',
        role: row.role || 'customer',
        permissions: row.permissions ?? []
    };
}

/**
 * Unified Login Controller
 * Supports:
 * 1. Admin/Staff: Phone + Password
 * 2. Customer: Email -> OTP
 */
export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const { email, phone, password } = req.body;
    
    // 1. Password-based Login (Admin / Sub-Admin / Vendor)
    if (phone && password) {
        try {
            const userResult = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone]);
            if (!userResult.rows.length) {
                return res.status(401).json({ success: false, error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid phone or password' }, timestamp: ts(), requestId: rid() });
            }

            const user = userResult.rows[0];
            const isMatch = await bcrypt.compare(password, user.password_hash || '');
            
            if (!isMatch) {
                return res.status(401).json({ success: false, error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid phone or password' }, timestamp: ts(), requestId: rid() });
            }

            if (!user.is_active) {
                return res.status(403).json({ success: false, error: { code: 'AUTH_ACCOUNT_DISABLED', message: 'Account is deactivated' }, timestamp: ts(), requestId: rid() });
            }

            // Success: Direct Login (No OTP for Admin Dashboard)
            const tokens = generateTokens({ userId: user.id, role: user.role ?? 'customer', permissions: user.permissions ?? [] });
            
            return res.status(200).json({ 
                success: true, 
                data: { 
                    tokens: { accessToken: tokens.accessToken }, 
                    user: formatUserObject(user) 
                }, 
                message: 'Login successful', 
                timestamp: ts(), 
                requestId: rid() 
            });
        } catch (err: any) {
            console.error('Password Login error:', err);
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message }, timestamp: ts(), requestId: rid() });
        }
    }

    // 2. OTP-based Login (Customer)
    if (email) {
        try {
            // Check if user exists, if not create a placeholder
            let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            
            if (!userResult.rows.length) {
                userResult = await pool.query(
                    `INSERT INTO users (email, provider, role) VALUES ($1, 'email', 'customer') RETURNING *`,
                    [email]
                );
            }

            const user = userResult.rows[0];
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

            await pool.query(
                'UPDATE users SET otp_code = $1, otp_expiry = $2 WHERE id = $3',
                [otpCode, otpExpiry, user.id]
            );

            await sendOTP(email, otpCode);

            return res.status(200).json({ 
                success: true, 
                data: { email }, 
                message: 'OTP sent successfully', 
                timestamp: ts(), 
                requestId: rid() 
            });
        } catch (err: any) {
            console.error('OTP Request error:', err);
            return res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message }, timestamp: ts(), requestId: rid() });
        }
    }

    // 3. Missing Fields
    return res.status(400).json({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Email or Phone Number is required' }, 
        timestamp: ts(), 
        requestId: rid() 
    });
};

/**
 * Verify OTP and login
 */
export const verifyOTP = async (req: Request<{}, {}, VerifyOTPRequest>, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        const e: ApiError = { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and OTP are required' }, timestamp: ts(), requestId: rid() };
        res.status(400).json(e); return;
    }

    try {
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND otp_code = $2 AND otp_expiry > NOW()',
            [email, otp]
        );

        if (!userResult.rows.length) {
            const e: ApiError = { success: false, error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid or expired OTP' }, timestamp: ts(), requestId: rid() };
            res.status(401).json(e); return;
        }

        const user = userResult.rows[0];

        // Clear OTP after successful verify
        await pool.query('UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = $1', [user.id]);

        // Generate JWT
        const tokens = generateTokens({ userId: user.id, role: user.role ?? 'customer', permissions: user.permissions ?? [] });
        
        const resp: ApiSuccess<LoginResponse> = { 
            success: true, 
            data: { 
                tokens: { accessToken: tokens.accessToken }, 
                user: formatUserObject(user) 
            }, 
            message: 'Login successful', 
            timestamp: ts(), 
            requestId: rid() 
        };
        res.status(200).json(resp);

    } catch (err: any) {
        console.error('Verify error:', err);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: err.message }, timestamp: ts(), requestId: rid() });
    }
};

/**
 * Kept register as placeholder to avoid breaking potential bulk register flows, 
 * but redirects to login logic now if needed.
 */
export const register = login;

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
