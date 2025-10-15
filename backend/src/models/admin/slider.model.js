import pool from '../../config/db.config.js';

const Slider = {
  async create({ title, image_url, link_url, is_active = 1, sort_order = 0 }) {
    const [res] = await pool.execute(
      'INSERT INTO sliders (title, image_url, link_url, is_active, sort_order) VALUES (?, ?, ?, ?, ?)',
      [title || null, image_url, link_url || null, Number(is_active) ? 1 : 0, Number(sort_order) || 0]
    );
    return this.findById(res.insertId);
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM sliders WHERE id = ?', [Number(id)]);
    return rows[0] || null;
  },

  async update(id, { title, image_url, link_url, is_active, sort_order }) {
    const current = await this.findById(id);
    if (!current) return null;
    const next = {
      title: title !== undefined ? title : current.title,
      image_url: image_url !== undefined ? image_url : current.image_url,
      link_url: link_url !== undefined ? link_url : current.link_url,
      is_active: is_active !== undefined ? (Number(is_active) ? 1 : 0) : current.is_active,
      sort_order: sort_order !== undefined ? Number(sort_order) : current.sort_order,
    };
    await pool.execute(
      'UPDATE sliders SET title = ?, image_url = ?, link_url = ?, is_active = ?, sort_order = ? WHERE id = ?',
      [next.title, next.image_url, next.link_url, next.is_active, next.sort_order, Number(id)]
    );
    return this.findById(id);
  },

  async remove(id) {
    const [res] = await pool.execute('DELETE FROM sliders WHERE id = ?', [Number(id)]);
    return res.affectedRows > 0;
  },

  async list({ page = 1, limit = 20, activeOnly = false }) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;
    const where = activeOnly ? 'WHERE is_active = 1' : '';
    const [rows] = await pool.execute(
      `SELECT * FROM sliders ${where} ORDER BY sort_order ASC, id DESC LIMIT ${limitNum} OFFSET ${offset}`
    );
    const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM sliders ${where}`);
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

export default Slider;
