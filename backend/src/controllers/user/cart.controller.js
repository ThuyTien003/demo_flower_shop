import Cart from '../../models/admin/cart.model.js';
import Product from '../../models/product/product.model.js';

const cartController = {
  // Lấy giỏ hàng của user
  async getCart(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
      }

      const cart = await Cart.getOrCreateCart(userId, null);
      const items = await Cart.getCartItems(cart.cart_id);
      const total = await Cart.getCartTotal(cart.cart_id);

      res.json({
        success: true,
        data: {
          cart_id: cart.cart_id,
          items,
          total
        }
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(req, res) {
    try {
      const { product_id, quantity = 1 } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
      }

      if (!product_id || quantity <= 0) {
        return res.status(400).json({ message: 'Product ID và quantity hợp lệ là bắt buộc' });
      }

      // Kiểm tra sản phẩm có tồn tại và còn hàng không
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }

      if (!product.is_active) {
        return res.status(400).json({ message: 'Sản phẩm không còn kinh doanh' });
      }

      if (product.stock_quantity < quantity) {
        return res.status(400).json({ 
          message: 'Số lượng sản phẩm không đủ', 
          available_quantity: product.stock_quantity 
        });
      }

      const cart = await Cart.getOrCreateCart(userId, null);
      const cartItem = await Cart.addItem(cart.cart_id, product_id, quantity, product.price);

      res.json({
        success: true,
        message: 'Đã thêm sản phẩm vào giỏ hàng',
        data: cartItem
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi thêm sản phẩm vào giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  async updateCartItem(req, res) {
    try {
      const { product_id } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
      }

      if (quantity < 0) {
        return res.status(400).json({ message: 'Số lượng không thể âm' });
      }

      // Kiểm tra số lượng tồn kho nếu quantity > 0
      if (quantity > 0) {
        const product = await Product.findById(product_id);
        if (!product) {
          return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        if (product.stock_quantity < quantity) {
          return res.status(400).json({ 
            message: 'Số lượng sản phẩm không đủ', 
            available_quantity: product.stock_quantity 
          });
        }
      }

      const cart = await Cart.getOrCreateCart(userId, null);
      const result = await Cart.updateItemQuantity(cart.cart_id, product_id, quantity);

      if (quantity === 0) {
        res.json({
          success: true,
          message: 'Đã xóa sản phẩm khỏi giỏ hàng'
        });
      } else {
        res.json({
          success: true,
          message: 'Đã cập nhật số lượng sản phẩm',
          data: result
        });
      }
    } catch (error) {
      console.error('Update cart item error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi cập nhật giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(req, res) {
    try {
      const { product_id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
      }

      const cart = await Cart.getOrCreateCart(userId, null);
      const success = await Cart.removeItem(cart.cart_id, product_id);

      if (success) {
        res.json({
          success: true,
          message: 'Đã xóa sản phẩm khỏi giỏ hàng'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Sản phẩm không có trong giỏ hàng'
        });
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Xóa toàn bộ giỏ hàng
  async clearCart(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
      }

      const cart = await Cart.getOrCreateCart(userId, null);
      await Cart.clearCart(cart.cart_id);

      res.json({
        success: true,
        message: 'Đã xóa toàn bộ giỏ hàng'
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi xóa giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Lấy số lượng items trong giỏ hàng
  async getCartCount(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.json({ success: true, data: { count: 0, items: 0 } });
      }

      const cart = await Cart.getOrCreateCart(userId, null);
      const total = await Cart.getCartTotal(cart.cart_id);

      res.json({
        success: true,
        data: { 
          count: total.total_quantity || 0,
          items: total.total_items || 0
        }
      });
    } catch (error) {
      console.error('Get cart count error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Lỗi khi lấy số lượng giỏ hàng', 
        error: error.message 
      });
    }
  }
};

export default cartController;
