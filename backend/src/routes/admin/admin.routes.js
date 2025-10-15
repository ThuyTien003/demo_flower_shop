import { Router } from 'express';
import { verifyToken, isAdmin } from '../../middleware/auth.middleware.js';
import adminLogController from '../../controllers/admin/adminLog.controller.js';
import productHistoryController from '../../controllers/product/productHistory.controller.js';
import sliderController from '../../controllers/admin/slider.controller.js';
import adminUserController from '../../controllers/admin/adminUser.controller.js';

const router = Router();

// All admin routes require auth + admin role
router.use(verifyToken, isAdmin);

// Admin Logs
router.get('/logs', adminLogController.list);

// Product History
router.get('/product-history', productHistoryController.list);
router.get('/product-history/:product_id', productHistoryController.listByProduct);

// Sliders (admin management)
router.get('/sliders', sliderController.list);
router.post('/sliders', sliderController.create);
router.put('/sliders/:id', sliderController.update);
router.delete('/sliders/:id', sliderController.remove);

// Users management
router.post('/users', adminUserController.create);
router.get('/users', adminUserController.list);
router.put('/users/:id/role', adminUserController.updateRole);
router.post('/users/:id/reset-password', adminUserController.resetPassword);
router.put('/users/:id', adminUserController.update);
router.delete('/users/:id', adminUserController.remove);

export default router;
