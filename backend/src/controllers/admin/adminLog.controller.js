import AdminLog from '../../models/admin/adminLog.model.js';
import { isAdmin } from '../../middleware/auth.middleware.js';

const adminLogController = {
  // GET /admin/logs
  async list(req, res) {
    try {
      const { page = 1, limit = 20, action, resource, user, startDate, endDate } = req.query;
      const result = await AdminLog.list({ page, limit, action, resource, user, startDate, endDate });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      console.error('List admin logs error:', error);
      res.status(500).json({ success: false, message: 'Error fetching admin logs', error: error.message });
    }
  }
};

export default adminLogController;
