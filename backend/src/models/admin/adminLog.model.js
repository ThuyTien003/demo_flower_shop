import pool from '../../config/db.config.js';

const AdminLog = {
  async create({ user_id, action, resource, resource_id, details }) {
    const [res] = await pool.execute(
      'INSERT INTO admin_logs (user_id, action, resource, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [Number(user_id), action, resource, resource_id ? Number(resource_id) : null, details ? JSON.stringify(details) : null]
    );
    return this.findById(res.insertId);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT al.*
       FROM admin_logs al
       WHERE al.id = ?`,
      [Number(id)]
    );
    return rows[0] || null;
  },

  async list({ page = 1, limit = 20, action, resource, user, startDate, endDate }) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;

    const where = [];
    const params = [];
    if (action) { where.push('al.action = ?'); params.push(action); }
    if (resource) { where.push('al.resource = ?'); params.push(resource); }
    // If your schema has user identifiers on logs (e.g., username), you can filter here accordingly
    // if (user) { where.push('al.username LIKE ?'); const term = `%${user}%`; params.push(term); }
    if (startDate) { where.push('al.created_at >= ?'); params.push(new Date(startDate)); }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.push('al.created_at <= ?');
      params.push(end);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const dataSql = `
      SELECT al.*
      FROM admin_logs al
      ${whereSql}
      ORDER BY al.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;
    const [rows] = await pool.execute(dataSql, params);

    const countSql = `
      SELECT COUNT(*) as total
      FROM admin_logs al
      ${whereSql}
    `;
    const [countRows] = await pool.execute(countSql, params);

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

export default AdminLog;
