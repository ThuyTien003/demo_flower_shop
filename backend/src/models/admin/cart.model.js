import pool from '../../config/db.config.js';

const Cart = {
  // Tạo hoặc lấy giỏ hàng của user
  async getOrCreateCart(userId, sessionId = null) {
    let cart;
    
    if (userId) {
      // Tìm giỏ hàng của user đã đăng nhập
      const [rows] = await pool.execute(
        'SELECT * FROM carts WHERE user_id = ?',
        [userId]
      );
      cart = rows[0];
    } else if (sessionId) {
      // Tìm giỏ hàng của guest user
      const [rows] = await pool.execute(
        'SELECT * FROM carts WHERE session_id = ?',
        [sessionId]
      );
      cart = rows[0];
    }

    // Nếu chưa có giỏ hàng, tạo mới
    if (!cart) {
      const [result] = await pool.execute(
        'INSERT INTO carts (user_id, session_id) VALUES (?, ?)',
        [userId, sessionId]
      );
      return this.findById(result.insertId);
    }

    return cart;
  },

  // Tìm giỏ hàng theo ID
  async findById(cartId) {
    const [rows] = await pool.execute(
      'SELECT * FROM carts WHERE cart_id = ?',
      [cartId]
    );
    return rows[0];
  },

  // Lấy tất cả items trong giỏ hàng
  async getCartItems(cartId) {
    const [rows] = await pool.execute(`
      SELECT 
        ci.*,
        p.name,
        p.slug,
        p.price as current_price,
        p.stock_quantity,
        pi.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
      WHERE ci.cart_id = ?
      ORDER BY ci.cart_item_id DESC
    `, [cartId]);
    return rows;
  },

  // Thêm sản phẩm vào giỏ hàng
  async addItem(cartId, productId, quantity, unitPrice) {
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const [existingItems] = await pool.execute(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    if (existingItems.length > 0) {
      // Nếu đã có, cập nhật số lượng
      const newQuantity = existingItems[0].quantity + quantity;
      return this.updateItemQuantity(cartId, productId, newQuantity);
    } else {
      // Nếu chưa có, thêm mới
      const [result] = await pool.execute(
        'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [cartId, productId, quantity, unitPrice]
      );
      
      // Cập nhật thời gian của cart
      await pool.execute(
        'UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE cart_id = ?',
        [cartId]
      );

      return this.getCartItemById(result.insertId);
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  async updateItemQuantity(cartId, productId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(cartId, productId);
    }

    await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
      [quantity, cartId, productId]
    );

    // Cập nhật thời gian của cart
    await pool.execute(
      'UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE cart_id = ?',
      [cartId]
    );

    const [rows] = await pool.execute(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );
    return rows[0];
  },

  // Xóa sản phẩm khỏi giỏ hàng
  async removeItem(cartId, productId) {
    const [result] = await pool.execute(
      'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    // Cập nhật thời gian của cart
    await pool.execute(
      'UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE cart_id = ?',
      [cartId]
    );

    return result.affectedRows > 0;
  },

  // Lấy thông tin chi tiết một item trong giỏ hàng
  async getCartItemById(cartItemId) {
    const [rows] = await pool.execute(`
      SELECT 
        ci.*,
        p.name,
        p.slug,
        p.price as current_price,
        p.stock_quantity,
        pi.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
      WHERE ci.cart_item_id = ?
    `, [cartItemId]);
    return rows[0];
  },

  // Tính tổng giá trị giỏ hàng
  async getCartTotal(cartId) {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_items,
        COALESCE(SUM(quantity), 0) as total_quantity,
        COALESCE(SUM(quantity * unit_price), 0) as total_amount
      FROM cart_items 
      WHERE cart_id = ?
    `, [cartId]);
    return rows[0];
  },

  // Xóa toàn bộ giỏ hàng
  async clearCart(cartId) {
    await pool.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    await pool.execute(
      'UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE cart_id = ?',
      [cartId]
    );
    return true;
  },

  // Chuyển giỏ hàng từ session sang user khi đăng nhập
  async transferCartToUser(sessionId, userId) {
    // Tìm giỏ hàng của session
    const [sessionCart] = await pool.execute(
      'SELECT * FROM carts WHERE session_id = ?',
      [sessionId]
    );

    if (sessionCart.length === 0) return null;

    // Tìm giỏ hàng của user
    const [userCart] = await pool.execute(
      'SELECT * FROM carts WHERE user_id = ?',
      [userId]
    );

    if (userCart.length === 0) {
      // Nếu user chưa có giỏ hàng, chuyển giỏ hàng session thành giỏ hàng user
      await pool.execute(
        'UPDATE carts SET user_id = ?, session_id = NULL WHERE cart_id = ?',
        [userId, sessionCart[0].cart_id]
      );
      return sessionCart[0].cart_id;
    } else {
      // Nếu user đã có giỏ hàng, merge các items
      const sessionItems = await this.getCartItems(sessionCart[0].cart_id);
      
      for (const item of sessionItems) {
        await this.addItem(userCart[0].cart_id, item.product_id, item.quantity, item.unit_price);
      }

      // Xóa giỏ hàng session
      await pool.execute('DELETE FROM carts WHERE cart_id = ?', [sessionCart[0].cart_id]);
      
      return userCart[0].cart_id;
    }
  }
};

export default Cart;
