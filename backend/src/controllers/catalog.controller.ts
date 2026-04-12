import type { Request, Response } from 'express';
import { CatalogService } from '../services/catalog.service.js';

export const getCatalog = async (req: Request, res: Response) => {
    try {
        const categories = await CatalogService.getCategories();
        const subCategories = await CatalogService.getSubCategories();
        const products = await CatalogService.getProductsList();

        res.status(200).json({
            success: true,
            data: {
                categories,
                subCategories,
                products
            }
        });
    } catch (error) {
        console.error('Fetch catalog error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProductDetail = async (req: Request, res: Response) => {
    try {
        const { idOrSlug } = req.params;
        if (!idOrSlug) {
            return res.status(400).json({ error: 'Product ID or Slug required' });
        }

        const data = await CatalogService.getProductDetail(idOrSlug as string);
        if (!data) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Fetch product detail error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
