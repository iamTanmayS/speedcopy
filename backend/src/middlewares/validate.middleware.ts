import type { Request, Response, NextFunction } from 'express';

export const validate = (schema: any) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error: any) {
            if (error?.errors) {
                res.status(400).json({
                    error: {
                        message: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: error.errors
                    }
                });
            } else {
                next(error);
            }
        }
    };
};
