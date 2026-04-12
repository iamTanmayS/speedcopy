import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import type { ApiSuccess } from '../../types/shared.js';
import { randomUUID } from 'crypto';

/**
 * List all coupons
 */
export const listCoupons = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
        
        const resp: ApiSuccess<any[]> = {
            success: true,
            data: result.rows,
            timestamp: new Date().toISOString(),
            requestId: randomUUID()
        };
        
        res.status(200).json(resp);
    } catch (error) {
        console.error('List coupons error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};

/**
 * Create a new coupon
 */
export const createCoupon = async (req: AuthRequest, res: Response) => {
    const { 
        code, description, discountType, discountValue, 
        minOrderValue, maxDiscount, usageLimit, usagePerUser, 
        startsAt, expiresAt 
    } = req.body;
    
    try {
        const result = await pool.query(`
            INSERT INTO coupons (
                code, description, discount_type, discount_value, 
                min_order_value, max_discount, usage_limit, usage_per_user, 
                starts_at, expires_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            code.toUpperCase(), description, discountType, discountValue, 
            minOrderValue || 0, maxDiscount, usageLimit, usagePerUser || 1, 
            startsAt, expiresAt
        ]);
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, error: { code: 'DUPLICATE', message: 'Coupon code already exists' } });
        }
        console.error('Create coupon error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};

/**
 * Toggle coupon status
 */
export const toggleCoupon = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    
    try {
        await pool.query('UPDATE coupons SET is_active = $1, updated_at = NOW() WHERE id = $2', [isActive, id]);
        res.status(200).json({ success: true, message: 'Coupon status updated' });
    } catch (error) {
        console.error('Toggle coupon error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};
