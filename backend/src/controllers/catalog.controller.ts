import type { Request, Response } from 'express';
import pool from '../config/db/db.js';

export const getCatalog = async (req: Request, res: Response) => {
    try {
        // MVP MOCK
        res.status(200).json({
            success: true,
            data: {
                categories: [],
                products: [],
                skus: []
            }
        });
    } catch (error) {
        console.error('Fetch catalog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
