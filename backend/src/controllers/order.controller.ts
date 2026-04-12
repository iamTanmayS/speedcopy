import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import pool from '../config/db/db.js';
import type { Order, OrderListResponse } from '../types/index.js';

export const createOrder = async (req: AuthRequest, res: Response) => {
    const client = await pool.connect();
    try {
        const userId = req.user?.userId;
        const { items, deliveryAddress, subtotal, deliveryFee, discountAmount, totalAmount } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const orderNumber = `SC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

        await client.query('BEGIN');

        // 1. Insert Order
        const orderInsertResult = await client.query(
            `INSERT INTO orders (
                order_number, customer_id, status, delivery_address, 
                subtotal, delivery_fee, discount_amount, total_amount
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [
                orderNumber, userId, 'CREATED', JSON.stringify(deliveryAddress), 
                subtotal || 0, deliveryFee || 0, discountAmount || 0, totalAmount || 0
            ]
        );

        const orderId = orderInsertResult.rows[0].id;

        // 2. Insert Order Items
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (
                    order_id, product_id, sku_id, product_name, sku_name, 
                    quantity, file_id, unit_price, total_price, delivery_mode
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    orderId, item.productId, item.skuId, item.productName || item.title, item.skuName || item.skuTitle,
                    item.quantity || 1, item.fileId, item.unitPrice || 0, item.totalPrice || 0, item.deliveryMode || 'next_day'
                ]
            );
        }

        // 3. Log Initial Status
        await client.query(
            `INSERT INTO order_status_events (
                order_id, to_status, note, triggered_by, triggered_by_role
            ) VALUES ($1, $2, $3, $4, $5)`,
            [orderId, 'CREATED', 'Order placed successfully', userId, 'customer']
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { id: orderId, orderNumber }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const result = await pool.query(
            'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        const mockResponse: OrderListResponse = {
            orders: result.rows,
            total: result.rowCount || 0
        };

        res.status(200).json({ success: true, data: mockResponse });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Fetch order basic info
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND customer_id = $2',
            [id, userId]
        );

        if (orderResult.rowCount === 0) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        const order = orderResult.rows[0];

        // Fetch status events
        const eventsResult = await pool.query(
            'SELECT * FROM order_status_events WHERE order_id = $1 ORDER BY timestamp ASC',
            [id]
        );

        // Fetch items
        const itemsResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [id]
        );

        res.status(200).json({
            success: true,
            data: {
                id: order.id,
                orderNumber: order.order_number,
                customerId: order.customer_id,
                status: order.status,
                deliveryAddress: order.delivery_address,
                subtotal: order.subtotal,
                deliveryFee: order.delivery_fee,
                discountAmount: order.discount_amount,
                totalAmount: order.total_amount,
                createdAt: order.created_at,
                updatedAt: order.updated_at,
                items: itemsResult.rows.map((item: any) => ({
                    id: item.id,
                    productId: item.product_id,
                    skuId: item.sku_id,
                    productName: item.product_name,
                    skuName: item.sku_name,
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                    totalPrice: item.total_price,
                    deliveryMode: item.delivery_mode,
                })),
                history: eventsResult.rows.map((e: any) => ({
                    id: e.id,
                    orderId: e.order_id,
                    fromStatus: e.from_status,
                    toStatus: e.to_status,
                    note: e.note,
                    timestamp: e.timestamp,
                })),
            }
        });
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
