import pool from '../../config/db.config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const User = {
  // Create a new user
  async create({ username, email, password, full_name, phone, address, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, full_name, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, phone, address, role]
    );
    return this.findById(result.insertId);
  },

  // Find user by ID
  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [id]);
    return rows[0];
  },

  // Find user by email
  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  // Find user by username
  async findByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },

  // Generate JWT token
  generateToken(user) {
    const payload = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
  },

  // Verify password
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },

  // Update user profile
  async updateProfile(userId, { full_name, phone, address }) {
    await pool.execute(
      'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE user_id = ?',
      [full_name, phone, address, userId]
    );
    return this.findById(userId);
  },

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const isValid = await this.verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [newHashedPassword, userId]
    );
    
    return { message: 'Password updated successfully' };
  },

  // ADMIN: list users with pagination and optional search by q (username/email/full_name) and role
  async adminList({ page = 1, limit = 20, q, role }) {
    const limitNum = Math.max(1, parseInt(limit));
    const pageNum = Math.max(1, parseInt(page));
    const offset = (pageNum - 1) * limitNum;

    const where = [];
    const params = [];
    if (q) {
      where.push('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (role) {
      where.push('role = ?');
      params.push(role);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.execute(
      `SELECT user_id, username, email, full_name, phone, address, role, created_at
       FROM users
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM users ${whereSql}`,
      params
    );

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

  // ADMIN: update role
  async adminUpdateRole(userId, role) {
    await pool.execute('UPDATE users SET role = ? WHERE user_id = ?', [role, Number(userId)]);
    return this.findById(userId);
  },

  // ADMIN: reset password directly
  async adminResetPassword(userId, newPassword) {
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHashedPassword, Number(userId)]);
    return { message: 'Password reset successfully' };
  },

  // ADMIN: update user profile fields
  async adminUpdate(userId, { username, email, full_name, phone, address }) {
    const current = await this.findById(userId);
    if (!current) return null;
    const next = {
      username: username !== undefined ? username : current.username,
      email: email !== undefined ? email : current.email,
      full_name: full_name !== undefined ? full_name : current.full_name,
      phone: phone !== undefined ? phone : current.phone,
      address: address !== undefined ? address : current.address,
    };
    await pool.execute(
      'UPDATE users SET username = ?, email = ?, full_name = ?, phone = ?, address = ? WHERE user_id = ?',
      [next.username, next.email, next.full_name, next.phone, next.address, Number(userId)]
    );
    return this.findById(userId);
  },

  // ADMIN: delete user
  async adminDelete(userId) {
    const [res] = await pool.execute('DELETE FROM users WHERE user_id = ?', [Number(userId)]);
    return res.affectedRows > 0;
  }
};

export default User;
