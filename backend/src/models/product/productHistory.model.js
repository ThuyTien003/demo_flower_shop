import pool from '../../config/db.config.js';

const ProductHistory = {
  async create({ product_id, user_id, action, before_data, after_data, note }) {
    const [res] = await pool.execute(
      'INSERT INTO product_history (product_id, user_id, action, before_data, after_data, note) VALUES (?, ?, ?, ?, ?, ?)',
      [Number(product_id), Number(user_id), action, before_data ? JSON.stringify(before_data) : null, after_data ? JSON.stringify(after_data) : null, note || null]
    );
    return this.findById(res.insertId);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ph.*
       FROM product_history ph
       WHERE ph.id = ?`,
      [Number(id)]
    );
    return rows[0] || null;
  },

  async listAll({ page = 1, limit = 20, startDate, endDate }) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;

    const where = [];
    const params = [];
    if (startDate) { where.push('ph.created_at >= ?'); params.push(new Date(startDate)); }
    if (endDate) { where.push('ph.created_at <= ?'); params.push(new Date(endDate)); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.execute(
      `SELECT ph.*
       FROM product_history ph
       ${whereSql}
       ORDER BY ph.created_at DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM product_history ph ${whereSql}`, params);

    return {
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countRows[0].total / limitNum)
      }
    };
  },

  async listByProduct(product_id, { page = 1, limit = 20, startDate, endDate }) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;

    const where = ['ph.product_id = ?'];
    const params = [Number(product_id)];
    if (startDate) { where.push('ph.created_at >= ?'); params.push(new Date(startDate)); }
    if (endDate) { where.push('ph.created_at <= ?'); params.push(new Date(endDate)); }

    const [rows] = await pool.execute(
      `SELECT ph.*
       FROM product_history ph
       WHERE ${where.join(' AND ')}
       ORDER BY ph.created_at DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM product_history ph WHERE ${where.join(' AND ')}`, params);

    return {
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countRows[0].total / limitNum)
      }
    };
  }
};

export default ProductHistory;
