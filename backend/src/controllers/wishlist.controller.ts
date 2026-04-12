import type { Response } from 'express';
import { WishlistService } from '../services/wishlist.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

export const getWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const items = await WishlistService.getWishlist(userId);
        res.status(200).json({
            success: true,
            data: items
        });
    } catch (error) {
        console.error('Fetch wishlist error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const toggleWishlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!productId) {
            return res.status(400).json({ error: 'Product ID required' });
        }

        const result = await WishlistService.toggleWishlist(userId, productId);
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Toggle wishlist error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
