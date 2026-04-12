import type { ProductDetailResponse } from '../types/catalog.js';
import pool from '../config/db/db.js';

export const CatalogService = {
  async getCategories() {
    const { rows } = await pool.query(`SELECT * FROM categories WHERE is_active = true`);
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      isActive: row.is_active,
    }));
  },

  async getSubCategories(categoryId?: string) {
    let query = `SELECT * FROM sub_categories WHERE is_active = true`;
    const params: any[] = [];
    if (categoryId) {
      query += ` AND category_id = $1`;
      params.push(categoryId);
    }
    const { rows } = await pool.query(query, params);
    return rows.map(row => ({
      id: row.id,
      categoryId: row.category_id,
      title: row.title,
      isActive: row.is_active,
    }));
  },

  async getProductsList(subCategoryId?: string) {
    let query = `
      SELECT 
        p.*, 
        (SELECT MIN(selling_price) FROM skus s WHERE s.product_id = p.id AND s.is_active = true) as starting_price
      FROM products p
      WHERE p.is_active = true
    `;
    const params: any[] = [];
    if (subCategoryId) {
      query += ` AND p.sub_category_id = $1`;
      params.push(subCategoryId);
    }
    const { rows } = await pool.query(query, params);
    return rows.map(row => ({
      id: row.id,
      subCategoryId: row.sub_category_id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      customizationMode: row.customization_mode,
      primaryCTA: row.primary_cta,
      thumbnailUrl: row.thumbnail_url,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      startingPrice: row.starting_price ? parseFloat(row.starting_price) : null,
    }));
  },

  async getProductDetail(slugOrId: string): Promise<ProductDetailResponse | null> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    
    // 1. Get Product
    const pQuery = isUUID 
      ? `SELECT * FROM products WHERE id = $1 AND is_active = true` 
      : `SELECT * FROM products WHERE slug = $1 AND is_active = true`;
    
    const { rows: pRows } = await pool.query(pQuery, [slugOrId]);
    if (pRows.length === 0) return null;
    const product = pRows[0];

    // 2. Get SKUs
    const { rows: skus } = await pool.query(`SELECT * FROM skus WHERE product_id = $1 AND is_active = true`, [product.id]);

    // 3. Get Options
    const { rows: options } = await pool.query(`SELECT * FROM product_config_options WHERE product_id = $1 ORDER BY sort_order ASC`, [product.id]);

    // 4. Get Option Values
    let optionValues: any[] = [];
    if (options.length > 0) {
      const optionIds = options.map(o => o.id);
      const { rows: vals } = await pool.query(`SELECT * FROM product_config_option_values WHERE option_id = ANY($1) ORDER BY sort_order ASC`, [optionIds]);
      optionValues = vals;
    }

    // 5. Get Slabs
    let slabs: any[] = [];
    if (skus.length > 0) {
      const skuIds = skus.map(s => s.id);
      const { rows: slbRows } = await pool.query(`SELECT * FROM quantity_slabs WHERE sku_id = ANY($1)`, [skuIds]);
      slabs = slbRows;
    }

    return {
      product: {
        id: product.id,
        subCategoryId: product.sub_category_id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        customizationMode: product.customization_mode,
        primaryCTA: product.primary_cta,
        thumbnailUrl: product.thumbnail_url,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      },
      skus: skus.map(s => ({
        id: s.id,
        productId: s.product_id,
        skuCode: s.sku_code,
        title: s.title,
        mrp: parseFloat(s.mrp),
        sellingPrice: parseFloat(s.selling_price),
        discountPercent: parseFloat(s.discount_percent),
        deliveryBadge: s.delivery_badge,
        isActive: s.is_active
      })),
      options: options.map(o => ({
        id: o.id,
        productId: o.product_id,
        key: o.key,
        label: o.label,
        type: o.type,
        isRequired: o.is_required,
        sortOrder: o.sort_order
      })),
      optionValues: optionValues.map(v => ({
        id: v.id,
        optionId: v.option_id,
        value: v.value,
        label: v.label,
        priceDelta: parseFloat(v.price_delta),
        sortOrder: v.sort_order
      })),
      slabs: slabs.map(slb => ({
        id: slb.id,
        skuId: slb.sku_id,
        minQty: slb.min_qty,
        maxQty: slb.max_qty,
        unitPrice: parseFloat(slb.unit_price)
      }))
    };
  }
};
