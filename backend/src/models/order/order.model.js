import pool from '../../config/db.config.js';

const Order = {
  // Tạo đơn hàng mới
  async create(orderData) {
    const {
      userId,
      totalAmount,
      shippingAddress,
      shippingId,
      paymentId,
      note,
      items
    } = orderData;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Tạo đơn hàng
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, total_amount, shipping_address, shipping_id, payment_id, note, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [userId, totalAmount, shippingAddress, shippingId, paymentId, note]
      );

      const orderId = orderResult.insertId;

      // Thêm các items vào đơn hàng
      for (const item of items) {
        const subtotal = item.quantity * item.unit_price;
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) 
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.unit_price, subtotal]
        );

        // Cập nhật số lượng tồn kho
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      return this.findById(orderId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Tìm đơn hàng theo ID
  async findById(orderId) {
    const [rows] = await pool.execute(`
      SELECT 
        o.*,
        u.full_name,
        u.email,
        u.phone,
        sm.name as shipping_method,
        sm.cost as shipping_cost,
        pm.name as payment_method
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN shipping_methods sm ON o.shipping_id = sm.shipping_id
      LEFT JOIN payment_methods pm ON o.payment_id = pm.payment_id
      WHERE o.order_id = ?
    `, [orderId]);
    
    if (rows.length === 0) return null;

    const order = rows[0];
    order.items = await this.getOrderItems(orderId);
    return order;
  },

  // Lấy tất cả items của đơn hàng
  async getOrderItems(orderId) {
    const [rows] = await pool.execute(`
      SELECT 
        oi.*,
        p.name,
        p.slug,
        pi.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
      WHERE oi.order_id = ?
    `, [orderId]);
    return rows;
  },

  // Lấy danh sách đơn hàng của user
  async findByUserId(userId, page = 1, limit = 10) {
    const nLimit = Number(limit) || 10;
    const nPage = Number(page) || 1;
    const offset = (nPage - 1) * nLimit;
    
    const query = `
      SELECT 
        o.*,
        sm.name as shipping_method,
        pm.name as payment_method,
        COUNT(oi.order_item_id) as total_items
      FROM orders o
      LEFT JOIN shipping_methods sm ON o.shipping_id = sm.shipping_id
      LEFT JOIN payment_methods pm ON o.payment_id = pm.payment_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
      LIMIT ${offset}, ${nLimit}
    `;

    const [rows] = await pool.execute(query, [userId]);

    return rows;
  },

  // Lấy tất cả đơn hàng (admin)
  async findAll(page = 1, limit = 10, status = null) {
    const nLimit = Number(limit) || 10;
    const nPage = Number(page) || 1;
    const offset = (nPage - 1) * nLimit;
    let query = `
      SELECT 
        o.*
      FROM orders o
    `;
    
    const params = [];
    
    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    
    query += `
      ORDER BY o.order_id DESC
      LIMIT ${offset}, ${nLimit}
    `;
    
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // Cập nhật trạng thái đơn hàng
  async updateStatus(orderId, status) {
    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
      [status, orderId]
    );
    return this.findById(orderId);
  },

  // Hủy đơn hàng
  async cancel(orderId, reason = null) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Cập nhật trạng thái đơn hàng
      await connection.execute(
        'UPDATE orders SET status = ?, note = CONCAT(IFNULL(note, ""), "\nLý do hủy: ", ?) WHERE order_id = ?',
        ['cancelled', reason || 'Không có lý do', orderId]
      );

      // Hoàn lại số lượng tồn kho
      const items = await this.getOrderItems(orderId);
      for (const item of items) {
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      return this.findById(orderId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Thống kê đơn hàng
  async getStatistics(startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value
      FROM orders
    `;
    
    const params = [];
    
    if (startDate && endDate) {
      query += ' WHERE order_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' WHERE order_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      query += ' WHERE order_date <= ?';
      params.push(endDate);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0];
  },

  // Lấy doanh thu theo tháng
  async getMonthlyRevenue(year) {
    const [rows] = await pool.execute(`
      SELECT 
        MONTH(order_date) as month,
        COUNT(*) as total_orders,
        SUM(total_amount) as revenue
      FROM orders 
      WHERE YEAR(order_date) = ? AND status NOT IN ('cancelled')
      GROUP BY MONTH(order_date)
      ORDER BY month
    `, [year]);
    return rows;
  },

  // Lấy top sản phẩm bán chạy
  async getTopSellingProducts(limit = 10) {
    const nLimit = Number(limit) || 10;
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.slug,
        MAX(pi.image_url) as image_url,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.status NOT IN ('cancelled')
      GROUP BY p.product_id, p.name, p.slug
      ORDER BY total_sold DESC
      LIMIT ${nLimit}
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }
};

export default Order;
