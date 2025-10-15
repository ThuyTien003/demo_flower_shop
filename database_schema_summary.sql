-- =====================================================
-- DATABASE SCHEMA - HỆ THỐNG QUẢN LÝ CỬA HÀNG BÁN HOA
-- Sinh viên: Thủy Tiên & Yến Bình
-- Database: cuahangbanhoa
-- MySQL Version: 8.0.41
-- =====================================================

-- 1. QUẢN LÝ NGƯỜI DÙNG
-- =====================================================

-- Bảng users: Lưu thông tin người dùng (khách hàng và admin)
CREATE TABLE `users` (
  `user_id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `full_name` VARCHAR(100),
  `phone` VARCHAR(20),
  `address` TEXT,
  `role` ENUM('user','admin') DEFAULT 'user',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. QUẢN LÝ SẢN PHẨM
-- =====================================================

-- Bảng categories: Danh mục sản phẩm (Hoa cưới, Hoa khai trương, Bó hoa tươi, Hoa sáp)
CREATE TABLE `categories` (
  `category_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) UNIQUE NOT NULL,
  `parent_id` INT,
  `description` TEXT,
  FOREIGN KEY (`parent_id`) REFERENCES `categories`(`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng products: Thông tin sản phẩm hoa
CREATE TABLE `products` (
  `product_id` INT PRIMARY KEY AUTO_INCREMENT,
  `category_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) UNIQUE NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `stock_quantity` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng product_images: Hình ảnh sản phẩm (hỗ trợ nhiều ảnh cho 1 sản phẩm)
CREATE TABLE `product_images` (
  `image_id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `alt_text` VARCHAR(255),
  `is_primary` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng reviews: Đánh giá sản phẩm
CREATE TABLE `reviews` (
  `review_id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` INT CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3. QUẢN LÝ GIỎ HÀNG & YÊU THÍCH
-- =====================================================

-- Bảng carts: Giỏ hàng (hỗ trợ cả user đã đăng nhập và session)
CREATE TABLE `carts` (
  `cart_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `session_id` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng cart_items: Chi tiết sản phẩm trong giỏ hàng
CREATE TABLE `cart_items` (
  `cart_item_id` INT PRIMARY KEY AUTO_INCREMENT,
  `cart_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`cart_id`) REFERENCES `carts`(`cart_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng wishlists: Danh sách yêu thích
CREATE TABLE `wishlists` (
  `wishlist_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4. QUẢN LÝ ĐỢN HÀNG
-- =====================================================

-- Bảng shipping_methods: Phương thức vận chuyển
CREATE TABLE `shipping_methods` (
  `shipping_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `cost` DECIMAL(10,2) DEFAULT 0.00,
  `estimated_days` INT,
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng payment_methods: Phương thức thanh toán
CREATE TABLE `payment_methods` (
  `payment_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng orders: Đơn hàng
CREATE TABLE `orders` (
  `order_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `order_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(50) DEFAULT 'pending',
  `total_amount` DECIMAL(12,2) NOT NULL,
  `shipping_address` TEXT,
  `shipping_id` INT,
  `payment_id` INT,
  `note` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`),
  FOREIGN KEY (`shipping_id`) REFERENCES `shipping_methods`(`shipping_id`),
  FOREIGN KEY (`payment_id`) REFERENCES `payment_methods`(`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng order_items: Chi tiết sản phẩm trong đơn hàng
CREATE TABLE `order_items` (
  `order_item_id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5. QUẢN LÝ BLOG & TIN TỨC
-- =====================================================

-- Bảng blog_categories: Danh mục blog
CREATE TABLE `blog_categories` (
  `blog_category_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) UNIQUE NOT NULL,
  `description` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng blog_posts: Bài viết blog
CREATE TABLE `blog_posts` (
  `post_id` INT PRIMARY KEY AUTO_INCREMENT,
  `category_id` INT,
  `author_id` INT,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) UNIQUE NOT NULL,
  `content` TEXT NOT NULL,
  `image_url` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng blog_comments: Bình luận blog
CREATE TABLE `blog_comments` (
  `comment_id` INT PRIMARY KEY AUTO_INCREMENT,
  `post_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`post_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 6. QUẢN LÝ LIÊN HỆ & ADMIN
-- =====================================================

-- Bảng contacts: Thông tin liên hệ từ khách hàng
CREATE TABLE `contacts` (
  `contact_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `message` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng admin_logs: Nhật ký hoạt động admin
CREATE TABLE `admin_logs` (
  `log_id` INT PRIMARY KEY AUTO_INCREMENT,
  `admin_id` INT NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `table_name` VARCHAR(100),
  `record_id` INT,
  `log_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`admin_id`) REFERENCES `users`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng product_history: Lịch sử thay đổi sản phẩm
CREATE TABLE `product_history` (
  `history_id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `changed_by` INT NOT NULL,
  `change_description` TEXT,
  `changed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`),
  FOREIGN KEY (`changed_by`) REFERENCES `users`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng sliders: Banner/Slider trang chủ
CREATE TABLE `sliders` (
  `slider_id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(150),
  `image_url` VARCHAR(255) NOT NULL,
  `link_url` VARCHAR(255),
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 7. HỆ THỐNG CHATBOT AI (Tính năng nổi bật)
-- =====================================================

-- Bảng chat_conversations: Lưu cuộc hội thoại
CREATE TABLE `chat_conversations` (
  `conversation_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `session_id` VARCHAR(255) NOT NULL,
  `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_message_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng chat_messages: Tin nhắn trong cuộc hội thoại
CREATE TABLE `chat_messages` (
  `message_id` INT PRIMARY KEY AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `sender_type` ENUM('user', 'bot') NOT NULL,
  `message` TEXT NOT NULL,
  `intent` VARCHAR(100),
  `confidence` DECIMAL(3,2),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations`(`conversation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng chat_recommendations: Gợi ý sản phẩm trong chat
CREATE TABLE `chat_recommendations` (
  `recommendation_id` INT PRIMARY KEY AUTO_INCREMENT,
  `message_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `reason` TEXT,
  `score` DECIMAL(5,2),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`message_id`) REFERENCES `chat_messages`(`message_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng flower_knowledge: Kiến thức về hoa (cho chatbot tư vấn)
CREATE TABLE `flower_knowledge` (
  `knowledge_id` INT PRIMARY KEY AUTO_INCREMENT,
  `flower_name` VARCHAR(255) NOT NULL,
  `occasion` VARCHAR(255),
  `meaning` TEXT,
  `color_significance` TEXT,
  `care_tips` TEXT,
  `season` VARCHAR(100),
  `price_range` VARCHAR(50),
  `keywords` TEXT,
  KEY `flower_name` (`flower_name`),
  KEY `occasion` (`occasion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 8. HỆ THỐNG GỢI Ý SẢN PHẨM (Recommendation System)
-- =====================================================

-- Bảng view_history: Lịch sử xem sản phẩm
CREATE TABLE `view_history` (
  `view_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `session_id` VARCHAR(255),
  `product_id` INT NOT NULL,
  `viewed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `user_id` (`user_id`),
  KEY `session_id` (`session_id`),
  KEY `product_id` (`product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng user_preferences: Sở thích người dùng (học từ hành vi)
CREATE TABLE `user_preferences` (
  `preference_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `preference_type` VARCHAR(50) NOT NULL,
  `preference_value` TEXT NOT NULL,
  `confidence` DECIMAL(3,2) DEFAULT 1.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 9. BẢNG PHỤ TRỢ
-- =====================================================

-- Bảng coupons: Mã giảm giá
CREATE TABLE `coupons` (
  `coupon_id` INT PRIMARY KEY AUTO_INCREMENT,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `discount_type` ENUM('percentage','fixed') NOT NULL,
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_order_value` DECIMAL(10,2) DEFAULT 0.00,
  `start_date` DATE,
  `end_date` DATE,
  `usage_limit` INT DEFAULT 0,
  `used_count` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng notifications: Thông báo cho người dùng
CREATE TABLE `notifications` (
  `notification_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- INDEXES ĐỂ TỐI ƯU HIỆU SUẤT
-- =====================================================

CREATE INDEX idx_user_viewed ON view_history(user_id, viewed_at DESC);
CREATE INDEX idx_session_viewed ON view_history(session_id, viewed_at DESC);
CREATE INDEX idx_product_viewed ON view_history(product_id, viewed_at DESC);
CREATE INDEX idx_order_status ON orders(status, created_at DESC);
CREATE INDEX idx_product_category ON products(category_id, is_active);


-- =====================================================
-- TỔNG KẾT DATABASE
-- =====================================================
-- Tổng số bảng: 29 bảng
-- 
-- Các module chính:
-- 1. Quản lý người dùng (users)
-- 2. Quản lý sản phẩm (products, categories, images, reviews)
-- 3. Giỏ hàng & Yêu thích (carts, cart_items, wishlists)
-- 4. Đơn hàng (orders, order_items, shipping, payment)
-- 5. Blog & Tin tức (blog_posts, blog_categories, blog_comments)
-- 6. Liên hệ & Admin (contacts, admin_logs, product_history, sliders)
-- 7. Chatbot AI (chat_conversations, chat_messages, chat_recommendations, flower_knowledge)
-- 8. Recommendation System (view_history, user_preferences)
-- 9. Bảng phụ trợ (coupons, notifications)
--
-- Tính năng nổi bật:
-- ✓ Chatbot AI tư vấn hoa với kiến thức chuyên sâu
-- ✓ Hệ thống gợi ý sản phẩm cá nhân hóa
-- ✓ Quản lý đơn hàng đầy đủ (shipping, payment, status tracking)
-- ✓ Admin dashboard với logs và product history
-- ✓ Review & Rating system
-- ✓ Blog/News system
-- =====================================================
