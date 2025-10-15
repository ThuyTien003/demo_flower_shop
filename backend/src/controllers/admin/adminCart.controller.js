import Cart from '../../models/admin/cart.model.js';

const adminCartController = {
  async list(req, res) {
    try {
      const carts = await Cart.listAllSummaries();
      res.json({ success: true, data: carts });
    } catch (error) {
      console.error('Admin list carts error:', error);
      res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách giỏ hàng', error: error.message });
    }
  },

  async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const cart = await Cart.findCartByUserIdNoCreate(user_id);
      if (!cart) return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng của user' });
      const items = await Cart.getCartItems(cart.cart_id);
      const total = await Cart.getCartTotal(cart.cart_id);
      res.json({ success: true, data: { cart_id: cart.cart_id, items, total } });
    } catch (error) {
      console.error('Admin get cart by user error:', error);
      res.status(500).json({ success: false, message: 'Lỗi khi lấy giỏ hàng', error: error.message });
    }
  }
};

export default adminCartController;
