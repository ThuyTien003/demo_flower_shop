import pool from '../../config/db.config.js';

const BlogCategory = {
  async findAll() {
    const [rows] = await pool.execute('SELECT * FROM blog_categories ORDER BY name ASC');
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM blog_categories WHERE blog_category_id = ?', [Number(id)]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const [rows] = await pool.execute('SELECT * FROM blog_categories WHERE slug = ? LIMIT 1', [slug]);
    return rows[0] || null;
  },

  async create({ name, slug, description }) {
    const [res] = await pool.execute(
      'INSERT INTO blog_categories (name, slug, description) VALUES (?, ?, ?)',
      [name, slug, description || null]
    );
    return this.findById(res.insertId);
  },

  async update(id, { name, slug, description }) {
    await pool.execute(
      'UPDATE blog_categories SET name = ?, slug = ?, description = ? WHERE blog_category_id = ?',
      [name, slug, description || null, Number(id)]
    );
    return this.findById(id);
  },

  async delete(id) {
    const [res] = await pool.execute('DELETE FROM blog_categories WHERE blog_category_id = ?', [Number(id)]);
    return res.affectedRows > 0;
  }
};

export default BlogCategory;
