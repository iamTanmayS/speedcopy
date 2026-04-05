import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import pool from '../config/db/db.js';
import type { VendorDashboardSummary } from '../types/index.js';

export const getVendorDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const vendorId = req.user?.userId; // Assuming vendor uses user auth for MVP
        if (!vendorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // MVP mock response
        const mockDashboard: VendorDashboardSummary = {
            vendorId,
            todayAssigned: 0,
            todayCompleted: 0,
            pendingAcceptanceOrders: [],
            inProductionOrders: []
        };

        res.status(200).json({ success: true, data: mockDashboard });
    } catch (error) {
        console.error('Dashboard fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const vendorId = req.user?.userId;
        const { orderId } = req.params;
        const { status, action } = req.body;

        if (!vendorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        res.status(200).json({ success: true, message: `Order updated to ${status || action}` });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
