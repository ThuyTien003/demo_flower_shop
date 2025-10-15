import Payment from '../../models/order/payment.model.js';
import Order from '../../models/order/order.model.js';

const paymentController = {
  // Lấy tất cả phương thức thanh toán đang hoạt động
  async getPaymentMethods(req, res) {
    try {
      const methods = await Payment.findAll();
      
      res.json({
        success: true,
        data: methods
      });
    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy phương thức thanh toán', 
        error: error.message 
      });
    }
  },

  // Lấy chi tiết phương thức thanh toán
  async getPaymentMethod(req, res) {
    try {
      const { payment_id } = req.params;
      
      const method = await Payment.findById(payment_id);
      if (!method) {
        return res.status(404).json({ message: 'Phương thức thanh toán không tồn tại' });
      }

      res.json({
        success: true,
        data: method
      });
    } catch (error) {
      console.error('Get payment method error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy chi tiết phương thức thanh toán', 
        error: error.message 
      });
    }
  },

  // Xử lý thanh toán
  async processPayment(req, res) {
    try {
      const { payment_id } = req.params;
      const orderData = req.body;

      // Ép kiểu và validate ID
      const paymentIdNum = Number(payment_id);
      if (!Number.isInteger(paymentIdNum) || paymentIdNum <= 0) {
        return res.status(400).json({ message: 'payment_id không hợp lệ' });
      }

      // Kiểm tra tồn tại phương thức thanh toán trước khi xử lý
      const method = await Payment.findById(paymentIdNum);
      if (!method) {
        return res.status(404).json({ message: 'Phương thức thanh toán không tồn tại' });
      }

      const result = await Payment.processPayment(paymentIdNum, orderData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Process payment error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xử lý thanh toán', 
        error: error.message 
      });
    }
  },

  // Callback từ cổng thanh toán
  async paymentCallback(req, res) {
    try {
      // Chuẩn hoá dữ liệu callback từ các gateway khác nhau
      const {
        transaction_id,
        status,
        order_id,
        gateway
      } = req.body;

      const paymentData = req.body;

      // Xác nhận thanh toán (mô phỏng) và cập nhật đơn hàng nếu có order_id
      const result = await Payment.confirmPayment(transaction_id, status, paymentData);

      let updatedOrder = null;
      if (order_id) {
        // Map trạng thái thanh toán -> trạng thái đơn hàng
        // success -> processing, failed -> cancelled, pending -> pending
        const map = {
          success: 'processing',
          failed: 'cancelled',
          pending: 'pending'
        };
        const nextStatus = map[(status || '').toLowerCase()] || 'pending';
        try {
          updatedOrder = await Order.updateStatus(order_id, nextStatus);
        } catch (e) {
          console.error('Update order status on payment callback failed:', e);
        }
      }

      res.json({
        success: true,
        message: 'Xác nhận thanh toán thành công',
        data: {
          ...result,
          gateway: gateway || null,
          order: updatedOrder
        }
      });
    } catch (error) {
      console.error('Payment callback error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xác nhận thanh toán', 
        error: error.message 
      });
    }
  },

  // Tạo phương thức thanh toán mới (Admin only)
  async createPaymentMethod(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể tạo phương thức thanh toán' });
      }

      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Tên phương thức thanh toán là bắt buộc' });
      }

      const method = await Payment.create({ name, description });

      res.status(201).json({
        success: true,
        message: 'Tạo phương thức thanh toán thành công',
        data: method
      });
    } catch (error) {
      console.error('Create payment method error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi tạo phương thức thanh toán', 
        error: error.message 
      });
    }
  },

  // Cập nhật phương thức thanh toán (Admin only)
  async updatePaymentMethod(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể cập nhật phương thức thanh toán' });
      }

      const { payment_id } = req.params;
      const { name, description, is_active } = req.body;

      const method = await Payment.update(payment_id, { name, description, is_active });

      if (!method) {
        return res.status(404).json({ message: 'Phương thức thanh toán không tồn tại' });
      }

      res.json({
        success: true,
        message: 'Cập nhật phương thức thanh toán thành công',
        data: method
      });
    } catch (error) {
      console.error('Update payment method error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật phương thức thanh toán', 
        error: error.message 
      });
    }
  },

  // Xóa phương thức thanh toán (Admin only)
  async deletePaymentMethod(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể xóa phương thức thanh toán' });
      }

      const { payment_id } = req.params;
      const success = await Payment.delete(payment_id);

      if (!success) {
        return res.status(404).json({ message: 'Phương thức thanh toán không tồn tại' });
      }

      res.json({
        success: true,
        message: 'Xóa phương thức thanh toán thành công'
      });
    } catch (error) {
      console.error('Delete payment method error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa phương thức thanh toán', 
        error: error.message 
      });
    }
  },

  // Bật/tắt phương thức thanh toán (Admin only)
  async togglePaymentMethod(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể thay đổi trạng thái phương thức thanh toán' });
      }

      const { payment_id } = req.params;
      const method = await Payment.toggleStatus(payment_id);

      if (!method) {
        return res.status(404).json({ message: 'Phương thức thanh toán không tồn tại' });
      }

      res.json({
        success: true,
        message: `Đã ${method.is_active ? 'bật' : 'tắt'} phương thức thanh toán`,
        data: method
      });
    } catch (error) {
      console.error('Toggle payment method error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi thay đổi trạng thái phương thức thanh toán', 
        error: error.message 
      });
    }
  }
};

export default paymentController;
