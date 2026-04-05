import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/config.js';
import type { UserRole } from '../types/index.js';
import type { Permission } from '../types/auth.js';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: UserRole;
        permissions: Permission[];
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ success: false, error: { code: 'AUTH_UNAUTHORIZED', message: 'Authorization header is missing' }, timestamp: new Date().toISOString(), requestId: '' });
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ success: false, error: { code: 'AUTH_UNAUTHORIZED', message: 'Token is missing' }, timestamp: new Date().toISOString(), requestId: '' });
            return;
        }

        const decoded = jwt.verify(token, env.jwt_secret) as { userId: string; role: UserRole; permissions: Permission[] };
        req.user = {
            userId: decoded.userId,
            role: decoded.role ?? 'customer',
            permissions: decoded.permissions ?? []
        };
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_INVALID', message: 'Invalid or expired token' }, timestamp: new Date().toISOString(), requestId: '' });
    }
};
