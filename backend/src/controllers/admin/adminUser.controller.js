import User from '../../models/admin/user.model.js';
import AdminLog from '../../models/admin/adminLog.model.js';

const adminUserController = {
  // POST /admin/users
  async create(req, res) {
    try {
      const { username, email, password, full_name, phone, address, role = 'user' } = req.body || {};
      if (!username || !email || !password || String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'username, email và password (>=6) là bắt buộc' });
      }
      if (!['user','admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'role không hợp lệ' });
      }
      const created = await User.create({ username, email, password, full_name, phone, address, role });
      try { await AdminLog.create({ user_id: req.user?.id, action: 'create', resource: 'user', resource_id: created.user_id, details: { username, email, role } }); } catch {}
      res.status(201).json({ success: true, message: 'User created', data: created });
    } catch (error) {
      console.error('Admin create user error:', error);
      res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
    }
  },
  // PUT /admin/users/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const { username, email, full_name, phone, address } = req.body || {};
      const updated = await User.adminUpdate(id, { username, email, full_name, phone, address });
      if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
      try { await AdminLog.create({ user_id: req.user?.id, action: 'update', resource: 'user', resource_id: Number(id), details: { username, email } }); } catch {}
      res.json({ success: true, message: 'User updated', data: updated });
    } catch (error) {
      console.error('Admin update user error:', error);
      res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
    }
  },

  // DELETE /admin/users/:id
  async remove(req, res) {
    try {
      const { id } = req.params;
      const ok = await User.adminDelete(id);
      if (!ok) return res.status(404).json({ success: false, message: 'User not found' });
      try { await AdminLog.create({ user_id: req.user?.id, action: 'delete', resource: 'user', resource_id: Number(id), details: null }); } catch {}
      res.json({ success: true, message: 'User deleted' });
    } catch (error) {
      console.error('Admin delete user error:', error);
      res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
    }
  },
  // GET /admin/users
  async list(req, res) {
    try {
      const { page = 1, limit = 20, q, role } = req.query;
      const result = await User.adminList({ page, limit, q, role });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      console.error('Admin list users error:', error);
      res.status(500).json({ success: false, message: 'Error listing users', error: error.message });
    }
  },

  // PUT /admin/users/:id/role
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!role || !['user','admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      const updated = await User.adminUpdateRole(id, role);
      // log
      try { await AdminLog.create({ user_id: req.user?.id, action: 'update', resource: 'user.role', resource_id: Number(id), details: { role } }); } catch {}
      res.json({ success: true, message: 'Role updated', data: updated });
    } catch (error) {
      console.error('Admin update role error:', error);
      res.status(500).json({ success: false, message: 'Error updating role', error: error.message });
    }
  },

  // POST /admin/users/:id/reset-password
  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      if (!newPassword || String(newPassword).length < 6) {
        return res.status(400).json({ success: false, message: 'newPassword must be at least 6 characters' });
      }
      await User.adminResetPassword(id, newPassword);
      // log
      try { await AdminLog.create({ user_id: req.user?.id, action: 'update', resource: 'user.password', resource_id: Number(id), details: null }); } catch {}
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      console.error('Admin reset password error:', error);
      res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
    }
  }
};

export default adminUserController;
