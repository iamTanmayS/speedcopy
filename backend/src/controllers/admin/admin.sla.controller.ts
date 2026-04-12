import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import type { SLAPolicy, SLAViolation } from '../../types/admin.js';
import type { ApiSuccess } from '../../types/shared.js';
import { randomUUID } from 'crypto';

/**
 * List all SLA policies
 */
export const listSLAPolicies = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM sla_policies ORDER BY created_at DESC');
        
        const resp: ApiSuccess<SLAPolicy[]> = {
            success: true,
            data: result.rows.map(row => ({
                id: row.id,
                name: row.name,
                category: row.category,
                deliveryMode: row.delivery_mode,
                acceptanceWindowMins: row.acceptance_window_mins,
                productionWindowMins: row.production_window_mins,
                dispatchWindowMins: row.dispatch_window_mins,
                deliveryWindowMins: row.delivery_window_mins,
                isActive: row.is_active
            })),
            timestamp: new Date().toISOString(),
            requestId: randomUUID()
        };
        
        res.status(200).json(resp);
    } catch (error) {
        console.error('List SLA policies error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};

/**
 * List active SLA violations (At-risk orders)
 */
export const listSLAAtRiskOrders = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                sv.*,
                o.order_number,
                o.status as order_status,
                p.name as policy_name
            FROM sla_violations sv
            JOIN orders o ON o.id = sv.order_id
            LEFT JOIN sla_policies p ON p.id = sv.policy_id
            WHERE sv.resolved_at IS NULL
            ORDER BY 
                CASE 
                    WHEN sv.severity = 'high' THEN 1 
                    WHEN sv.severity = 'medium' THEN 2 
                    ELSE 3 
                END,
                sv.breached_at ASC
        `);
        
        const resp: ApiSuccess<any[]> = {
            success: true,
            data: result.rows,
            timestamp: new Date().toISOString(),
            requestId: randomUUID()
        };
        
        res.status(200).json(resp);
    } catch (error) {
        console.error('List SLA at-risk orders error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};

/**
 * Update SLA Policy
 */
export const updateSLAPolicy = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { acceptanceWindowMins, productionWindowMins, dispatchWindowMins, deliveryWindowMins, isActive } = req.body;
    
    try {
        await pool.query(`
            UPDATE sla_policies 
            SET 
                acceptance_window_mins = COALESCE($1, acceptance_window_mins),
                production_window_mins = COALESCE($2, production_window_mins),
                dispatch_window_mins = COALESCE($3, dispatch_window_mins),
                delivery_window_mins = COALESCE($4, delivery_window_mins),
                is_active = COALESCE($5, is_active),
                updated_at = NOW()
            WHERE id = $6
        `, [acceptanceWindowMins, productionWindowMins, dispatchWindowMins, deliveryWindowMins, isActive, id]);
        
        res.status(200).json({ success: true, message: 'SLA Policy updated successfully' });
    } catch (error) {
        console.error('Update SLA policy error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};
