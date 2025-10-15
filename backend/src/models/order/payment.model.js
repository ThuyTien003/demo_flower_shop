import pool from '../../config/db.config.js';

const Payment = {
  // Lấy tất cả phương thức thanh toán đang hoạt động
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY payment_id ASC'
    );
    return rows;
  },

  // Tìm phương thức thanh toán theo ID
  async findById(paymentId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payment_methods WHERE payment_id = ?',
      [paymentId]
    );
    return rows[0];
  },

  // Tạo phương thức thanh toán mới (admin)
  async create({ name, description }) {
    const [result] = await pool.execute(
      'INSERT INTO payment_methods (name, description) VALUES (?, ?)',
      [name, description]
    );
    return this.findById(result.insertId);
  },

  // Cập nhật phương thức thanh toán (admin)
  async update(paymentId, { name, description, is_active }) {
    await pool.execute(
      'UPDATE payment_methods SET name = ?, description = ?, is_active = ? WHERE payment_id = ?',
      [name, description, is_active, paymentId]
    );
    return this.findById(paymentId);
  },

  // Xóa phương thức thanh toán (admin)
  async delete(paymentId) {
    const [result] = await pool.execute(
      'DELETE FROM payment_methods WHERE payment_id = ?',
      [paymentId]
    );
    return result.affectedRows > 0;
  },

  // Bật/tắt phương thức thanh toán
  async toggleStatus(paymentId) {
    await pool.execute(
      'UPDATE payment_methods SET is_active = NOT is_active WHERE payment_id = ?',
      [paymentId]
    );
    return this.findById(paymentId);
  },

  // Xử lý thanh toán (có thể tích hợp với các cổng thanh toán)
  async processPayment(paymentId, orderData) {
    const payment = await this.findById(paymentId);
    if (!payment) {
      throw new Error('Phương thức thanh toán không tồn tại');
    }

    // Hiện tại chỉ mô phỏng xử lý thanh toán
    // Trong thực tế, đây là nơi tích hợp với các cổng thanh toán như VNPay, MoMo, PayPal...
    
    switch (payment.name.toLowerCase()) {
      case 'cod':
      case 'thanh toán khi nhận hàng':
        return {
          status: 'pending',
          message: 'Đơn hàng sẽ được thanh toán khi nhận hàng',
          transaction_id: null
        };
        
      case 'bank transfer':
      case 'chuyển khoản ngân hàng':
        return {
          status: 'pending',
          message: 'Vui lòng chuyển khoản theo thông tin được cung cấp',
          transaction_id: this.generateTransactionId(),
          bank_info: {
            bank_name: 'Ngân hàng ABC',
            account_number: '1234567890',
            account_name: 'CONG TY HOA TUOI',
            amount: orderData.total_amount,
            content: `Thanh toan don hang ${orderData.order_id}`
          }
        };
        
      case 'vnpay':
        // Tích hợp VNPay
        return {
          status: 'redirect',
          message: 'Chuyển hướng đến VNPay để thanh toán',
          payment_url: this.generateVNPayUrl(orderData),
          transaction_id: this.generateTransactionId()
        };
        
      case 'momo':
        // Tích hợp MoMo
        return {
          status: 'redirect',
          message: 'Chuyển hướng đến MoMo để thanh toán',
          payment_url: this.generateMoMoUrl(orderData),
          transaction_id: this.generateTransactionId()
        };
        
      default:
        return {
          status: 'pending',
          message: 'Đơn hàng đang chờ xử lý thanh toán',
          transaction_id: this.generateTransactionId()
        };
    }
  },

  // Tạo transaction ID
  generateTransactionId() {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  },

  // Tạo URL thanh toán VNPay (mô phỏng)
  generateVNPayUrl(orderData) {
    // Trong thực tế, cần tích hợp với VNPay SDK
    const baseUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const params = new URLSearchParams({
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: 'YOUR_TMN_CODE',
      vnp_Amount: orderData.total_amount * 100, // VNPay tính bằng đồng
      vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0],
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang ${orderData.order_id}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: `${process.env.FRONTEND_URL}/payment/callback`,
      vnp_TxnRef: orderData.order_id
    });
    
    return `${baseUrl}?${params.toString()}`;
  },

  // Tạo URL thanh toán MoMo (mô phỏng)
  generateMoMoUrl(orderData) {
    // Demo: chuyển hướng về FE callback và giả lập thanh toán thành công
    // Thực tế: tích hợp MoMo SDK để tạo payment_url chuẩn
    const fe = process.env.FRONTEND_URL || 'http://localhost:5173';
    const txn = this.generateTransactionId();
    const params = new URLSearchParams({
      provider: 'momo',
      orderId: String(orderData.order_id),
      amount: String(orderData.total_amount),
      resultCode: '0', // 0 = success (mô phỏng)
      transId: txn
    });
    return `${fe}/payment/callback?${params.toString()}`;
  },

  // Xác nhận thanh toán (callback từ cổng thanh toán)
  async confirmPayment(transactionId, status, paymentData = {}) {
    // Cập nhật trạng thái thanh toán trong database
    // Trong thực tế, cần có bảng riêng để lưu thông tin giao dịch
    
    return {
      transaction_id: transactionId,
      status: status, // 'success', 'failed', 'pending'
      confirmed_at: new Date(),
      payment_data: paymentData
    };
  }
};

export default Payment;
