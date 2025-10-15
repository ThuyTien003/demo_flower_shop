import pool from '../../config/db.config.js';

const Review = {
  // List reviews for a product with pagination and include user name
  async findByProduct(productId, { page = 1, limit = 10 } = {}) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;

    const sql = `
      SELECT r.*, u.full_name AS user_name, u.username
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    const [rows] = await pool.execute(sql, [Number(productId)]);

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE product_id = ?',
      [Number(productId)]
    );

    const [avgRows] = await pool.execute(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?',
      [Number(productId)]
    );

    return {
      reviews: rows,
      stats: {
        average: Number(avgRows[0].avg_rating || 0).toFixed(2),
        count: avgRows[0].count || 0
      },
      pagination: {
        total: countRows[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countRows[0].total / limitNum)
      }
    };
  },

  // Get a single review by user+product (for upsert use cases)
  async findByUserAndProduct(userId, productId) {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1',
      [Number(userId), Number(productId)]
    );
    return rows[0] || null;
  },

  async create({ product_id, user_id, rating, comment }) {
    const [result] = await pool.execute(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [Number(product_id), Number(user_id), Number(rating), comment || null]
    );
    return this.findById(result.insertId);
  },

  async findById(reviewId) {
    const [rows] = await pool.execute(
      `SELECT r.*, u.full_name AS user_name, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.review_id = ?`,
      [Number(reviewId)]
    );
    return rows[0] || null;
  },

  async update(reviewId, { rating, comment }) {
    await pool.execute(
      'UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?',
      [Number(rating), comment || null, Number(reviewId)]
    );
    return this.findById(reviewId);
  },

  async delete(reviewId) {
    const [res] = await pool.execute('DELETE FROM reviews WHERE review_id = ?', [Number(reviewId)]);
    return res.affectedRows > 0;
  }
};

export default Review;
