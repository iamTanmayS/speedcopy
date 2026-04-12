import type { Response } from 'express';
import type { AuthRequest } from '../../middlewares/auth.middleware.js';
import pool from '../../config/db/db.js';
import type { SupportTicket, TicketMessage } from '../../types/admin.js';
import type { ApiSuccess } from '../../types/shared.js';
import { randomUUID } from 'crypto';

/**
 * List support tickets with optional filtering
 */
export const listTickets = async (req: AuthRequest, res: Response) => {
    try {
        const { status, priority, category } = req.query;
        
        let query = `
            SELECT t.*, u.name as requester_name 
            FROM support_tickets t
            JOIN users u ON u.id = t.requester_id
            WHERE 1=1
        `;
        const params: any[] = [];
        
        if (status) {
            params.push(status);
            query += ` AND t.status = $${params.length}`;
        }
        if (priority) {
            params.push(priority);
            query += ` AND t.priority = $${params.length}`;
        }
        if (category) {
            params.push(category);
            query += ` AND t.category = $${params.length}`;
        }
        
        query += ` ORDER BY 
            CASE 
                WHEN t.priority = 'URGENT' THEN 1
                WHEN t.priority = 'HIGH' THEN 2
                WHEN t.priority = 'MEDIUM' THEN 3
                ELSE 4
            END,
            t.created_at DESC`;
            
        const result = await pool.query(query, params);
        
        const resp: ApiSuccess<any[]> = {
            success: true,
            data: result.rows,
            timestamp: new Date().toISOString(),
            requestId: randomUUID()
        };
        
        res.status(200).json(resp);
    } catch (error) {
        console.error('List tickets error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};

/**
 * Get ticket detail including messages
 */
export const getTicketDetail = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    
    try {
        const ticketResult = await pool.query(`
            SELECT t.*, u.name as requester_name, u.email as requester_email
            FROM support_tickets t
            JOIN users u ON u.id = t.requester_id
            WHERE t.id = $1
        `, [id]);
        
        if (ticketResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
        }
        
        const messagesResult = await pool.query(`
            SELECT m.*, u.name as sender_name, u.role as sender_role
            FROM ticket_messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.ticket_id = $1
            ORDER BY m.created_at ASC
        `, [id]);
        
        const resp: ApiSuccess<any> = {
            success: true,
            data: {
                ...ticketResult.rows[0],
                messages: messagesResult.rows
            },
            timestamp: new Date().toISOString(),
            requestId: randomUUID()
        };
        
        res.status(200).json(resp);
    } catch (error) {
        console.error('Get ticket detail error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};

/**
 * Add a message to a ticket
 */
export const addTicketMessage = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { message, isInternal, attachmentUrls } = req.body;
    
    try {
        const result = await pool.query(`
            INSERT INTO ticket_messages (ticket_id, sender_id, message, is_internal, attachment_urls)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [id, req.user?.userId, message, isInternal ?? false, attachmentUrls ?? []]);
        
        // Update ticket's last responded at
        await pool.query('UPDATE support_tickets SET last_responded_at = NOW(), updated_at = NOW() WHERE id = $1', [id]);
        
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Add ticket message error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};

/**
 * Update ticket status/priority
 */
export const updateTicket = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;
    
    try {
        await pool.query(`
            UPDATE support_tickets 
            SET 
                status = COALESCE($1, status),
                priority = COALESCE($2, priority),
                assigned_to = COALESCE($3, assigned_to),
                resolved_at = CASE WHEN $1 = 'RESOLVED' THEN NOW() ELSE resolved_at END,
                updated_at = NOW()
            WHERE id = $4
        `, [status, priority, assignedTo, id]);
        
        res.status(200).json({ success: true, message: 'Ticket updated successfully' });
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' } });
    }
};
