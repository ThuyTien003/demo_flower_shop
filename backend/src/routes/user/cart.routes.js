import { Router } from 'express';
import cartController from '../../controllers/user/cart.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = Router();

// Cart routes (require authentication for all operations)
router.use(verifyToken);
router.get('/', cartController.getCart);
router.get('/count', cartController.getCartCount);
router.post('/add', cartController.addToCart);
router.put('/item/:product_id', cartController.updateCartItem);
router.delete('/item/:product_id', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

// Transfer endpoint is no longer needed when guest carts are disabled

export default router;
