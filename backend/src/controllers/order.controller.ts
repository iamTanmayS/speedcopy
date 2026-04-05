import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import pool from '../config/db/db.js';
import type { Order, OrderListResponse } from '../types/index.js';

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { items, deliveryAddress, hubId } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // MVP mock insertion
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { id: "mock-order-uuid" }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // MVP mock retrieval
        const mockResponse: OrderListResponse = {
            orders: [],
            total: 0
        };

        res.status(200).json({ success: true, data: mockResponse });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
