import pool from '../../config/db.config.js';

const BlogPost = {
  async findAll({ category_id, page = 1, limit = 10 } = {}) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;

    let sql = `
      SELECT p.*, c.name AS category_name
      FROM blog_posts p
      LEFT JOIN blog_categories c ON p.category_id = c.blog_category_id
      WHERE 1=1`;
    const params = [];

    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(Number(category_id));
    }

    sql += ` ORDER BY p.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

    const [rows] = await pool.execute(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM blog_posts WHERE 1=1';
    const countParams = [];
    if (category_id) {
      countSql += ' AND category_id = ?';
      countParams.push(Number(category_id));
    }
    const [countRows] = await pool.execute(countSql, countParams);

    return {
      posts: rows,
      pagination: {
        total: countRows[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countRows[0].total / limitNum)
      }
    };
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS category_name
       FROM blog_posts p
       LEFT JOIN blog_categories c ON p.category_id = c.blog_category_id
       WHERE p.post_id = ?`,
      [Number(id)]
    );
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS category_name
       FROM blog_posts p
       LEFT JOIN blog_categories c ON p.category_id = c.blog_category_id
       WHERE p.slug = ? LIMIT 1`,
      [slug]
    );
    return rows[0] || null;
  },

  async create({ category_id, author_id, title, slug, content, image_url }) {
    const [res] = await pool.execute(
      'INSERT INTO blog_posts (category_id, author_id, title, slug, content, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id || null, author_id || null, title, slug, content, image_url || null]
    );
    return this.findById(res.insertId);
  },

  async update(id, { category_id, title, slug, content, image_url }) {
    await pool.execute(
      `UPDATE blog_posts SET category_id = ?, title = ?, slug = ?, content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE post_id = ?`,
      [category_id || null, title, slug, content, image_url || null, Number(id)]
    );
    return this.findById(id);
  },

  async delete(id) {
    const [res] = await pool.execute('DELETE FROM blog_posts WHERE post_id = ?', [Number(id)]);
    return res.affectedRows > 0;
  }
};

export default BlogPost;
