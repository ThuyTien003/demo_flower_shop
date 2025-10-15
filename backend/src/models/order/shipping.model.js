import pool from '../../config/db.config.js';

const Shipping = {
  // Lấy tất cả phương thức giao hàng đang hoạt động
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM shipping_methods WHERE is_active = 1 ORDER BY cost ASC'
    );
    return rows;
  },

  // Tìm phương thức giao hàng theo ID
  async findById(shippingId) {
    const [rows] = await pool.execute(
      'SELECT * FROM shipping_methods WHERE shipping_id = ?',
      [shippingId]
    );
    return rows[0];
  },

  // Tạo phương thức giao hàng mới (admin)
  async create({ name, description, cost, estimated_days }) {
    const [result] = await pool.execute(
      'INSERT INTO shipping_methods (name, description, cost, estimated_days) VALUES (?, ?, ?, ?)',
      [name, description, cost, estimated_days]
    );
    return this.findById(result.insertId);
  },

  // Cập nhật phương thức giao hàng (admin)
  async update(shippingId, { name, description, cost, estimated_days, is_active }) {
    await pool.execute(
      'UPDATE shipping_methods SET name = ?, description = ?, cost = ?, estimated_days = ?, is_active = ? WHERE shipping_id = ?',
      [name, description, cost, estimated_days, is_active, shippingId]
    );
    return this.findById(shippingId);
  },

  // Xóa phương thức giao hàng (admin)
  async delete(shippingId) {
    const [result] = await pool.execute(
      'DELETE FROM shipping_methods WHERE shipping_id = ?',
      [shippingId]
    );
    return result.affectedRows > 0;
  },

  // Bật/tắt phương thức giao hàng
  async toggleStatus(shippingId) {
    await pool.execute(
      'UPDATE shipping_methods SET is_active = NOT is_active WHERE shipping_id = ?',
      [shippingId]
    );
    return this.findById(shippingId);
  },

  // Tính phí giao hàng dựa trên địa chỉ (có thể mở rộng sau)
  async calculateShippingCost(shippingId, address = null, totalWeight = null) {
    const shipping = await this.findById(shippingId);
    if (!shipping) {
      throw new Error('Phương thức giao hàng không tồn tại');
    }

    // Hiện tại trả về giá cố định, có thể mở rộng để tính theo khu vực, trọng lượng...
    return {
      shipping_id: shipping.shipping_id,
      name: shipping.name,
      cost: shipping.cost,
      estimated_days: shipping.estimated_days
    };
  }
};

export default Shipping;
