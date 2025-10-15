import { Router } from 'express';
import orderController from '../../controllers/order/order.controller.js';
import { verifyToken, isAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

// User must be authenticated for order-related actions
router.use(verifyToken);

// Create order
router.post('/', orderController.createOrder);

// User orders
router.get('/my', orderController.getUserOrders);
router.get('/:order_id', orderController.getOrderDetail);
router.post('/:order_id/cancel', orderController.cancelOrder);

// Admin routes
router.use(isAdmin);
router.get('/', orderController.getAllOrders);
router.put('/:order_id/status', orderController.updateOrderStatus);
router.get('/stats/summary', orderController.getOrderStatistics);
router.get('/stats/revenue', orderController.getMonthlyRevenue);
router.get('/stats/top-products', orderController.getTopSellingProducts);

export default router;
