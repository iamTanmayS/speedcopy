import { useQuery } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import type { 
    Category, 
    SubCategory, 
    Product, 
    ProductDetailResponse, 
    SKU, 
    ProductConfigOption, 
    ProductConfigOptionValue, 
    QuantitySlab 
} from '../types/catalog';
import { useCatalogStore } from '../state_mgmt/store/catalogStore';

export interface CatalogResponse {
    categories: Category[];
    subCategories: SubCategory[];
    products: Product[];
}

// Transform functions to map snake_case to camelCase
const transformCategory = (cat: any): Category => ({
    id: cat.id,
    name: cat.name,
    isActive: cat.isActive ?? cat.is_active,
});

const transformSubCategory = (sub: any): SubCategory => ({
    id: sub.id,
    categoryId: sub.categoryId ?? sub.category_id,
    title: sub.title,
    isActive: sub.isActive ?? sub.is_active,
});

const transformProduct = (prod: any): Product => ({
    id: prod.id,
    subCategoryId: prod.subCategoryId ?? prod.sub_category_id,
    slug: prod.slug,
    title: prod.title,
    description: prod.description,
    customizationMode: prod.customizationMode ?? prod.customization_mode,
    primaryCTA: prod.primaryCTA ?? prod.primary_cta,
    thumbnailUrl: prod.thumbnailUrl ?? prod.thumbnail_url,
    isActive: prod.isActive ?? prod.is_active,
    createdAt: prod.createdAt ?? prod.created_at,
    updatedAt: prod.updatedAt ?? prod.updated_at,
});

const transformSKU = (sku: any): SKU => ({
    id: sku.id,
    productId: sku.productId ?? sku.product_id,
    skuCode: sku.skuCode ?? sku.sku_code,
    title: sku.title,
    mrp: sku.mrp,
    sellingPrice: sku.sellingPrice ?? sku.selling_price,
    discountPercent: sku.discountPercent ?? sku.discount_percent,
    deliveryBadge: sku.deliveryBadge ?? sku.delivery_badge,
    isActive: sku.isActive ?? sku.is_active,
});

const transformProductConfigOption = (opt: any): ProductConfigOption => ({
    id: opt.id,
    productId: opt.productId ?? opt.product_id,
    key: opt.key,
    label: opt.label,
    type: opt.type,
    isRequired: opt.isRequired ?? opt.is_required,
    sortOrder: opt.sortOrder ?? opt.sort_order,
});

const transformProductConfigOptionValue = (val: any): ProductConfigOptionValue => ({
    id: val.id,
    optionId: val.optionId ?? val.option_id,
    value: val.value,
    label: val.label,
    priceDelta: val.priceDelta ?? val.price_delta,
    sortOrder: val.sortOrder ?? val.sort_order,
});

const transformQuantitySlab = (slab: any): QuantitySlab => ({
    id: slab.id,
    skuId: slab.skuId ?? slab.sku_id,
    minQty: slab.minQty ?? slab.min_qty,
    maxQty: slab.maxQty ?? slab.max_qty,
    unitPrice: slab.unitPrice ?? slab.unit_price,
});

/**
 * useCatalogQuery
 * Fetches the top-level macro hierarchy (categories, subcategories, products)
 */
export const useCatalogQuery = () => {
    return useQuery({
        queryKey: ['catalog'],
        queryFn: async (): Promise<CatalogResponse> => {
            const response = await apiClient.get('/api/catalog');
            const rawData = response.data.data;
            const catalogData = {
                categories: rawData.categories.map(transformCategory),
                subCategories: rawData.subCategories.map(transformSubCategory),
                products: rawData.products.map(transformProduct),
            };
            
            // Sync to global Zustand store
            useCatalogStore.getState().setCatalog(catalogData);
            
            return catalogData;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * useProductDetailQuery
 * Fetches depth-first product details including options, SKUs and price slabs
 */
export const useProductDetailQuery = (idOrSlug: string) => {
    return useQuery({
        queryKey: ['productDetail', idOrSlug],
        queryFn: async (): Promise<ProductDetailResponse> => {
            const response = await apiClient.get(`/api/catalog/${idOrSlug}`);
            const rawData = response.data.data;
            return {
                product: transformProduct(rawData.product),
                skus: rawData.skus.map(transformSKU),
                options: rawData.options.map(transformProductConfigOption),
                optionValues: rawData.optionValues.map(transformProductConfigOptionValue),
                slabs: rawData.slabs.map(transformQuantitySlab),
            };
        },
        enabled: !!idOrSlug,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
