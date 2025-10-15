import express from 'express';
import { trackView, getPersonalizedRecommendations, getSimilarProducts } from '../../controllers/product/recommendation.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Track product view (optional auth - works for both logged in and guest users)
router.post('/track-view', optionalAuth, trackView);

// Get personalized recommendations for homepage (optional auth)
router.get('/personalized', optionalAuth, getPersonalizedRecommendations);

// Get similar products for product detail page (public)
router.get('/similar/:productId', getSimilarProducts);

export default router;
