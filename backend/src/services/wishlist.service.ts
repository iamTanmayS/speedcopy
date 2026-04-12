import pool from '../config/db/db.js';

export const WishlistService = {
  async getWishlist(userId: string) {
    const query = `
      SELECT 
        p.*, 
        (SELECT MIN(selling_price) FROM skus s WHERE s.product_id = p.id AND s.is_active = true) as starting_price
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1 AND p.is_active = true
      ORDER BY w.created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
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

  async toggleWishlist(userId: string, productId: string) {
    // Check if item exists
    const checkQuery = `SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2`;
    const { rows } = await pool.query(checkQuery, [userId, productId]);

    if (rows.length > 0) {
      // Remove
      await pool.query(`DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
      return { added: false };
    } else {
      // Add
      await pool.query(
        `INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)`,
        [userId, productId]
      );
      return { added: true };
    }
  }
};
