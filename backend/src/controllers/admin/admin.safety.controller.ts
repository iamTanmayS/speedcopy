import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import type { PlatformConfig } from '../../types/admin.js';
import type { ApiSuccess } from '../../types/shared.js';
import { randomUUID } from 'crypto';

/**
 * Get all platform configuration and safety flags
 */
export const listPlatformSafetyFlags = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM platform_config ORDER BY updated_at DESC');
        
        const resp: ApiSuccess<PlatformConfig[]> = {
            success: true,
            data: result.rows.map(row => ({
                key: row.key,
                value: row.value,
                description: row.description,
                updatedBy: row.updated_by,
                updatedAt: row.updated_at
            })),
            timestamp: new Date().toISOString(),
            requestId: randomUUID()
        };
        
        res.status(200).json(resp);
    } catch (error) {
        console.error('List safety flags error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};

/**
 * Update a specific safety flag or config key
 */
export const updateSafetyFlag = async (req: AuthRequest, res: Response) => {
    const { key } = req.params;
    const { value, description } = req.body;
    
    try {
        await pool.query(`
            INSERT INTO platform_config (key, value, description, updated_by, updated_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (key) DO UPDATE SET
                value = EXCLUDED.value,
                description = COALESCE(EXCLUDED.description, platform_config.description),
                updated_by = EXCLUDED.updated_by,
                updated_at = NOW()
        `, [key, JSON.stringify(value), description, req.user?.userId]);
        
        res.status(200).json({ success: true, message: `Flag ${key} updated successfully` });
    } catch (error) {
        console.error('Update safety flag error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};

/**
 * Specialized: Pause/Resume Hub
 */
export const toggleHubStatus = async (req: AuthRequest, res: Response) => {
    const { hubId } = req.params;
    const { isPaused, reason } = req.body;
    
    try {
        await pool.query(`
            UPDATE hubs 
            SET is_paused = $1, pause_reason = $2, updated_at = NOW()
            WHERE id = $3
        `, [isPaused, reason, hubId]);
        
        res.status(200).json({ success: true, message: `Hub status updated to ${isPaused ? 'Paused' : 'Active'}` });
    } catch (error) {
        console.error('Toggle hub status error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};
