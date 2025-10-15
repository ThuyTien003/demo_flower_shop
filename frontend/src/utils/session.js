// Get or create session ID from localStorage
export const getOrCreateSessionId = (key = 'sessionId') => {
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
};

// Get auth token from localStorage or sessionStorage
export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
};
