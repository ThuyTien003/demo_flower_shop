import { Router } from 'express';
import wishlistController from '../../controllers/user/wishlist.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = Router();

// All wishlist endpoints require login
router.use(verifyToken);

router.get('/', wishlistController.getMyWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.get('/check/:productId', wishlistController.isInWishlist);

export default router;
