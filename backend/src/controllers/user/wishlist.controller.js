import pool from '../../config/db.config.js';

const wishlistController = {
  // Get current user's wishlist
  async getMyWishlist(req, res) {
    try {
      const userId = req.user.id;
      const [rows] = await pool.execute(
        `SELECT w.product_id, p.name, p.price,
                (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as primary_image
         FROM wishlists w
         JOIN products p ON w.product_id = p.product_id
         WHERE w.user_id = ?
         ORDER BY w.created_at DESC`,
        [userId]
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Get wishlist error:', error);
      res.status(500).json({ success: false, message: 'Error fetching wishlist', error: error.message });
    }
  },

  // Add a product to wishlist
  async addToWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;
      if (!product_id) {
        return res.status(400).json({ success: false, message: 'product_id is required' });
      }

      // Ensure product exists and active
      const [products] = await pool.execute('SELECT product_id FROM products WHERE product_id = ? AND is_active = 1', [product_id]);
      if (products.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Check existing
      const [exists] = await pool.execute('SELECT wishlist_id FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, product_id]);
      if (exists.length > 0) {
        return res.json({ success: true, message: 'Already in wishlist' });
      }

      await pool.execute('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [userId, product_id]);
      res.status(201).json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
      console.error('Add to wishlist error:', error);
      res.status(500).json({ success: false, message: 'Error adding to wishlist', error: error.message });
    }
  },

  // Remove a product from wishlist
  async removeFromWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      await pool.execute('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
      res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({ success: false, message: 'Error removing from wishlist', error: error.message });
    }
  },

  // Check if a product is in wishlist
  async isInWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      const [rows] = await pool.execute('SELECT wishlist_id FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
      res.json({ success: true, in_wishlist: rows.length > 0 });
    } catch (error) {
      console.error('Check wishlist error:', error);
      res.status(500).json({ success: false, message: 'Error checking wishlist', error: error.message });
    }
  }
};

export default wishlistController;
