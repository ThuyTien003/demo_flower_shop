import pool from '../../config/db.config.js';

const BlogComment = {
  async findByPost(post_id, { page = 1, limit = 10 } = {}) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;

    const sql = `
      SELECT c.*, u.full_name AS user_name, u.username
      FROM blog_comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    const [rows] = await pool.execute(sql, [Number(post_id)]);

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM blog_comments WHERE post_id = ?',
      [Number(post_id)]
    );

    return {
      comments: rows,
      pagination: {
        total: countRows[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countRows[0].total / limitNum)
      }
    };
  },

  async create({ post_id, user_id, comment }) {
    const [res] = await pool.execute(
      'INSERT INTO blog_comments (post_id, user_id, comment) VALUES (?, ?, ?)',
      [Number(post_id), Number(user_id), comment]
    );
    return this.findById(res.insertId);
  },

  async findById(comment_id) {
    const [rows] = await pool.execute(
      `SELECT c.*, u.full_name AS user_name, u.username
       FROM blog_comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.comment_id = ?`,
      [Number(comment_id)]
    );
    return rows[0] || null;
  },

  async delete(comment_id) {
    const [res] = await pool.execute('DELETE FROM blog_comments WHERE comment_id = ?', [Number(comment_id)]);
    return res.affectedRows > 0;
  }
};

export default BlogComment;
