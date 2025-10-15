import Chatbot from '../../models/chatbot/chatbot.model.js';
import { v4 as uuidv4 } from 'uuid';

const ChatbotController = {
  // Send message to chatbot
  async sendMessage(req, res) {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user?.id || null;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      // Use provided sessionId or generate new one
      const session = sessionId || uuidv4();

      // Get or create conversation
      const conversation = await Chatbot.getOrCreateConversation(userId, session);

      // Save user message
      const userMessageId = await Chatbot.saveMessage(
        conversation.conversation_id,
        'user',
        message.trim()
      );

      // Generate bot response
      const { response, intent, confidence, recommendations } = await Chatbot.generateResponse(
        message.trim(),
        userId,
        conversation.conversation_id
      );

      // Save bot response
      const botMessageId = await Chatbot.saveMessage(
        conversation.conversation_id,
        'bot',
        response,
        intent,
        confidence
      );

      // Save recommendations if any
      if (recommendations && recommendations.length > 0) {
        for (let i = 0; i < recommendations.length; i++) {
          const product = recommendations[i];
          await Chatbot.saveRecommendation(
            botMessageId,
            product.product_id,
            'Based on conversation context',
            100 - (i * 10) // Score decreases for each recommendation
          );
        }
      }

      // Get saved recommendations with full details
      const savedRecommendations = await Chatbot.getRecommendations(botMessageId);

      res.json({
        success: true,
        data: {
          sessionId: session,
          conversationId: conversation.conversation_id,
          message: response,
          intent,
          confidence,
          recommendations: savedRecommendations
        }
      });
    } catch (error) {
      console.error('Chatbot error:', error);
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi xử lý tin nhắn',
        error: error.message
      });
    }
  },

  // Get conversation history
  async getHistory(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id || null;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      // Get conversation
      const conversation = await Chatbot.getOrCreateConversation(userId, sessionId);

      // Get messages
      const messages = await Chatbot.getConversationHistory(conversation.conversation_id);

      // Get recommendations for bot messages
      const messagesWithRecs = await Promise.all(
        messages.map(async (msg) => {
          if (msg.sender_type === 'bot') {
            const recommendations = await Chatbot.getRecommendations(msg.message_id);
            return { ...msg, recommendations };
          }
          return msg;
        })
      );

      res.json({
        success: true,
        data: {
          conversationId: conversation.conversation_id,
          messages: messagesWithRecs
        }
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi lấy lịch sử chat',
        error: error.message
      });
    }
  },

  // Get personalized recommendations
  async getRecommendations(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập để nhận gợi ý cá nhân hóa'
        });
      }

      const limit = parseInt(req.query.limit) || 5;
      const recommendations = await Chatbot.getRecommendedProducts(userId, limit);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi lấy gợi ý sản phẩm',
        error: error.message
      });
    }
  },

  // Get user purchase history
  async getPurchaseHistory(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập'
        });
      }

      const limit = parseInt(req.query.limit) || 10;
      const history = await Chatbot.getUserPurchaseHistory(userId, limit);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get purchase history error:', error);
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi lấy lịch sử mua hàng',
        error: error.message
      });
    }
  },

  // Search flower knowledge
  async searchKnowledge(req, res) {
    try {
      const { q } = req.query;

      if (!q || !q.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const results = await Chatbot.searchFlowerKnowledge(q.trim());

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Search knowledge error:', error);
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi tìm kiếm',
        error: error.message
      });
    }
  },

  // Get user preferences
  async getPreferences(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập'
        });
      }

      const preferences = await Chatbot.getUserPreferences(userId);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi lấy sở thích',
        error: error.message
      });
    }
  },

  // Save user preference
  async savePreference(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập'
        });
      }

      const { preferenceType, preferenceValue, confidence } = req.body;

      if (!preferenceType || !preferenceValue) {
        return res.status(400).json({
          success: false,
          message: 'Preference type and value are required'
        });
      }

      await Chatbot.saveUserPreference(
        userId,
        preferenceType,
        preferenceValue,
        confidence || 1.0
      );

      res.json({
        success: true,
        message: 'Đã lưu sở thích thành công'
      });
    } catch (error) {
      console.error('Save preference error:', error);
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi lưu sở thích',
        error: error.message
      });
    }
  }
};

export default ChatbotController;
