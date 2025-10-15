/**
 * Test script for chatbot functionality
 * Run: node src/scripts/test_chatbot.js
 */

import pool from '../config/db.config.js';
import Chatbot from '../models/chatbot/chatbot.model.js';

async function testChatbot() {
  console.log('🤖 Testing Chatbot Functionality...\n');

  try {
    // Test 1: Check database tables
    console.log('Test 1: Checking database tables...');
    const tables = [
      'chat_conversations',
      'chat_messages',
      'chat_recommendations',
      'user_preferences',
      'flower_knowledge'
    ];

    for (const table of tables) {
      const [rows] = await pool.execute(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`   ✓ Table '${table}' exists`);
      } else {
        console.log(`   ✗ Table '${table}' NOT FOUND!`);
      }
    }

    // Test 2: Check flower knowledge data
    console.log('\nTest 2: Checking flower knowledge data...');
    const [knowledge] = await pool.execute('SELECT COUNT(*) as count FROM flower_knowledge');
    console.log(`   ✓ Found ${knowledge[0].count} flower knowledge entries`);

    // Test 3: Test intent analysis
    console.log('\nTest 3: Testing intent analysis...');
    const testMessages = [
      'Xin chào',
      'Gợi ý hoa cho sinh nhật',
      'Hoa hồng có ý nghĩa gì?',
      'Giá hoa bao nhiêu?',
      'Cách chăm sóc hoa ly'
    ];

    for (const msg of testMessages) {
      const { intent, confidence } = Chatbot.analyzeIntent(msg);
      console.log(`   "${msg}" → Intent: ${intent} (${(confidence * 100).toFixed(0)}%)`);
    }

    // Test 4: Test flower knowledge search
    console.log('\nTest 4: Testing flower knowledge search...');
    const searchResults = await Chatbot.searchFlowerKnowledge('sinh nhật hoa hồng');
    console.log(`   ✓ Found ${searchResults.length} results for "sinh nhật hoa hồng"`);
    if (searchResults.length > 0) {
      console.log(`   First result: ${searchResults[0].flower_name}`);
    }

    // Test 5: Test conversation creation
    console.log('\nTest 5: Testing conversation creation...');
    const testSessionId = `test_${Date.now()}`;
    const conversation = await Chatbot.getOrCreateConversation(null, testSessionId);
    console.log(`   ✓ Created conversation with ID: ${conversation.conversation_id}`);

    // Test 6: Test message saving
    console.log('\nTest 6: Testing message saving...');
    const messageId = await Chatbot.saveMessage(
      conversation.conversation_id,
      'user',
      'Test message',
      'greeting',
      0.9
    );
    console.log(`   ✓ Saved message with ID: ${messageId}`);

    // Test 7: Test response generation
    console.log('\nTest 7: Testing response generation...');
    const response = await Chatbot.generateResponse(
      'Gợi ý hoa cho sinh nhật',
      null,
      conversation.conversation_id
    );
    console.log(`   ✓ Generated response (${response.response.length} chars)`);
    console.log(`   Intent: ${response.intent}`);
    console.log(`   Recommendations: ${response.recommendations.length} products`);

    // Test 8: Test recommended products (if user exists)
    console.log('\nTest 8: Testing product recommendations...');
    const [users] = await pool.execute('SELECT user_id FROM users LIMIT 1');
    if (users.length > 0) {
      const userId = users[0].user_id;
      const recommended = await Chatbot.getRecommendedProducts(userId, 5);
      console.log(`   ✓ Found ${recommended.length} recommended products for user ${userId}`);
    } else {
      console.log('   ⚠ No users found in database, skipping recommendation test');
    }

    // Cleanup test data
    console.log('\nCleaning up test data...');
    await pool.execute('DELETE FROM chat_conversations WHERE session_id = ?', [testSessionId]);
    console.log('   ✓ Test data cleaned up');

    console.log('\nAll tests completed successfully!\n');
    console.log(' Chatbot is ready to use!');

  } catch (error) {
    console.error('\n Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

// Run tests
testChatbot();
