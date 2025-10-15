import Shipping from '../../models/order/shipping.model.js';

const shippingController = {
  // Lấy tất cả phương thức giao hàng đang hoạt động
  async getShippingMethods(req, res) {
    try {
      const methods = await Shipping.findAll();
      
      res.json({
        success: true,
        data: methods
      });
    } catch (error) {
      console.error('Get shipping methods error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy phương thức giao hàng', 
        error: error.message 
      });
    }
  },

  // Lấy chi tiết phương thức giao hàng
  async getShippingMethod(req, res) {
    try {
      const { shipping_id } = req.params;
      
      const method = await Shipping.findById(shipping_id);
      if (!method) {
        return res.status(404).json({ message: 'Phương thức giao hàng không tồn tại' });
      }

      res.json({
        success: true,
        data: method
      });
    } catch (error) {
      console.error('Get shipping method error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy chi tiết phương thức giao hàng', 
        error: error.message 
      });
    }
  },

  // Tính phí giao hàng
  async calculateShippingCost(req, res) {
    try {
      const { shipping_id } = req.params;
      const { address, weight } = req.body;

      const cost = await Shipping.calculateShippingCost(shipping_id, address, weight);

      res.json({
        success: true,
        data: cost
      });
    } catch (error) {
      console.error('Calculate shipping cost error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi tính phí giao hàng', 
        error: error.message 
      });
    }
  },

  // Tạo phương thức giao hàng mới (Admin only)
  async createShippingMethod(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể tạo phương thức giao hàng' });
      }

      const { name, description, cost, estimated_days } = req.body;

      if (!name || cost === undefined) {
        return res.status(400).json({ message: 'Tên và giá là bắt buộc' });
      }

      const method = await Shipping.create({ name, description, cost, estimated_days });

      res.status(201).json({
        success: true,
        message: 'Tạo phương thức giao hàng thành công',
        data: method
      });
    } catch (error) {
      console.error('Create shipping method error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi tạo phương thức giao hàng', 
        error: error.message 
      });
    }
  },

  // Cập nhật phương thức giao hàng (Admin only)
  async updateShippingMethod(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể cập nhật phương thức giao hàng' });
      }

      const { shipping_id } = req.params;
      const { name, description, cost, estimated_days, is_active } = req.body;

      const method = await Shipping.update(shipping_id, { 
        name, 
        description, 
        cost, 
        estimated_days, 
        is_active 
      });

      if (!method) {
        return res.status(404).json({ message: 'Phương thức giao hàng không tồn tại' });
      }

      res.json({
        success: true,
        message: 'Cập nhật phương thức giao hàng thành công',
        data: method
      });
    } catch (error) {
      console.error('Update shipping method error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật phương thức giao hàng', 
        error: error.message 
      });
    }
  },

  // Xóa phương thức giao hàng (Admin only)
  async deleteShippingMethod(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể xóa phương thức giao hàng' });
      }

      const { shipping_id } = req.params;
      const success = await Shipping.delete(shipping_id);

      if (!success) {
        return res.status(404).json({ message: 'Phương thức giao hàng không tồn tại' });
      }

      res.json({
        success: true,
        message: 'Xóa phương thức giao hàng thành công'
      });
    } catch (error) {
      console.error('Delete shipping method error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa phương thức giao hàng', 
        error: error.message 
      });
    }
  },

  // Bật/tắt phương thức giao hàng (Admin only)
  async toggleShippingMethod(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể thay đổi trạng thái phương thức giao hàng' });
      }

      const { shipping_id } = req.params;
      const method = await Shipping.toggleStatus(shipping_id);

      if (!method) {
        return res.status(404).json({ message: 'Phương thức giao hàng không tồn tại' });
      }

      res.json({
        success: true,
        message: `Đã ${method.is_active ? 'bật' : 'tắt'} phương thức giao hàng`,
        data: method
      });
    } catch (error) {
      console.error('Toggle shipping method error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi thay đổi trạng thái phương thức giao hàng', 
        error: error.message 
      });
    }
  }
};

export default shippingController;
