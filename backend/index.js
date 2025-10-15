import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './src/routes/user/user.routes.js';
import productRoutes from './src/routes/product/product.routes.js';
import categoryRoutes from './src/routes/product/category.routes.js';
import wishlistRoutes from './src/routes/user/wishlist.routes.js';
import cartRoutes from './src/routes/user/cart.routes.js';
import orderRoutes from './src/routes/order/order.routes.js';
import shippingRoutes from './src/routes/order/shipping.routes.js';
import paymentRoutes from './src/routes/order/payment.routes.js';
import blogRoutes from './src/routes/blog/blog.routes.js';
import contactRoutes from './src/routes/contact/contact.routes.js';
import adminRoutes from './src/routes/admin/admin.routes.js';
import sliderPublicRoutes from './src/routes/admin/slider.routes.js';
import chatbotRoutes from './src/routes/chatbot/chatbot.routes.js';
import recommendationRoutes from './src/routes/product/recommendation.routes.js';
import reviewRoutes from './src/routes/product/review.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Cấu hình CORS đúng cho cả local và online
const allowedOrigins = [
  'https://demo-flower-shop-full.vercel.app', // domain Vercel
  'http://localhost:5173',                    // local dev
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép nếu không có origin (Postman) hoặc có trong danh sách cho phép
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked from origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Flower Shop API is running', version: '1.0.0' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/carts', cartRoutes); // alias
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', blogRoutes);
app.use('/api', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', sliderPublicRoutes);
app.use('/api', chatbotRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api', reviewRoutes);

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
