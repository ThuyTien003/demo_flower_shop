import { Router } from 'express';
import reviewController from '../../controllers/product/review.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = Router();

// Public: list reviews for a product
router.get('/products/:product_id/reviews', reviewController.listByProduct);

// Authenticated: create/update via product scoped endpoint (upsert)
router.post('/products/:product_id/reviews', verifyToken, reviewController.create);

// Authenticated: get my review for a product
router.get('/products/:product_id/my-review', verifyToken, reviewController.myReview);

// Authenticated: update/delete by review id
router.put('/reviews/:review_id', verifyToken, reviewController.update);
router.delete('/reviews/:review_id', verifyToken, reviewController.remove);

export default router;
