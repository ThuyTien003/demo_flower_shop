import { Router } from 'express';
import paymentController from '../../controllers/order/payment.controller.js';
import { verifyToken, isAdmin } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', paymentController.getPaymentMethods);
// Detail by ID
router.get('/:payment_id', paymentController.getPaymentMethod);

// Process payment and callbacks (depending on gateway, may be public or secured)
router.post('/:payment_id/process', paymentController.processPayment);
router.post('/callback', paymentController.paymentCallback);

// Admin routes
router.use(verifyToken);
router.use(isAdmin);
router.post('/', paymentController.createPaymentMethod);
router.put('/:payment_id', paymentController.updatePaymentMethod);
router.delete('/:payment_id', paymentController.deletePaymentMethod);
router.post('/:payment_id/toggle', paymentController.togglePaymentMethod);

export default router;
