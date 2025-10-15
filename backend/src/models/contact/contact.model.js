import pool from '../../config/db.config.js';

const Contact = {
  async create({ name, email, phone, message }) {
    const [res] = await pool.execute(
      'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name || null, email || null, phone || null, message || null]
    );
    return this.findById(res.insertId);
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM contacts WHERE contact_id = ?', [Number(id)]);
    return rows[0] || null;
  },

  async findAll({ page = 1, limit = 20 } = {}) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;

    const [rows] = await pool.execute(
      `SELECT * FROM contacts ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`
    );
    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM contacts');
    return {
      items: rows,
      pagination: {
        total: countRows[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countRows[0].total / limitNum)
      }
    };
  }
};

export default Contact;
