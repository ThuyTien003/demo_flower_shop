import Order from '../../models/order/order.model.js';
import Cart from '../../models/admin/cart.model.js';
import Shipping from '../../models/order/shipping.model.js';
import Payment from '../../models/order/payment.model.js';

const orderController = {
  // Tạo đơn hàng mới
  async createOrder(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập để đặt hàng' });
      }

      const {
        shipping_address,
        shipping_id,
        payment_id,
        note,
        cart_id
      } = req.body;

      // Validate required fields
      if (!shipping_address || !shipping_id || !payment_id) {
        return res.status(400).json({ 
          message: 'Địa chỉ giao hàng, phương thức giao hàng và thanh toán là bắt buộc' 
        });
      }

      // Lấy items từ giỏ hàng
      let cartItems;
      if (cart_id) {
        cartItems = await Cart.getCartItems(cart_id);
      } else {
        const cart = await Cart.getOrCreateCart(userId);
        cartItems = await Cart.getCartItems(cart.cart_id);
      }

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Giỏ hàng trống' });
      }

      // Kiểm tra tồn kho
      for (const item of cartItems) {
        if (item.stock_quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Sản phẩm "${item.name}" không đủ số lượng. Còn lại: ${item.stock_quantity}` 
          });
        }
      }

      // Tính tổng tiền
      const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      
      // Lấy phí giao hàng
      const shippingCost = await Shipping.calculateShippingCost(shipping_id, shipping_address);
      // Ép kiểu số để tránh nối chuỗi khi cost là string từ DB
      const shippingFee = Number(shippingCost.cost) || 0;
      const totalAmount = Number(subtotal) + shippingFee;

      // Tạo đơn hàng
      const orderData = {
        userId,
        totalAmount,
        shippingAddress: shipping_address,
        shippingId: shipping_id,
        paymentId: payment_id,
        note,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: Number(item.unit_price)
        }))
      };

      const order = await Order.create(orderData);

      // Xử lý thanh toán
      const paymentResult = await Payment.processPayment(payment_id, {
        order_id: order.order_id,
        total_amount: totalAmount,
        user_id: userId
      });

      // Xóa giỏ hàng sau khi đặt hàng thành công
      if (cart_id) {
        await Cart.clearCart(cart_id);
      } else {
        const cart = await Cart.getOrCreateCart(userId);
        await Cart.clearCart(cart.cart_id);
      }

      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công',
        data: {
          order,
          payment: paymentResult
        }
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi tạo đơn hàng', 
        error: error.message 
      });
    }
  },

  // Lấy danh sách đơn hàng của user
  async getUserOrders(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const orders = await Order.findByUserId(userId, page, limit);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total: orders.length
        }
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy danh sách đơn hàng', 
        error: error.message 
      });
    }
  },

  // Lấy chi tiết đơn hàng
  async getOrderDetail(req, res) {
    try {
      const { order_id } = req.params;
      const userId = req.user?.id;

      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      }

      // Kiểm tra quyền truy cập (user chỉ xem được đơn hàng của mình, admin xem được tất cả)
      if (req.user?.role !== 'admin' && order.user_id !== userId) {
        return res.status(403).json({ message: 'Không có quyền truy cập đơn hàng này' });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Get order detail error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy chi tiết đơn hàng', 
        error: error.message 
      });
    }
  },

  // Hủy đơn hàng
  async cancelOrder(req, res) {
    try {
      const { order_id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id;

      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      }

      // Kiểm tra quyền hủy đơn hàng
      if (req.user?.role !== 'admin' && order.user_id !== userId) {
        return res.status(403).json({ message: 'Không có quyền hủy đơn hàng này' });
      }

      // Chỉ cho phép hủy đơn hàng ở trạng thái pending hoặc processing
      if (!['pending', 'processing'].includes(order.status)) {
        return res.status(400).json({ 
          message: 'Không thể hủy đơn hàng ở trạng thái hiện tại' 
        });
      }

      const cancelledOrder = await Order.cancel(order_id, reason);

      res.json({
        success: true,
        message: 'Đã hủy đơn hàng thành công',
        data: cancelledOrder
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi hủy đơn hàng', 
        error: error.message 
      });
    }
  },

  // Cập nhật trạng thái đơn hàng (Admin only)
  async updateOrderStatus(req, res) {
    try {
      const { order_id } = req.params;
      const { status } = req.body;

      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể cập nhật trạng thái đơn hàng' });
      }

      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Trạng thái không hợp lệ',
          valid_statuses: validStatuses
        });
      }

      const order = await Order.updateStatus(order_id, status);
      if (!order) {
        return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      }

      res.json({
        success: true,
        message: 'Đã cập nhật trạng thái đơn hàng',
        data: order
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật trạng thái đơn hàng', 
        error: error.message 
      });
    }
  },

  // Lấy tất cả đơn hàng (Admin only)
  async getAllOrders(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể xem tất cả đơn hàng' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      const orders = await Order.findAll(page, limit, status);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total: orders.length
        }
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy danh sách đơn hàng', 
        error: error.message 
      });
    }
  },

  // Thống kê đơn hàng (Admin only)
  async getOrderStatistics(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể xem thống kê' });
      }

      const { start_date, end_date } = req.query;
      const statistics = await Order.getStatistics(start_date, end_date);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Get order statistics error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy thống kê đơn hàng', 
        error: error.message 
      });
    }
  },

  // Lấy doanh thu theo tháng (Admin only)
  async getMonthlyRevenue(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể xem doanh thu' });
      }

      const year = parseInt(req.query.year) || new Date().getFullYear();
      const revenue = await Order.getMonthlyRevenue(year);

      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      console.error('Get monthly revenue error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy doanh thu theo tháng', 
        error: error.message 
      });
    }
  },

  // Lấy sản phẩm bán chạy (Admin only)
  async getTopSellingProducts(req, res) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể xem thống kê sản phẩm' });
      }

      const limit = parseInt(req.query.limit) || 10;
      const products = await Order.getTopSellingProducts(limit);

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get top selling products error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy sản phẩm bán chạy', 
        error: error.message 
      });
    }
  }
};

export default orderController;
