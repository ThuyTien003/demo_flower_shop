import express from 'express';
import ChatbotController from '../../controllers/chatbot/chatbot.controller.js';
import { authenticateToken, optionalAuth } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no auth required, but can use session)
router.post('/chat', optionalAuth, ChatbotController.sendMessage);
router.get('/chat/history/:sessionId', optionalAuth, ChatbotController.getHistory);
router.get('/chat/knowledge', ChatbotController.searchKnowledge);

// Protected routes (require authentication)
router.get('/chat/recommendations', authenticateToken, ChatbotController.getRecommendations);
router.get('/chat/purchase-history', authenticateToken, ChatbotController.getPurchaseHistory);
router.get('/chat/preferences', authenticateToken, ChatbotController.getPreferences);
router.post('/chat/preferences', authenticateToken, ChatbotController.savePreference);

export default router;
