import { Router } from 'express';
import productController from '../../controllers/product/product.controller.js';
import { verifyToken, isAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:category_id', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.get('/:id/related', productController.getRelatedProducts);

// Protected routes (require authentication)
router.use(verifyToken);

// Admin routes
router.use(isAdmin);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
