import { Router } from 'express';
import categoryController from '../../controllers/product/category.controller.js';
import { verifyToken, isAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/parents', categoryController.getParentCategories);
router.get('/children/:parentId', categoryController.getChildCategories);
router.get('/with-counts', categoryController.getCategoriesWithCounts);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:id', categoryController.getCategoryById);

// Protected routes (require authentication)
router.use(verifyToken);

// Admin routes
router.use(isAdmin);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
