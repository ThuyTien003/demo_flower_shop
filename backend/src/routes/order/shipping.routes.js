import { Router } from 'express';
import shippingController from '../../controllers/order/shipping.controller.js';
import { verifyToken, isAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', shippingController.getShippingMethods);
router.get('/:shipping_id', shippingController.getShippingMethod);
router.post('/:shipping_id/calculate', shippingController.calculateShippingCost);

// Admin routes
router.use(verifyToken);
router.use(isAdmin);
router.post('/', shippingController.createShippingMethod);
router.put('/:shipping_id', shippingController.updateShippingMethod);
router.delete('/:shipping_id', shippingController.deleteShippingMethod);
router.post('/:shipping_id/toggle', shippingController.toggleShippingMethod);

export default router;
