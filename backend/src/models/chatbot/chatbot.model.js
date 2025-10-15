import pool from '../../config/db.config.js';

const Chatbot = {
  // Create or get conversation
  async getOrCreateConversation(userId, sessionId) {
    // Try to find active conversation
    const [existing] = await pool.execute(
      'SELECT * FROM chat_conversations WHERE session_id = ? AND is_active = 1 ORDER BY started_at DESC LIMIT 1',
      [sessionId]
    );

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new conversation
    const [result] = await pool.execute(
      'INSERT INTO chat_conversations (user_id, session_id) VALUES (?, ?)',
      [userId || null, sessionId]
    );

    const [newConv] = await pool.execute(
      'SELECT * FROM chat_conversations WHERE conversation_id = ?',
      [result.insertId]
    );

    return newConv[0];
  },

  // Save message
  async saveMessage(conversationId, senderType, message, intent = null, confidence = null) {
    const [result] = await pool.execute(
      'INSERT INTO chat_messages (conversation_id, sender_type, message, intent, confidence) VALUES (?, ?, ?, ?, ?)',
      [conversationId, senderType, message, intent, confidence]
    );

    return result.insertId;
  },

  // Get conversation history
  async getConversationHistory(conversationId, limit = 20) {
    const nLimit = Number(limit) || 20;
    const [messages] = await pool.execute(
      `SELECT * FROM chat_messages 
       WHERE conversation_id = ? 
       ORDER BY created_at DESC 
       LIMIT ${nLimit}`,
      [conversationId]
    );

    return messages.reverse();
  },

  // Save product recommendation
  async saveRecommendation(messageId, productId, reason, score) {
    await pool.execute(
      'INSERT INTO chat_recommendations (message_id, product_id, reason, score) VALUES (?, ?, ?, ?)',
      [messageId, productId, reason, score]
    );
  },

  // Get recommendations for a message
  async getRecommendations(messageId) {
    const [recs] = await pool.execute(
      `SELECT cr.*, p.name, p.price, p.slug,
              (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url
       FROM chat_recommendations cr
       JOIN products p ON cr.product_id = p.product_id
       WHERE cr.message_id = ?
       ORDER BY cr.score DESC`,
      [messageId]
    );

    return recs;
  },

  // Search flower knowledge
  async searchFlowerKnowledge(keywords) {
    const searchTerms = keywords.toLowerCase().split(' ').filter(k => k.length > 2);
    
    if (searchTerms.length === 0) {
      return [];
    }

    const conditions = searchTerms.map(() => 
      '(LOWER(flower_name) LIKE ? OR LOWER(occasion) LIKE ? OR LOWER(keywords) LIKE ? OR LOWER(meaning) LIKE ?)'
    ).join(' OR ');

    const params = searchTerms.flatMap(term => {
      const like = `%${term}%`;
      return [like, like, like, like];
    });

    const [results] = await pool.execute(
      `SELECT * FROM flower_knowledge WHERE ${conditions} LIMIT 10`,
      params
    );

    return results;
  },

  // Get user purchase history
  async getUserPurchaseHistory(userId, limit = 10) {
    const nLimit = Number(limit) || 10;
    const [orders] = await pool.execute(
      `SELECT DISTINCT
         p.product_id,
         p.name,
         p.slug,
         p.price,
         p.category_id,
         c.name as category_name,
         COUNT(oi.order_item_id) as purchase_count,
         SUM(oi.quantity) as total_quantity,
         MAX(o.order_date) as last_purchase_date,
         (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN products p ON oi.product_id = p.product_id
       JOIN categories c ON p.category_id = c.category_id
       WHERE o.user_id = ? AND o.status NOT IN ('cancelled')
       GROUP BY p.product_id
       ORDER BY last_purchase_date DESC, purchase_count DESC
       LIMIT ${nLimit}`,
      [userId]
    );

    return orders;
  },

  // Get recommended products based on purchase history
  async getRecommendedProducts(userId, limit = 5) {
    // Get user's purchase history
    const purchaseHistory = await this.getUserPurchaseHistory(userId, 20);
    
    if (purchaseHistory.length === 0) {
      // Return popular products if no history
      const nLimit = Number(limit) || 5;
      const [popular] = await pool.execute(
        `SELECT 
           p.product_id,
           p.name,
           p.slug,
           p.price,
           p.description,
           c.name as category_name,
           (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url,
           COUNT(oi.order_item_id) as order_count
         FROM products p
         JOIN categories c ON p.category_id = c.category_id
         LEFT JOIN order_items oi ON p.product_id = oi.product_id
         WHERE p.is_active = 1 AND p.stock_quantity > 0
         GROUP BY p.product_id
         ORDER BY order_count DESC
         LIMIT ${nLimit}`,
        []
      );
      return popular;
    }

    // Get category IDs from purchase history
    const categoryIds = [...new Set(purchaseHistory.map(p => p.category_id))];
    const purchasedProductIds = purchaseHistory.map(p => p.product_id);

    // Find similar products from same categories that user hasn't bought
    const placeholders = categoryIds.map(() => '?').join(',');
    const excludePlaceholders = purchasedProductIds.map(() => '?').join(',');

    const nLimit = Number(limit) || 5;
    const [recommended] = await pool.execute(
      `SELECT 
         p.product_id,
         p.name,
         p.slug,
         p.price,
         p.description,
         c.name as category_name,
         (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url,
         COUNT(oi.order_item_id) as order_count
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       LEFT JOIN order_items oi ON p.product_id = oi.product_id
       WHERE p.category_id IN (${placeholders})
         AND p.product_id NOT IN (${excludePlaceholders})
         AND p.is_active = 1
         AND p.stock_quantity > 0
       GROUP BY p.product_id
       ORDER BY order_count DESC, p.created_at DESC
       LIMIT ${nLimit}`,
      [...categoryIds, ...purchasedProductIds]
    );

    return recommended;
  },

  // Save user preference
  async saveUserPreference(userId, preferenceType, preferenceValue, confidence = 1.0) {
    // Check if preference exists
    const [existing] = await pool.execute(
      'SELECT * FROM user_preferences WHERE user_id = ? AND preference_type = ?',
      [userId, preferenceType]
    );

    if (existing.length > 0) {
      // Update existing preference
      await pool.execute(
        'UPDATE user_preferences SET preference_value = ?, confidence = ?, updated_at = CURRENT_TIMESTAMP WHERE preference_id = ?',
        [preferenceValue, confidence, existing[0].preference_id]
      );
    } else {
      // Insert new preference
      await pool.execute(
        'INSERT INTO user_preferences (user_id, preference_type, preference_value, confidence) VALUES (?, ?, ?, ?)',
        [userId, preferenceType, preferenceValue, confidence]
      );
    }
  },

  // Get user preferences
  async getUserPreferences(userId) {
    const [prefs] = await pool.execute(
      'SELECT * FROM user_preferences WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );

    return prefs;
  },

  // Analyze intent from user message
  analyzeIntent(message) {
    const lowerMsg = message.toLowerCase();
    
    // Intent patterns
    const intents = {
      greeting: /^(xin chào|chào|hello|hi|hey)/i,
      recommendation: /(gợi ý|tư vấn|giới thiệu|nên mua|đề xuất|recommend)/i,
      occasion: /(sinh nhật|valentine|kỷ niệm|cưới|đám cưới|khai trương|chia buồn|thăm bệnh|ngày của mẹ|20\/10|8\/3)/i,
      flower_type: /(hoa hồng|hoa ly|hoa cúc|hoa tulip|hoa lan|hoa hướng dương|hoa cẩm chướng|rose|lily|orchid)/i,
      price: /(giá|bao nhiêu|price|cost|budget|ngân sách)/i,
      care: /(chăm sóc|cách chăm|bảo quản|giữ tươi|care)/i,
      meaning: /(ý nghĩa|tượng trưng|biểu tượng|meaning|symbolize)/i,
      order: /(đặt hàng|mua|order|buy|cart|giỏ hàng)/i,
      help: /(giúp|help|hỗ trợ|support)/i
    };

    let detectedIntent = 'general';
    let confidence = 0.5;

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(lowerMsg)) {
        detectedIntent = intent;
        confidence = 0.8;
        break;
      }
    }

    return { intent: detectedIntent, confidence };
  },

  // Generate bot response
  async generateResponse(message, userId, conversationId) {
    const { intent, confidence } = this.analyzeIntent(message);
    let response = '';
    let recommendations = [];

    switch (intent) {
      case 'greeting':
        response = 'Xin chào! Tôi là trợ lý tư vấn hoa của shop. Tôi có thể giúp bạn:\n\n' +
                   '🌸 Tư vấn chọn hoa phù hợp theo dịp\n' +
                   '💐 Gợi ý sản phẩm dựa trên sở thích\n' +
                   '🌺 Hướng dẫn chăm sóc hoa\n' +
                   '🌹 Giải thích ý nghĩa các loài hoa\n\n' +
                   'Bạn cần tư vấn gì về hoa ạ?';
        break;

      case 'recommendation':
        if (userId) {
          const recommended = await this.getRecommendedProducts(userId, 4);
          if (recommended.length > 0) {
            response = 'Dựa trên lịch sử mua hàng của bạn, tôi xin gợi ý những sản phẩm sau:';
            recommendations = recommended;
          } else {
            response = 'Tôi có thể gợi ý hoa cho bạn! Bạn muốn mua hoa cho dịp gì? (Ví dụ: sinh nhật, valentine, khai trương...)';
          }
        } else {
          response = 'Tôi có thể gợi ý hoa cho bạn! Bạn muốn mua hoa cho dịp gì? (Ví dụ: sinh nhật, valentine, khai trương...)';
        }
        break;

      case 'occasion':
        const knowledge = await this.searchFlowerKnowledge(message);
        if (knowledge.length > 0) {
          const flower = knowledge[0];
          response = `🌸 **${flower.flower_name}** rất phù hợp!\n\n` +
                     `✨ **Ý nghĩa:** ${flower.meaning}\n` +
                     `🎨 **Màu sắc:** ${flower.color_significance}\n` +
                     `💰 **Giá:** ${flower.price_range}\n\n` +
                     `Bạn có muốn xem các sản phẩm ${flower.flower_name} không?`;
          
          // Find products matching this flower
          const [products] = await pool.execute(
            `SELECT p.product_id, p.name, p.slug, p.price, p.description,
                    (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url
             FROM products p
             WHERE LOWER(p.name) LIKE ? AND p.is_active = 1 AND p.stock_quantity > 0
             LIMIT 4`,
            [`%${flower.flower_name.toLowerCase()}%`]
          );
          recommendations = products;
        } else {
          response = 'Tôi có thể tư vấn hoa cho nhiều dịp khác nhau như:\n\n' +
                     '💕 Sinh nhật, Valentine, Kỷ niệm\n' +
                     '💒 Đám cưới\n' +
                     '🎉 Khai trương\n' +
                     '🙏 Chia buồn, Thăm bệnh\n' +
                     '👩 Ngày của Mẹ, 20/10, 8/3\n\n' +
                     'Bạn cần hoa cho dịp nào?';
        }
        break;

      case 'flower_type':
        const flowerKnowledge = await this.searchFlowerKnowledge(message);
        if (flowerKnowledge.length > 0) {
          const flower = flowerKnowledge[0];
          response = `🌸 **${flower.flower_name}**\n\n` +
                     `✨ **Ý nghĩa:** ${flower.meaning}\n` +
                     `🎨 **Màu sắc:** ${flower.color_significance}\n` +
                     `🌱 **Chăm sóc:** ${flower.care_tips}\n` +
                     `📅 **Mùa:** ${flower.season}\n` +
                     `💰 **Giá:** ${flower.price_range}\n\n` +
                     `Phù hợp cho: ${flower.occasion}`;
          
          // Find matching products
          const [products] = await pool.execute(
            `SELECT p.product_id, p.name, p.slug, p.price, p.description,
                    (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url
             FROM products p
             WHERE LOWER(p.name) LIKE ? AND p.is_active = 1 AND p.stock_quantity > 0
             LIMIT 4`,
            [`%${flower.flower_name.toLowerCase()}%`]
          );
          recommendations = products;
        } else {
          response = 'Tôi có thể tư vấn về nhiều loại hoa như: Hoa hồng, Hoa ly, Hoa cúc, Hoa tulip, Hoa lan, Hoa hướng dương, Hoa cẩm chướng... Bạn muốn biết về loại hoa nào?';
        }
        break;

      case 'price':
        response = 'Giá hoa tại shop rất đa dạng:\n\n' +
                   '💐 **Phổ thông:** 100.000đ - 300.000đ\n' +
                   '🌸 **Trung cấp:** 300.000đ - 800.000đ\n' +
                   '🌹 **Cao cấp:** 800.000đ - 2.000.000đ+\n\n' +
                   'Bạn có ngân sách bao nhiêu? Tôi sẽ gợi ý sản phẩm phù hợp!';
        break;

      case 'care':
        response = '🌱 **Mẹo chăm sóc hoa tươi lâu:**\n\n' +
                   '1. Cắt chéo cuống hoa trước khi cắm\n' +
                   '2. Thay nước sạch mỗi 2-3 ngày\n' +
                   '3. Đặt bình hoa nơi thoáng mát, tránh ánh nắng trực tiếp\n' +
                   '4. Cắt bỏ lá úa và hoa héo\n' +
                   '5. Có thể thêm đường hoặc aspirin vào nước\n\n' +
                   'Bạn muốn biết cách chăm sóc loại hoa cụ thể nào?';
        break;

      case 'meaning':
        response = '🌸 **Ý nghĩa các loài hoa phổ biến:**\n\n' +
                   '🌹 **Hoa hồng:** Tình yêu, lãng mạn\n' +
                   '🌺 **Hoa ly:** Thuần khiết, thanh lịch\n' +
                   '🌼 **Hoa cúc:** Vui vẻ, lạc quan\n' +
                   '🌷 **Hoa tulip:** Tình yêu hoàn hảo\n' +
                   '🌻 **Hoa hướng dương:** Niềm vui, năng lượng\n' +
                   '🌸 **Hoa lan:** Sang trọng, quý phái\n\n' +
                   'Bạn muốn tìm hiểu về loại hoa nào?';
        break;

      case 'order':
        response = 'Để đặt hàng, bạn có thể:\n\n' +
                   '1. 🛒 Thêm sản phẩm vào giỏ hàng\n' +
                   '2. 📝 Điền thông tin giao hàng\n' +
                   '3. 💳 Chọn phương thức thanh toán\n' +
                   '4. ✅ Xác nhận đơn hàng\n\n' +
                   'Bạn cần tôi gợi ý sản phẩm không?';
        break;

      case 'help':
        response = 'Tôi có thể giúp bạn:\n\n' +
                   '🌸 Tư vấn chọn hoa theo dịp\n' +
                   '💐 Gợi ý sản phẩm phù hợp\n' +
                   '🌺 Hướng dẫn chăm sóc hoa\n' +
                   '🌹 Giải thích ý nghĩa hoa\n' +
                   '💰 Tư vấn giá cả\n' +
                   '📦 Hướng dẫn đặt hàng\n\n' +
                   'Bạn cần giúp đỡ về vấn đề gì?';
        break;

      default:
        // Try to search in knowledge base
        const generalKnowledge = await this.searchFlowerKnowledge(message);
        if (generalKnowledge.length > 0) {
          const flower = generalKnowledge[0];
          response = `Tôi tìm thấy thông tin về **${flower.flower_name}**:\n\n` +
                     `${flower.meaning}\n\n` +
                     `Phù hợp cho: ${flower.occasion}\n\n` +
                     `Bạn có muốn xem sản phẩm không?`;
          
          const [products] = await pool.execute(
            `SELECT p.product_id, p.name, p.slug, p.price, p.description,
                    (SELECT image_url FROM product_images WHERE product_id = p.product_id AND is_primary = 1 LIMIT 1) as image_url
             FROM products p
             WHERE LOWER(p.name) LIKE ? AND p.is_active = 1 AND p.stock_quantity > 0
             LIMIT 4`,
            [`%${flower.flower_name.toLowerCase()}%`]
          );
          recommendations = products;
        } else {
          response = 'Tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi tôi về:\n\n' +
                     '• Gợi ý hoa cho dịp đặc biệt\n' +
                     '• Ý nghĩa các loài hoa\n' +
                     '• Cách chăm sóc hoa\n' +
                     '• Giá cả sản phẩm\n\n' +
                     'Hoặc bạn có thể nói cụ thể hơn về nhu cầu của mình!';
        }
    }

    return {
      response,
      intent,
      confidence,
      recommendations
    };
  }
};

export default Chatbot;
