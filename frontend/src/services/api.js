import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Global response error handling: auto-logout on 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      } catch {
        // ignore storage removal error
      }
      const path = window.location?.pathname || '/';
      const search = window.location?.search || '';
      const next = encodeURIComponent(path + search);
      if (!path.startsWith('/login')) {
        window.location.href = `/login?next=${next}`;
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/users/register', data);
export const login = (data) => api.post('/users/login', data);
export const getProfile = () => api.get('/users/profile');
export const changePassword = (data) => api.put('/users/change-password', data);

// Categories
export const fetchCategories = () => api.get('/categories');
export const fetchCategoriesWithCounts = () => api.get('/categories/with-counts');
export const createCategoryAdmin = (payload) => api.post('/categories', payload);
export const updateCategoryAdmin = (id, payload) => api.put(`/categories/${id}`, payload);
export const deleteCategoryAdmin = (id) => api.delete(`/categories/${id}`);

// Products
export const fetchProducts = (params) => api.get('/products', { params });
export const fetchFeaturedProducts = (params) => api.get('/products/featured', { params });
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const searchProducts = (q, params) => api.get('/products/search', { params: { q, ...params } });
export const fetchProductsByCategory = (categoryId, params) => api.get(`/products/category/${categoryId}`, { params });
export const adminCreateProduct = (payload) => api.post('/products', payload);
export const adminUpdateProduct = (id, payload) => api.put(`/products/${id}`, payload);
export const adminDeleteProduct = (id) => api.delete(`/products/${id}`);

// Wishlist
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (product_id) => api.post('/wishlist', { product_id });
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);
export const checkWishlist = (productId) => api.get(`/wishlist/check/${productId}`);

// Cart
export const getCart = () => api.get('/cart');
export const getCartCount = () => api.get('/cart/count');
export const addToCartApi = ({ product_id, quantity = 1 }) => api.post('/cart/add', { product_id, quantity });
export const updateCartItem = (product_id, quantity) => api.put(`/cart/item/${product_id}`, { quantity });
export const removeCartItem = (product_id) => api.delete(`/cart/item/${product_id}`);
export const clearCart = () => api.delete('/cart/clear');
export const transferCart = (session_id) => api.post('/cart/transfer', { session_id });

// Shipping & Payment
export const fetchShippingMethods = () => api.get('/shipping');
export const fetchPaymentMethods = () => api.get('/payments');

// Orders
export const createOrder = (payload) => api.post('/orders', payload);
export const fetchMyOrders = (params) => api.get('/orders/my', { params });
export const fetchOrderDetail = (order_id) => api.get(`/orders/${order_id}`);
export const cancelOrder = (order_id, reason) => api.post(`/orders/${order_id}/cancel`, { reason });
// Admin Orders
export const listAllOrders = (params) => api.get('/orders', { params });
export const adminUpdateOrderStatus = (order_id, status) => api.put(`/orders/${order_id}/status`, { status });
export const getOrderStatsSummary = (params) => api.get('/orders/stats/summary', { params });
export const getOrderMonthlyRevenue = (params) => api.get('/orders/stats/revenue', { params });
export const getTopSellingProducts = (params) => api.get('/orders/stats/top-products', { params });

// Reviews (removed)

// Blog
// Categories
export const fetchBlogCategories = () => api.get('/blog/categories');
export const fetchBlogCategory = (id) => api.get(`/blog/categories/${id}`);
export const createBlogCategory = (payload) => api.post('/blog/categories', payload); // admin
export const updateBlogCategory = (id, payload) => api.put(`/blog/categories/${id}`, payload); // admin
export const deleteBlogCategory = (id) => api.delete(`/blog/categories/${id}`); // admin

// Posts
export const fetchBlogPosts = (params) => api.get('/blog/posts', { params });
export const fetchBlogPost = (id) => api.get(`/blog/posts/${id}`);
export const createBlogPost = (payload) => api.post('/blog/posts', payload); // admin
export const updateBlogPost = (id, payload) => api.put(`/blog/posts/${id}`, payload); // admin
export const deleteBlogPost = (id) => api.delete(`/blog/posts/${id}`); // admin

// Comments
export const fetchBlogComments = (post_id, params) => api.get(`/blog/posts/${post_id}/comments`, { params });
export const createBlogComment = (post_id, comment) => api.post(`/blog/posts/${post_id}/comments`, { comment });
export const deleteBlogComment = (comment_id) => api.delete(`/blog/comments/${comment_id}`); // admin

// Contacts
export const submitContact = (payload) => api.post('/contacts', payload);
export const listContacts = (params) => api.get('/contacts', { params }); // admin

// Admin APIs
// Logs
export const listAdminLogs = (params) => api.get('/admin/logs', { params });

// Product History
export const listProductHistory = (params) => api.get('/admin/product-history', { params });
export const listProductHistoryByProduct = (product_id, params) => api.get(`/admin/product-history/${product_id}`, { params });

// Sliders
export const listSliders = (params) => api.get('/admin/sliders', { params });
export const createSlider = (payload) => api.post('/admin/sliders', payload);
export const updateSlider = (id, payload) => api.put(`/admin/sliders/${id}`, payload);
export const deleteSlider = (id) => api.delete(`/admin/sliders/${id}`);

// Public sliders (homepage)
export const getActiveSliders = (params) => api.get('/sliders/active', { params });

// Admin: Users
export const listAdminUsers = (params) => api.get('/admin/users', { params });
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const adminResetPassword = (id, newPassword) => api.post(`/admin/users/${id}/reset-password`, { newPassword });
export const createAdminUser = (payload) => api.post('/admin/users', payload);
export const updateAdminUser = (id, payload) => api.put(`/admin/users/${id}`, payload);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);

// Chatbot
export const sendChatMessage = (message, sessionId) => api.post('/chat', { message, sessionId });
export const getChatHistory = (sessionId) => api.get(`/chat/history/${sessionId}`);
export const getChatRecommendations = (limit) => api.get('/chat/recommendations', { params: { limit } });
export const getPurchaseHistory = (limit) => api.get('/chat/purchase-history', { params: { limit } });
export const searchFlowerKnowledge = (q) => api.get('/chat/knowledge', { params: { q } });
export const getUserPreferences = () => api.get('/chat/preferences');
export const saveUserPreference = (preferenceType, preferenceValue, confidence) => 
  api.post('/chat/preferences', { preferenceType, preferenceValue, confidence });

// Recommendations
export const trackProductView = (productId, sessionId) => api.post('/recommendations/track-view', { productId, sessionId });
export const getPersonalizedRecommendations = (sessionId, limit) => api.get('/recommendations/personalized', { 
  params: { sessionId, limit },
  headers: { 'x-session-id': sessionId }
});
export const getSimilarProducts = (productId, limit) => api.get(`/recommendations/similar/${productId}`, { params: { limit } });


