import { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import { sendChatMessage, getChatHistory } from '@/services/api';
import { useSessionId } from '@/hooks/useSessionId';
import { formatCurrency, formatTime } from '@/utils/format';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useSessionId('chatSessionId');

  // Load chat history when session ID is ready
  useEffect(() => {
    if (sessionId) {
      loadHistory(sessionId);
    }
  }, [sessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async (sid) => {
    try {
      const response = await getChatHistory(sid);
      if (response.data.success && response.data.data.messages.length > 0) {
        const formattedMessages = response.data.data.messages.map(msg => ({
          type: msg.sender_type,
          text: msg.message,
          recommendations: msg.recommendations || [],
          timestamp: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      } else {
        // Show welcome message if no history
        setMessages([{
          type: 'bot',
          text: 'Xin chào! Tôi là trợ lý tư vấn hoa của shop.\n\nTôi có thể giúp bạn:\nTư vấn chọn hoa phù hợp theo dịp\nGợi ý sản phẩm dựa trên sở thích\nHướng dẫn chăm sóc hoa\n Giải thích ý nghĩa các loài hoa\n\nBạn cần tư vấn gì về hoa ạ?',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Show welcome message on error
      setMessages([{
        type: 'bot',
        text: 'Xin chào! Tôi là trợ lý tư vấn hoa của shop. Bạn cần tư vấn gì về hoa ạ?',
        timestamp: new Date()
      }]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to UI
    const newUserMessage = {
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage, sessionId);
      
      if (response.data.success) {
        const botMessage = {
          type: 'bot',
          text: response.data.data.message,
          recommendations: response.data.data.recommendations || [],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'bot',
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
    inputRef.current?.focus();
  };

  const formatMessage = (text) => {
    // Convert markdown-style formatting to HTML
    return text
      .split('\n')
      .map((line, i) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <div key={i} dangerouslySetInnerHTML={{ __html: line || '<br/>' }} />;
      });
  };

  const handleProductClick = (productId) => {
    window.location.href = `/products/${productId}`;
  };

  return (
    <>
      {/* Chat Button */}
      <button
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 999,
        }}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <FaComments size={24} />
        <span style={{
          position: 'absolute',
          top: -4,
          right: -4,
          background: '#ff4757',
          color: 'white',
          fontSize: 10,
          fontWeight: 'bold',
          padding: '2px 6px',
          borderRadius: 10,
          border: '2px solid white',
        }}>AI</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 400,
          height: 600,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <FaRobot size={24} />
              <div>
                <h3>Trợ lý tư vấn hoa</h3>
                <p>Luôn sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
            <button
              style={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map((msg, index) => (
              <div key={index} style={{ ...styles.message, ...(msg.type === 'user' ? styles.messageUser : {}) }}>
                <div style={{ ...styles.avatar, ...(msg.type === 'bot' ? styles.avatarBot : styles.avatarUser) }}>
                  {msg.type === 'bot' ? <FaRobot size={20} /> : <FaUser size={20} />}
                </div>
                <div style={{ ...styles.messageContent, ...(msg.type === 'user' ? styles.messageContentUser : {}) }}>
                  <div style={{ ...styles.bubble, ...(msg.type === 'bot' ? styles.bubbleBot : styles.bubbleUser) }}>
                    {formatMessage(msg.text)}
                  </div>
                  
                  {/* Product Recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div style={styles.recommendations}>
                      <div style={styles.recommendationsTitle}>Sản phẩm gợi ý:</div>
                      <div style={styles.recommendationsGrid}>
                        {msg.recommendations.map((product) => (
                          <div
                            key={product.product_id}
                            style={styles.recommendationCard}
                            onClick={() => handleProductClick(product.product_id)}
                          >
                            <img
                              src={product.image_url || '/placeholder.jpg'}
                              alt={product.name}
                              style={styles.recommendationImage}
                            />
                            <div style={styles.recommendationInfo}>
                              <h4>{product.name}</h4>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#667eea' }}>
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div style={styles.time}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={styles.message}>
                <div style={{ ...styles.avatar, ...styles.avatarBot }}>
                  <FaRobot size={20} />
                </div>
                <div style={styles.messageContent}>
                  <div style={{ ...styles.bubble, ...styles.bubbleBot }}>
                    <div style={styles.typing}>
                      <span style={styles.typingDot}></span>
                      <span style={{ ...styles.typingDot, animationDelay: '0.2s' }}></span>
                      <span style={{ ...styles.typingDot, animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div style={styles.quickActions}>
              <button style={styles.quickActionBtn} onClick={() => handleQuickAction('Gợi ý cho hoa sáp')}>
                Hoa sáp
              </button>
              <button style={styles.quickActionBtn} onClick={() => handleQuickAction('Hoa cưới')}>
                Hoa cưới
              </button>
              <button style={styles.quickActionBtn} onClick={() => handleQuickAction('Hoa khai trương')}>
                Hoa khai trương
              </button>
              <button style={styles.quickActionBtn} onClick={() => handleQuickAction('Gợi ý sản phẩm cho tôi')}>
                Gợi ý cho tôi
              </button>
            </div>
          )}

          {/* Input */}
          <form style={styles.input} onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
              style={{ ...styles.inputField, ...(isLoading ? styles.inputFieldDisabled : {}) }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Send message"
              style={{ ...styles.sendBtn, ...(!inputMessage.trim() || isLoading ? styles.sendBtnDisabled : {}) }}
            >
              <FaPaperPlane size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

const styles = {
  toggle: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    zIndex: 999,
  },
  toggleHidden: {
    display: 'none',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    background: '#ff4757',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: 10,
    border: '2px solid white',
  },
  window: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 400,
    height: 600,
    background: 'white',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    width: 32,
    height: 32,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 20,
    background: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  message: {
    display: 'flex',
    gap: 10,
    animation: 'fadeIn 0.3s ease',
  },
  messageUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarBot: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  avatarUser: {
    background: '#e9ecef',
    color: '#495057',
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: '75%',
  },
  messageContentUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    padding: '12px 16px',
    borderRadius: 16,
    lineHeight: 1.5,
    fontSize: 14,
    wordWrap: 'break-word',
  },
  bubbleBot: {
    background: 'white',
    color: '#333',
    borderBottomLeftRadius: 4,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  bubbleUser: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderBottomRightRadius: 4,
  },
  time: {
    fontSize: 11,
    color: '#999',
    padding: '0 4px',
  },
  typing: {
    display: 'flex',
    gap: 4,
    padding: '4px 0',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#999',
    animation: 'typing 1.4s infinite',
  },
  recommendations: {
    marginTop: 8,
    padding: 12,
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  recommendationsTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#667eea',
    marginBottom: 12,
  },
  recommendationsGrid: {
    display: 'grid',
    gap: 12,
  },
  recommendationCard: {
    display: 'flex',
    gap: 12,
    padding: 10,
    background: '#f8f9fa',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  recommendationImage: {
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: 6,
    flexShrink: 0,
  },
  recommendationInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  quickActions: {
    padding: '12px 20px',
    background: 'white',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionBtn: {
    padding: '8px 12px',
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: 20,
    fontSize: 12,
    color: '#495057',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  input: {
    padding: '16px 20px',
    background: 'white',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    gap: 12,
  },
  inputField: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e9ecef',
    borderRadius: 24,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputFieldDisabled: {
    background: '#f8f9fa',
    cursor: 'not-allowed',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default Chatbot;
