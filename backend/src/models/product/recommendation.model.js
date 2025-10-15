import pool from '../../config/db.config.js';

const Recommendation = {
  // Track product view
  async trackView(userId, sessionId, productId) {
    try {
      await pool.execute(
        'INSERT INTO view_history (user_id, session_id, product_id) VALUES (?, ?, ?)',
        [userId || null, sessionId, productId]
      );
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  },

  // Get personalized recommendations for homepage
  async getPersonalizedRecommendations(userId, sessionId, limit = 8) {
    const nLimit = Number(limit) || 8;
    
    // Collect user behavior data
    const behaviors = await this.getUserBehaviors(userId, sessionId);
    
    if (behaviors.totalInteractions === 0) {
      // New user - return popular products
      return await this.getPopularProducts(nLimit);
    }

    // Get recommendations based on multiple factors
    const recommendations = [];
    
    // 1. Based on purchase history (40% weight)
    if (behaviors.purchasedCategories.length > 0) {
      const purchaseBased = await this.getRecommendationsByPurchase(
        behaviors.purchasedCategories,
        behaviors.purchasedProducts,
        Math.ceil(nLimit * 0.4)
      );
      recommendations.push(...purchaseBased);
    }

    // 2. Based on view history (30% weight)
    if (behaviors.viewedCategories.length > 0) {
      const viewBased = await this.getRecommendationsByViews(
        behaviors.viewedCategories,
        behaviors.viewedProducts,
        Math.ceil(nLimit * 0.3)
      );
      recommendations.push(...viewBased);
    }

    // 3. Based on wishlist (20% weight)
    if (behaviors.wishlistCategories.length > 0) {
      const wishlistBased = await this.getRecommendationsByWishlist(
        behaviors.wishlistCategories,
        behaviors.wishlistProducts,
        Math.ceil(nLimit * 0.2)
      );
      recommendations.push(...wishlistBased);
    }

    // 4. Fill remaining with popular products
    const remaining = nLimit - recommendations.length;
    if (remaining > 0) {
      const popular = await this.getPopularProducts(remaining);
      recommendations.push(...popular);
    }

    // Remove duplicates and limit
    const uniqueRecommendations = this.removeDuplicates(recommendations);
    return uniqueRecommendations.slice(0, nLimit);
  },

  // Get similar products for product detail page
  async getSimilarProducts(productId, limit = 8) {
    const nLimit = Number(limit) || 8;
    
    // Get current product details
    const [products] = await pool.execute(
      'SELECT category_id, price FROM products WHERE product_id = ?',
      [productId]
    );

    if (products.length === 0) {
      return [];
    }

    const product = products[0];
    const priceRange = product.price * 0.3; // ±30% price range

    // Find similar products based on:
    // 1. Same category
    // 2. Similar price
    // 3. Exclude current product
    const [similar] = await pool.execute(
      `SELECT 
         p.product_id,
         p.name,
         p.slug,
         p.price,
         p.description,
         c.name as category_name,
         (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url,
         COUNT(oi.order_item_id) as order_count,
         AVG(r.rating) as avg_rating,
         ABS(p.price - ?) as price_diff
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN order_items oi ON p.product_id = oi.product_id
       LEFT JOIN reviews r ON p.product_id = r.product_id
       WHERE p.category_id = ?
         AND p.product_id != ?
         AND p.is_active = 1
         AND p.stock_quantity > 0
         AND p.price BETWEEN ? AND ?
       GROUP BY p.product_id
       ORDER BY price_diff ASC, order_count DESC, avg_rating DESC
       LIMIT ${nLimit}`,
      [
        product.price,
        product.category_id,
        productId,
        product.price - priceRange,
        product.price + priceRange
      ]
    );

    // If not enough similar products, get from same category without price filter
    if (similar.length < nLimit) {
      const remaining = nLimit - similar.length;
      const excludeIds = similar.map(p => p.product_id);
      excludeIds.push(productId);
      
      const [additional] = await pool.execute(
        `SELECT 
           p.product_id,
           p.name,
           p.slug,
           p.price,
           p.description,
           c.name as category_name,
           (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url,
           COUNT(oi.order_item_id) as order_count,
           AVG(r.rating) as avg_rating
         FROM products p
         JOIN categories c ON p.category_id = c.category_id
         LEFT JOIN order_items oi ON p.product_id = oi.product_id
         LEFT JOIN reviews r ON p.product_id = r.product_id
         WHERE p.category_id = ?
           AND p.product_id NOT IN (${excludeIds.map(() => '?').join(',')})
           AND p.is_active = 1
           AND p.stock_quantity > 0
         GROUP BY p.product_id
         ORDER BY order_count DESC, avg_rating DESC
         LIMIT ${remaining}`,
        [product.category_id, ...excludeIds]
      );

      similar.push(...additional);
    }

    return similar;
  },

  // Get user behaviors (purchase, view, wishlist, cart)
  async getUserBehaviors(userId, sessionId) {
    const behaviors = {
      purchasedCategories: [],
      purchasedProducts: [],
      viewedCategories: [],
      viewedProducts: [],
      wishlistCategories: [],
      wishlistProducts: [],
      cartCategories: [],
      cartProducts: [],
      totalInteractions: 0
    };

    // Get purchase history
    if (userId) {
      const [purchases] = await pool.execute(
        `SELECT DISTINCT p.product_id, p.category_id
         FROM orders o
         JOIN order_items oi ON o.order_id = oi.order_id
         JOIN products p ON oi.product_id = p.product_id
         WHERE o.user_id = ? AND o.status NOT IN ('cancelled')
         ORDER BY o.order_date DESC
         LIMIT 50`,
        [userId]
      );
      
      behaviors.purchasedProducts = purchases.map(p => p.product_id);
      behaviors.purchasedCategories = [...new Set(purchases.map(p => p.category_id))];
      behaviors.totalInteractions += purchases.length;
    }

    // Get view history
    const viewQuery = userId 
      ? 'SELECT product_id, MAX(viewed_at) as last_viewed FROM view_history WHERE user_id = ? GROUP BY product_id ORDER BY last_viewed DESC LIMIT 30'
      : 'SELECT product_id, MAX(viewed_at) as last_viewed FROM view_history WHERE session_id = ? GROUP BY product_id ORDER BY last_viewed DESC LIMIT 30';
    
    const [views] = await pool.execute(viewQuery, [userId || sessionId]);
    
    if (views.length > 0) {
      const viewedProductIds = views.map(v => v.product_id);
      const [viewedProducts] = await pool.execute(
        `SELECT product_id, category_id FROM products WHERE product_id IN (${viewedProductIds.map(() => '?').join(',')})`,
        viewedProductIds
      );
      
      behaviors.viewedProducts = viewedProducts.map(p => p.product_id);
      behaviors.viewedCategories = [...new Set(viewedProducts.map(p => p.category_id))];
      behaviors.totalInteractions += views.length;
    }

    // Get wishlist
    if (userId) {
      const [wishlist] = await pool.execute(
        `SELECT DISTINCT p.product_id, p.category_id
         FROM wishlist w
         JOIN products p ON w.product_id = p.product_id
         WHERE w.user_id = ?`,
        [userId]
      );
      
      behaviors.wishlistProducts = wishlist.map(p => p.product_id);
      behaviors.wishlistCategories = [...new Set(wishlist.map(p => p.category_id))];
      behaviors.totalInteractions += wishlist.length;
    }

    // Get cart items
    if (userId) {
      const [cart] = await pool.execute(
        `SELECT DISTINCT p.product_id, p.category_id
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.product_id
         WHERE ci.user_id = ?`,
        [userId]
      );
      
      behaviors.cartProducts = cart.map(p => p.product_id);
      behaviors.cartCategories = [...new Set(cart.map(p => p.category_id))];
      behaviors.totalInteractions += cart.length;
    }

    return behaviors;
  },

  // Get recommendations based on purchase history
  async getRecommendationsByPurchase(categoryIds, excludeProductIds, limit) {
    if (categoryIds.length === 0) return [];
    
    const nLimit = Number(limit) || 5;
    const excludeIds = excludeProductIds.length > 0 ? excludeProductIds : [0];
    
    const [products] = await pool.execute(
      `SELECT 
         p.product_id,
         p.name,
         p.slug,
         p.price,
         p.description,
         c.name as category_name,
         (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url,
         COUNT(oi.order_item_id) as order_count,
         AVG(r.rating) as avg_rating
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN order_items oi ON p.product_id = oi.product_id
       LEFT JOIN reviews r ON p.product_id = r.product_id
       WHERE p.category_id IN (${categoryIds.map(() => '?').join(',')})
         AND p.product_id NOT IN (${excludeIds.map(() => '?').join(',')})
         AND p.is_active = 1
         AND p.stock_quantity > 0
       GROUP BY p.product_id
       ORDER BY order_count DESC, avg_rating DESC
       LIMIT ${nLimit}`,
      [...categoryIds, ...excludeIds]
    );

    return products;
  },

  // Get recommendations based on view history
  async getRecommendationsByViews(categoryIds, excludeProductIds, limit) {
    if (categoryIds.length === 0) return [];
    
    const nLimit = Number(limit) || 5;
    const excludeIds = excludeProductIds.length > 0 ? excludeProductIds : [0];
    
    const [products] = await pool.execute(
      `SELECT 
         p.product_id,
         p.name,
         p.slug,
         p.price,
         p.description,
         c.name as category_name,
         (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url,
         COUNT(vh.view_id) as view_count,
         AVG(r.rating) as avg_rating
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN view_history vh ON p.product_id = vh.product_id
       LEFT JOIN reviews r ON p.product_id = r.product_id
       WHERE p.category_id IN (${categoryIds.map(() => '?').join(',')})
         AND p.product_id NOT IN (${excludeIds.map(() => '?').join(',')})
         AND p.is_active = 1
         AND p.stock_quantity > 0
       GROUP BY p.product_id
       ORDER BY view_count DESC, avg_rating DESC
       LIMIT ${nLimit}`,
      [...categoryIds, ...excludeIds]
    );

    return products;
  },

  // Get recommendations based on wishlist
  async getRecommendationsByWishlist(categoryIds, excludeProductIds, limit) {
    if (categoryIds.length === 0) return [];
    
    const nLimit = Number(limit) || 5;
    const excludeIds = excludeProductIds.length > 0 ? excludeProductIds : [0];
    
    const [products] = await pool.execute(
      `SELECT 
         p.product_id,
         p.name,
         p.slug,
         p.price,
         p.description,
         c.name as category_name,
         (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url,
         COUNT(w.wishlist_id) as wishlist_count,
         AVG(r.rating) as avg_rating
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN wishlist w ON p.product_id = w.product_id
       LEFT JOIN reviews r ON p.product_id = r.product_id
       WHERE p.category_id IN (${categoryIds.map(() => '?').join(',')})
         AND p.product_id NOT IN (${excludeIds.map(() => '?').join(',')})
         AND p.is_active = 1
         AND p.stock_quantity > 0
       GROUP BY p.product_id
       ORDER BY wishlist_count DESC, avg_rating DESC
       LIMIT ${nLimit}`,
      [...categoryIds, ...excludeIds]
    );

    return products;
  },

  // Get popular products
  async getPopularProducts(limit = 8) {
    const nLimit = Number(limit) || 8;
    
    const [products] = await pool.execute(
      `SELECT 
         p.product_id,
         p.name,
         p.slug,
         p.price,
         p.description,
         c.name as category_name,
         (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url,
         COUNT(oi.order_item_id) as order_count,
         AVG(r.rating) as avg_rating
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN order_items oi ON p.product_id = oi.product_id
       LEFT JOIN reviews r ON p.product_id = r.product_id
       WHERE p.is_active = 1 AND p.stock_quantity > 0
       GROUP BY p.product_id
       ORDER BY order_count DESC, avg_rating DESC
       LIMIT ${nLimit}`,
      []
    );

    return products;
  },

  // Remove duplicate products
  removeDuplicates(products) {
    const seen = new Set();
    return products.filter(product => {
      if (seen.has(product.product_id)) {
        return false;
      }
      seen.add(product.product_id);
      return true;
    });
  }
};

export default Recommendation;
