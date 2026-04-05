import type { Response } from 'express';
import pool from '../config/db/db.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

export const getBalance = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        // Calculate balance dynamically
        const result = await pool.query(
            `SELECT 
                SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) -
                SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) 
             AS balance
             FROM transactions WHERE user_id = $1 AND status = 'completed'`,
            [userId]
        );

        const balance = parseFloat(result.rows[0].balance || '0');

        res.status(200).json({ balance });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const result = await pool.query(
            `SELECT id, amount, type, description, created_at as timestamp, status
             FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addFunds = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { amount, paymentMethodId } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Mocking fund addition
        await pool.query(
            `INSERT INTO transactions (user_id, amount, type, description, status) 
             VALUES ($1, $2, 'credit', $3, 'completed')`,
            [userId, amount, 'Added funds via ' + (paymentMethodId ? 'saved card' : 'payment gateway')]
        );

        const balanceResult = await pool.query(
            `SELECT 
                SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) -
                SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) 
             AS balance
             FROM transactions WHERE user_id = $1 AND status = 'completed'`,
            [userId]
        );

        const balance = parseFloat(balanceResult.rows[0].balance || '0');

        res.status(200).json({ balance });
    } catch (error) {
        console.error('Add funds error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPaymentMethods = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const result = await pool.query(
            `SELECT id, type, details, is_default as "isDefault" 
             FROM payment_methods WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const addPaymentMethod = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { type, details } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Determine if it should be default
        const existingCount = await pool.query('SELECT COUNT(*) FROM payment_methods WHERE user_id = $1', [userId]);
        const isDefault = parseInt(existingCount.rows[0].count) === 0;

        const result = await pool.query(
            `INSERT INTO payment_methods (user_id, type, details, is_default) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, type, details, is_default as "isDefault"`,
            [userId, type, details, isDefault]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deletePaymentMethod = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        await pool.query('DELETE FROM payment_methods WHERE id = $1 AND user_id = $2', [id, userId]);

        res.status(204).send();
    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const setDefaultPaymentMethod = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        // Reset all defaults for user
        await pool.query('UPDATE payment_methods SET is_default = false WHERE user_id = $1', [userId]);

        // Set the new default
        const result = await pool.query(
            `UPDATE payment_methods SET is_default = true WHERE id = $1 AND user_id = $2 
             RETURNING id, type, details, is_default as "isDefault"`,
            [id, userId]
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Set default payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
