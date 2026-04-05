import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.middleware.js';
import type { Permission } from '../types/auth.js';

/**
 * Middleware factory that checks if the authenticated user has ALL of the required permissions.
 * Permissions are read from the JWT token (req.user.permissions).
 */
export const requirePermission = (...required: Permission[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        const user = req.user;

        if (!user) {
            res.status(401).json({
                success: false,
                error: { code: 'AUTH_UNAUTHORIZED', message: 'Not authenticated' },
                timestamp: new Date().toISOString(),
                requestId: ''
            });
            return;
        }

        // super_admin bypasses all permission checks
        if (user.role === 'super_admin' || user.role === 'admin') {
            next();
            return;
        }

        const userPerms = new Set(user.permissions);
        const hasAll = required.every(p => userPerms.has(p));

        if (!hasAll) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'ADMIN_PERMISSION_DENIED',
                    message: `Required permissions: ${required.join(', ')}`
                },
                timestamp: new Date().toISOString(),
                requestId: ''
            });
            return;
        }

        next();
    };
};
