-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: democuahangbanhoa
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `log_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_categories`
--

DROP TABLE IF EXISTS `blog_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_categories` (
  `blog_category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`blog_category_id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_categories`
--

LOCK TABLES `blog_categories` WRITE;
/*!40000 ALTER TABLE `blog_categories` DISABLE KEYS */;
INSERT INTO `blog_categories` VALUES (1,'Chăm sóc hoa','cham-soc-hoa','Mẹo chăm sóc hoa'),(2,'Ý nghĩa các loài hoa','y-nghia-loai-hoa','Khám phá ý nghĩa đặc biệt của từng loài hoa'),(3,'Hoa theo dịp lễ','hoa-theo-dip','Gợi ý chọn hoa cho sinh nhật, lễ tình nhân, ngày cưới...');
/*!40000 ALTER TABLE `blog_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_comments`
--

DROP TABLE IF EXISTS `blog_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `post_id` (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `blog_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`post_id`) ON DELETE CASCADE,
  CONSTRAINT `blog_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_comments`
--

LOCK TABLES `blog_comments` WRITE;
/*!40000 ALTER TABLE `blog_comments` DISABLE KEYS */;
INSERT INTO `blog_comments` VALUES (3,1,5,'Sản phẩm đẹp, chủ shop nhiệt tình','2025-09-24 13:12:17');
/*!40000 ALTER TABLE `blog_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `author_id` int DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `blog_posts_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
INSERT INTO `blog_posts` VALUES (1,1,5,'Ý nghĩa hoa hồng trong ngày cưới','y-nghia-hoa-hong-trong-ngay-cuoi','<p>Hoa hồng đỏ tượng trưng cho tình yêu nồng nàn, hoa hồng trắng biểu trưng cho sự tinh khiết. Trong ngày cưới, sự kết hợp của chúng mang đến một thông điệp tình yêu trọn vẹn.</p>','https://bizweb.dktcdn.net/thumb/1024x1024/100/487/411/products/19d8af6a2b6f4a9c807a79d55ea42a-jpeg.jpg?v=1721653425460','2025-09-24 11:39:24','2025-09-24 11:39:24'),(2,2,5,'Gợi ý chọn hoa mừng khai trương','goi-y-chon-hoa-khai-truong','<p>Khai trương là dịp quan trọng, hoa lan, hoa hướng dương, và hoa đồng tiền thường được lựa chọn để mang lại may mắn, tài lộc cho gia chủ.</p>','https://bizweb.dktcdn.net/100/487/411/products/800-2.jpg?v=1721661653303','2025-09-24 11:40:47','2025-09-24 11:40:47'),(3,3,5,'Cách bảo quản bó hoa tươi lâu','cach-bao-quan-bo-hoa-tuoi','<p>Để bó hoa tươi lâu, bạn nên thay nước hàng ngày, cắt gốc hoa chéo và tránh đặt ở nơi có ánh nắng trực tiếp.</p>','https://bizweb.dktcdn.net/100/487/411/products/b697c6d7-87f5-49d2-8316-8027a015638e.jpg?v=1739415140057','2025-09-24 11:41:58','2025-09-24 11:41:58'),(7,4,5,'Hoa sáp – lựa chọn quà tặng bền lâu','hoa-sap-qua-tang','<p>Hoa sáp với mùi hương nhẹ nhàng, không phai màu theo thời gian, là món quà ý nghĩa cho các dịp sinh nhật, lễ tình nhân, và kỷ niệm.</p>','https://bizweb.dktcdn.net/thumb/1024x1024/100/505/662/products/hoa-sap-mau-xanh.jpg?v=1716449601627','2025-09-24 12:16:00','2025-09-24 13:33:12');
/*!40000 ALTER TABLE `blog_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `cart_item_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`cart_item_id`),
  KEY `cart_id` (`cart_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,1,12,1,2000000.00),(2,1,13,2,600000.00);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,4,'550e8400-e29b-41d4-a716-446655440000','2025-09-22 11:22:09','2025-09-22 11:32:34'),(3,5,NULL,'2025-09-22 11:36:14','2025-09-24 14:24:57'),(4,7,'07d3dab8-90ac-4462-a749-4ad38e4eed04','2025-09-24 14:38:08','2025-09-26 19:39:54');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Hoa Cưới','hoa-cuoi',NULL,'Hoa cưới'),(2,'Hoa khai trương','hoa-khai-truong',NULL,'Lẵng hoa, giỏ hoa chúc mừng khai trương'),(3,'Bó hoa tươi','bo-hoa-tuoi',NULL,'Các loại hoa tươi '),(4,'Hoa Sáp','hoa-sap',NULL,'Các loại hoa sáp, mang ý nghĩa bền lâu');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `contact_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`contact_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,'Trần Thủy Tiên','tien@gmail.com','0327458490','Tôi muốn tư vấn thêm...','2025-09-24 13:50:33'),(2,'Xian Chan','chan@gmail.com',NULL,'HGDJGDBVCN','2025-09-24 14:21:50'),(3,'Xian Chan','chan@gmail.com','0327458490','hihihi','2025-09-24 19:56:52');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `coupon_id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` enum('percentage','fixed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_value` decimal(10,2) DEFAULT '0.00',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `usage_limit` int DEFAULT '0',
  `used_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`coupon_id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,12,1,2000000.00,2000000.00),(2,1,13,2,600000.00,1200000.00),(3,2,12,2,2000000.00,4000000.00),(4,2,13,1,600000.00,600000.00),(5,3,12,1,2000000.00,2000000.00),(6,3,13,1,600000.00,600000.00),(7,4,12,3,2000000.00,6000000.00),(8,5,30,3,400000.00,1200000.00),(9,5,31,1,600000.00,600000.00),(10,5,13,5,600000.00,3000000.00),(11,5,12,5,2000000.00,10000000.00),(12,5,20,4,650000.00,2600000.00),(13,6,25,1,1000000.00,1000000.00),(14,7,32,1,700000.00,700000.00),(15,8,15,1,1500000.00,1500000.00),(16,9,33,1,900000.00,900000.00),(17,10,34,1,350000.00,350000.00),(18,11,26,1,550000.00,550000.00),(19,12,30,1,400000.00,400000.00),(20,13,33,1,900000.00,900000.00),(21,13,35,1,1000000.00,1000000.00),(22,14,31,2,600000.00,1200000.00),(23,14,30,3,400000.00,1200000.00),(24,15,27,1,550000.00,550000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `total_amount` decimal(12,2) NOT NULL,
  `shipping_address` text COLLATE utf8mb4_unicode_ci,
  `shipping_id` int DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  KEY `shipping_id` (`shipping_id`),
  KEY `payment_id` (`payment_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`shipping_id`) REFERENCES `shipping_methods` (`shipping_id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`payment_id`) REFERENCES `payment_methods` (`payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,4,'2025-09-22 11:22:09','pending',3230000.00,'123 ABC, Phường X, Quận Y, TP.HCM, Việt Nam',1,1,'Test order pending','2025-09-22 11:22:09','2025-09-22 11:22:09'),(2,4,'2025-09-22 11:22:09','pending',4660000.00,'456 DEF, Phường A, Quận B, TP.HCM, Việt Nam',2,2,'Test order processing','2025-09-22 11:22:09','2025-09-27 20:06:40'),(3,4,'2025-09-22 11:22:09','shipped',2700000.00,'789 GHI, Phường M, Quận N, TP.HCM, Việt Nam',3,3,'Test order shipped','2025-09-22 11:22:09','2025-09-22 11:22:09'),(4,4,'2025-09-22 11:22:09','cancelled',6030000.00,'999 JKL, Phường Z, Quận T, TP.HCM, Việt Nam',1,4,'Test order cancelled','2025-09-22 11:22:09','2025-09-22 11:22:09'),(5,5,'2025-09-22 13:02:32','shipped',17430000.00,'123 Đường Hoa, Q1, TP.HCM',1,1,'Giao giờ hành chính\nLý do hủy: Đổi ý','2025-09-22 13:02:32','2025-09-22 13:27:58'),(6,5,'2025-09-22 14:21:16','pending',1060000.00,'số 8 châu thị hóa, phường 4, quận 8, thành phố hồ chí minh',2,4,'giao giờ hành chính','2025-09-22 14:21:16','2025-09-22 14:21:16'),(7,5,'2025-09-22 14:25:50','pending',730000.00,'số 8 châu thị hóa, phường 4, quận 8, thành phố hồ chí minh',1,1,'','2025-09-22 14:25:50','2025-09-22 14:25:50'),(8,5,'2025-09-22 14:36:19','pending',1600000.00,'180 cao lỗ, phường 4, quận 8, tp hcm',3,1,'','2025-09-22 14:36:19','2025-09-22 14:36:19'),(9,5,'2025-09-22 14:38:23','pending',1000000.00,'180 cao lỗ, phường 4, quận 8, tp hcm',3,4,'\nLý do hủy: aa','2025-09-22 14:38:23','2025-09-27 20:10:21'),(10,5,'2025-09-22 14:46:32','pending',380000.00,'180 cao lỗ, phường 4, quận 8, tp hcm',1,4,'\nLý do hủy: không muốn mua','2025-09-22 14:46:32','2025-09-27 20:10:28'),(11,5,'2025-09-22 14:53:57','pending',580000.00,'180 cao lỗ, p4, q8, tp hcm',1,4,'','2025-09-22 14:53:57','2025-09-22 14:53:57'),(12,5,'2025-09-22 14:56:34','shipped',430000.00,'123 ttt,p4,q6,tp hcm',1,3,'\nLý do hủy: a','2025-09-22 14:56:34','2025-09-27 20:10:16'),(13,5,'2025-09-24 14:24:57','shipped',1930000.00,'GFSGFS',1,3,'','2025-09-24 14:24:57','2025-09-27 20:10:10'),(14,7,'2025-09-26 19:38:50','delivered',2430000.00,'fgdf',1,1,'','2025-09-26 19:38:50','2025-09-27 21:10:08'),(15,7,'2025-09-26 19:39:54','delivered',610000.00,'fdhg',2,3,'','2025-09-26 19:39:54','2025-09-27 21:05:35');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,'Bank transfer','Thanh toán qua ngân hàng',1),(2,'Chuyển khoản ngân hàng','Thanh toán qua chuyển khoản',1),(3,'VNPay','Thanh toán qua cổng VNPay (sandbox)',1),(4,'MoMo','Thanh toán ví MoMo (sandbox)',1);
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_history`
--

DROP TABLE IF EXISTS `product_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `changed_by` int NOT NULL,
  `change_description` text COLLATE utf8mb4_unicode_ci,
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `product_id` (`product_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `product_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `product_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_history`
--

LOCK TABLES `product_history` WRITE;
/*!40000 ALTER TABLE `product_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`image_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,12,'https://bizweb.dktcdn.net/100/487/411/products/433091b3480b44fe9a14366dd4c80f.jpg?v=1721653423147',NULL,1),(2,13,'https://bizweb.dktcdn.net/100/487/411/products/43c6ef7068f2467e9cc74c2dcb2eb8.jpg?v=1721653423870',NULL,1),(3,14,'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/411/products/7151abfff0694cc58cf0b92ecda124.jpg?v=1721653424450',NULL,1),(4,15,'https://bizweb.dktcdn.net/100/487/411/products/930b0ba7ba0e4314bad0ad58c624c0.jpg?v=1721653424543',NULL,1),(5,16,'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/411/products/19d8af6a2b6f4a9c807a79d55ea42a-jpeg.jpg?v=1721653425460',NULL,1),(6,17,'https://bizweb.dktcdn.net/100/487/411/products/9772fe5bff3e4eb9bc4d386eb4d140-jpeg.jpg?v=1721653425600',NULL,1),(7,18,'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/411/products/0a7ac645921d40c5a6a674e61dd2ef-jpeg.jpg?v=1721653425973',NULL,1),(8,19,'https://bizweb.dktcdn.net/100/487/411/products/dsc05924.jpg?v=1747883844217',NULL,1),(9,20,'https://bizweb.dktcdn.net/100/487/411/products/z5674686162213-eb1ab140741362a141e2c291f9c7fbe0-1722653232530.jpg?v=1731985252370',NULL,1),(10,21,'https://bizweb.dktcdn.net/100/487/411/products/800-2.jpg?v=1721661653303',NULL,1),(11,22,'https://bizweb.dktcdn.net/100/487/411/products/5f956891d7cc47ad8b55520889bf75.jpg?v=1721653422540',NULL,1),(12,23,'https://bizweb.dktcdn.net/100/487/411/products/9065450b5c8742618c921e40b35d72.jpg?v=1721653423330',NULL,1),(13,24,'https://bizweb.dktcdn.net/100/487/411/products/kt2a5763.jpg?v=1748932679547',NULL,1),(14,25,'https://bizweb.dktcdn.net/100/487/411/products/9e8173c0-9fc6-462b-8588-c7a18743bb53.jpg?v=1731985239253',NULL,1),(15,26,'https://bizweb.dktcdn.net/100/487/411/products/kt2a5767.jpg?v=1748932947117',NULL,1),(16,27,'https://bizweb.dktcdn.net/100/487/411/products/dsc05510.jpg?v=1747888920303',NULL,1),(17,28,'https://bizweb.dktcdn.net/100/487/411/products/dsc05539.jpg?v=1747884412107',NULL,1),(18,29,'https://bizweb.dktcdn.net/100/487/411/products/b697c6d7-87f5-49d2-8316-8027a015638e.jpg?v=1739415140057',NULL,1),(19,30,'https://bizweb.dktcdn.net/thumb/1024x1024/100/505/662/products/hoa-sap-mau-xanh.jpg?v=1716449601627',NULL,1),(20,31,'https://bizweb.dktcdn.net/100/487/411/products/fa3ae08f-bb4a-4166-a060-bde5b4530f77.jpg?v=1757131362300',NULL,1),(21,32,'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/411/products/ff575cda-55bd-4183-96dc-b896b7b763d8.jpg?v=1748760212653',NULL,1),(22,33,'https://hoasapthuthao.com/wp-content/uploads/2019/01/bo-hoa-hong-sap-50-bong-S5014.jpg',NULL,1),(23,34,'https://mssixthflower.com/storage/z6442646431286-52429e4941b6191d0c1d522cc91245bf-540x600.jpg',NULL,1),(24,35,'https://thoitrangcuoi.com/wp-content/uploads/2025/05/hoa-sap-cuoi-cam-tay-9-1.jpg',NULL,1),(25,36,'anh.img','',1);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (12,1,'Hoa cưới cally mix tulip','hoa-cuoi-cally-mix-tulip','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',2000000.00,20,1,'2025-09-18 20:19:54','2025-09-22 13:24:09'),(13,1,'Hoa cưới hướng dương mix tana','hoa-cuoi-huong-duong','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',600000.00,10,1,'2025-09-18 20:32:06','2025-09-22 13:24:09'),(14,1,'Hoa cưới hồng mix baby','hoa-cuoi-hong-mix-baby','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',1000000.00,15,1,'2025-09-18 20:34:13','2025-09-18 20:34:13'),(15,1,'Hoa cưới tulip mix cally hồng','hoa-cuoi-tulip-hong','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',1500000.00,24,1,'2025-09-18 20:36:43','2025-09-22 14:36:19'),(16,1,'Hoa hồng cưới','hoa-hong-cuoi','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',800000.00,30,1,'2025-09-18 20:38:50','2025-09-18 20:38:50'),(17,1,'Hoa cưới khô','hoa-cuoi-kho','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',1500000.00,5,1,'2025-09-18 20:40:53','2025-09-18 20:40:53'),(18,2,'Hoa khai trương vàng','hoa-khai-truong-vang','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',3500000.00,8,1,'2025-09-18 20:45:36','2025-09-18 20:45:36'),(19,2,'Giỏ hoa tone hồng pastel – trắng','gio-hoa-tone-hong','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',1300000.00,10,1,'2025-09-18 20:48:44','2025-09-18 20:48:44'),(20,2,'Hộp hoa hồng xanh mix phăng','hop-hoa-hong-xanh','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',650000.00,25,1,'2025-09-18 20:51:17','2025-09-22 13:24:09'),(21,2,'Kệ hoa khai trương mini','ke-hoa-mini','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',900000.00,20,1,'2025-09-18 20:56:28','2025-09-18 20:56:28'),(22,2,'Giỏ hoa xa lánh','gio-hoa-xa-lanh','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',550000.00,50,1,'2025-09-18 20:59:34','2025-09-18 20:59:34'),(23,2,'Giỏ hoa khai trương hồng mix trắng','gio-hoa-hong-mix-trang','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',1500000.00,10,1,'2025-09-18 21:03:08','2025-09-18 21:06:33'),(24,3,'Bó Hoa Hồng Đỏ – Sang Trọng & Nồng Nàn','bo-hoa-hong-do','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',600000.00,20,1,'2025-09-18 21:06:33','2025-09-18 21:06:33'),(25,3,'Bó hoa hồng kem mix đồng tiền','bo-hoa-hong-mix-dong-tien','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',1000000.00,14,1,'2025-09-18 21:08:20','2025-09-22 14:21:16'),(26,3,'Bó Hoa Hồng Pastel & PingpongThỏ Bông','bo-hoa-tho-pingpong','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',550000.00,29,1,'2025-09-18 21:18:22','2025-09-22 14:53:57'),(27,3,'Bó Hoa Cẩm chướng xanh trắng & hồng môn','bo-hoa-cam-chuong','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',550000.00,29,1,'2025-09-18 21:18:22','2025-09-26 19:39:54'),(28,3,'Bó Hoa Hồng Xịt Sơn Xanh','bo-hoa-hong-son-xanh','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',370000.00,50,1,'2025-09-18 21:18:22','2025-09-18 21:18:22'),(29,3,'Bó hoa Hướng Dương','bo-hoa-huong-duong','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',530000.00,40,1,'2025-09-18 21:18:22','2025-09-18 21:18:22'),(30,4,'Bó Hoa Sáp Xanh Pastel ','bo-hoa-sap-xanh-pastel','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',400000.00,25,1,'2025-09-18 21:34:48','2025-09-26 21:18:39'),(31,4,'Trụ Hoa Hồng sáp','tru-hoa-hong-sap','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',600000.00,30,1,'2025-09-18 21:34:48','2025-09-26 19:38:50'),(32,4,'Hoa Hồng sáp công chúa','hoa-hong-sap-cong-chua','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',700000.00,21,1,'2025-09-18 21:34:48','2025-09-22 14:25:50'),(33,4,'Bó hoa hồng sáp thơm tím','hoa-hong-sap-thom-tim','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',900000.00,10,1,'2025-09-18 21:34:48','2025-09-24 14:24:57'),(34,4,'Hoa sáp mix','hoa-sap-mix','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',350000.00,15,1,'2025-09-18 21:34:48','2025-09-22 14:47:14'),(35,4,'Hoa sáp cưới cầm tay','hoa-sap-cuoi-cam-tay','Thông tin sản phẩm Giá cả có thể thay đổi: Giá hoa tươi có thể biến động tùy theo thị trường. Chúng tôi cam kết sẽ cập nhật giá một cách minh bạch và hợp lý nhất.Màu sắc hoa có thể khác biệt: Do điều kiện ánh sáng và góc chụp, màu sắc hoa trên hình ảnh có thể khác với thực tế. Chúng tôi luôn cố gắng cung cấp hình ảnh chân thực nhất cho sản phẩm.Hoa theo mùa: Một số loại hoa có thể thay đổi theo mùa. Tuy nhiên, chúng tôi sẽ nỗ lực giữ loại hoa chủ đạo và đảm bảo số lượng cũng như giá trị tương đương hoặc cao hơn.Sản phẩm có thể khác ảnh mẫu: Mẫu hoa thực tế có thể khác so với hình ảnh mẫu, nhưng chúng tôi đảm bảo sẽ giống ít nhất 80% trở lên. Chúng tôi chân thành cảm ơn sự tin tưởng và ủng hộ của quý khách. Hy vọng quý khách sẽ hài lòng với những sản phẩm hoa tươi của chúng tôi.Cảm ơn bạn đã tin tưởng ủng hộ!!!',1000000.00,24,1,'2025-09-18 21:34:48','2025-09-24 14:24:57'),(36,4,'hoa len','hoa-len','gdfgdrgthfd',12345678.00,11,0,'2025-09-26 19:25:25','2025-09-26 19:27:22');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,12,5,5,'Hoa rất đẹp! aaa','2025-09-24 13:16:06'),(3,14,5,5,'hoa xinh, tư vấn nhiệt tình','2025-09-24 13:31:41'),(4,33,5,5,'HOA ĐẸP, SHOP NHIỆT TÌNH','2025-09-24 14:24:06'),(5,32,5,5,'aaa','2025-09-24 19:09:02');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_methods`
--

DROP TABLE IF EXISTS `shipping_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_methods` (
  `shipping_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cost` decimal(10,2) DEFAULT '0.00',
  `estimated_days` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`shipping_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_methods`
--

LOCK TABLES `shipping_methods` WRITE;
/*!40000 ALTER TABLE `shipping_methods` DISABLE KEYS */;
INSERT INTO `shipping_methods` VALUES (1,'Giao hàng tiêu chuẩn','Dự kiến 2-4 ngày làm việc',30000.00,3,1),(2,'Giao hàng nhanh','Dự kiến 1-2 ngày làm việc',60000.00,2,1),(3,'Giao hàng trong ngày','Áp dụng nội thành, đặt trước 11h',100000.00,1,1);
/*!40000 ALTER TABLE `shipping_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sliders`
--

DROP TABLE IF EXISTS `sliders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sliders` (
  `slider_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`slider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sliders`
--

LOCK TABLES `sliders` WRITE;
/*!40000 ALTER TABLE `sliders` DISABLE KEYS */;
/*!40000 ALTER TABLE `sliders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'binh','$2b$10$A70Xsjy.qPAcxewe9B2PROT7Oo29Ex0n7G3AmC6/I1e/OKJzfEK2C','binh@example.com','Yến Bình','0900000001','HCM','user','2025-09-18 14:38:54','2025-09-18 14:38:54'),(5,'tien','$2b$10$2rCKCvxR1Z22uNDNSKBK7O4WqXLgfDAxcZAa20GM68Yx6eMJ.olPq','tien@gmail.com','Thủy Tiên','0987654321','HCM','admin','2025-09-18 14:52:04','2025-09-18 14:53:21'),(6,'binhxinh','$2b$10$66p49BAx6NkxKGA1Hnf8y.7oWtiSG5pcTB2sZb595EsMdxYc9oM6K','binhxinh@gmail.com','Bình Xinh','0123456789','HCM','user','2025-09-18 16:50:10','2025-09-18 16:50:10'),(7,'Yến Bình','$2b$10$HZx847wAvkJP9NElg0e59uLJP34ktcSiWltgJTqVJI/li54czX/Wi','binh11@gmail.com','Yến Bình','0123456789','abc','user','2025-09-24 14:37:54','2025-09-24 14:37:54'),(8,'vuong linh','$2b$10$t.GUu68eKBNnpXzI.rGHKO3m3EmH.zHjR1mRryJXsNI4idyQl9aLK','linh@gmail.com','nguyen vuong linh','0976543218','123abc','user','2025-09-26 18:54:22','2025-09-26 18:54:22'),(9,'ling','$2b$10$Y4zZQXYemlUXvSVgoKvABeO/9.gh5vFC0n4Hc4JCDMsYECiqyTe8u','ling@gmail.com','wang ling','0986541274','abc','user','2025-09-26 21:11:34','2025-09-26 21:11:34');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `wishlist_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`wishlist_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-29 18:53:52

-- db: chatbot
-- Chatbot tables for intelligent flower consultation and recommendations

-- Table for storing chat conversations
CREATE TABLE IF NOT EXISTS `chat_conversations` (
  `conversation_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `session_id` VARCHAR(255) NOT NULL,
  `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_message_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`conversation_id`),
  KEY `user_id` (`user_id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `chat_conversations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing chat messages
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `message_id` INT NOT NULL AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `sender_type` ENUM('user', 'bot') NOT NULL,
  `message` TEXT NOT NULL,
  `intent` VARCHAR(100) DEFAULT NULL,
  `confidence` DECIMAL(3,2) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `conversation_id` (`conversation_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`conversation_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing recommended products in chat
CREATE TABLE IF NOT EXISTS `chat_recommendations` (
  `recommendation_id` INT NOT NULL AUTO_INCREMENT,
  `message_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `reason` TEXT DEFAULT NULL,
  `score` DECIMAL(5,2) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`recommendation_id`),
  KEY `message_id` (`message_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `chat_recommendations_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`message_id`) ON DELETE CASCADE,
  CONSTRAINT `chat_recommendations_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for storing user preferences learned from chat
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `preference_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `preference_type` VARCHAR(50) NOT NULL,
  `preference_value` TEXT NOT NULL,
  `confidence` DECIMAL(3,2) DEFAULT 1.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`preference_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for flower knowledge base (for intelligent consultation)
CREATE TABLE IF NOT EXISTS `flower_knowledge` (
  `knowledge_id` INT NOT NULL AUTO_INCREMENT,
  `flower_name` VARCHAR(255) NOT NULL,
  `occasion` VARCHAR(255) DEFAULT NULL,
  `meaning` TEXT DEFAULT NULL,
  `color_significance` TEXT DEFAULT NULL,
  `care_tips` TEXT DEFAULT NULL,
  `season` VARCHAR(100) DEFAULT NULL,
  `price_range` VARCHAR(50) DEFAULT NULL,
  `keywords` TEXT DEFAULT NULL,
  PRIMARY KEY (`knowledge_id`),
  KEY `flower_name` (`flower_name`),
  KEY `occasion` (`occasion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample flower knowledge data
INSERT INTO `flower_knowledge` (`flower_name`, `occasion`, `meaning`, `color_significance`, `care_tips`, `season`, `price_range`, `keywords`) VALUES
('Hoa hồng', 'Tình yêu, Sinh nhật, Kỷ niệm', 'Tình yêu, sự lãng mạn và đam mê', 'Đỏ: tình yêu mãnh liệt, Trắng: thuần khiết, Vàng: tình bạn, Hồng: ngưỡng mộ', 'Cắt tỉa thường xuyên, tưới nước đều đặn, tránh ánh nắng trực tiếp', 'Quanh năm', 'Trung bình - Cao', 'tình yêu,lãng mạn,valentine,sinh nhật,kỷ niệm,cầu hôn'),
('Hoa ly', 'Đám cưới, Khai trương, Chia buồn', 'Sự thuần khiết, thanh lịch và cao quý', 'Trắng: thuần khiết, Vàng: vui vẻ, Hồng: thịnh vượng', 'Tưới nước vừa phải, đặt nơi thoáng mát, cắt bỏ phấn hoa', 'Quanh năm', 'Trung bình - Cao', 'đám cưới,khai trương,thanh lịch,sang trọng,chia buồn'),
('Hoa cúc', 'Sinh nhật, Thăm bệnh, Tri ân', 'Sự vui vẻ, lạc quan và trường thọ', 'Vàng: hạnh phúc, Trắng: chân thành, Đỏ: tình yêu', 'Dễ chăm sóc, tưới nước đều đặn, cắt tỉa hoa héo', 'Mùa thu - Đông', 'Thấp - Trung bình', 'sinh nhật,thăm bệnh,tri ân,vui vẻ,lạc quan'),
('Hoa tulip', 'Mùa xuân, Sinh nhật, Tình yêu', 'Tình yêu hoàn hảo và sự quyến rũ', 'Đỏ: tình yêu chân thành, Vàng: niềm vui, Tím: hoàng gia', 'Cần nhiều nước, đặt nơi mát mẻ, thay nước thường xuyên', 'Mùa xuân', 'Trung bình', 'xuân,tình yêu,sinh nhật,quyến rũ,hoàn hảo'),
('Hoa hướng dương', 'Khai trương, Chúc mừng, Động viên', 'Niềm vui, sự lạc quan và năng lượng tích cực', 'Vàng: hạnh phúc, năng lượng', 'Cần nhiều ánh sáng, tưới nước đều đặn', 'Mùa hè', 'Thấp - Trung bình', 'khai trương,vui vẻ,năng lượng,lạc quan,động viên'),
('Hoa lan', 'Tặng sếp, Khai trương, Sang trọng', 'Sự sang trọng, quý phái và tinh tế', 'Tím: quý phái, Trắng: thanh lịch, Hồng: nữ tính', 'Tưới nước ít, đặt nơi thoáng mát, tránh ánh nắng trực tiếp', 'Quanh năm', 'Cao', 'sang trọng,quý phái,khai trương,tặng sếp,cao cấp'),
('Hoa cẩm chướng', 'Ngày của mẹ, Tri ân, Thầy cô', 'Tình yêu thương và sự biết ơn', 'Hồng: tình mẫu tử, Đỏ: ngưỡng mộ, Trắng: may mắn', 'Dễ chăm sóc, tưới nước vừa phải', 'Quanh năm', 'Thấp - Trung bình', 'ngày của mẹ,tri ân,thầy cô,biết ơn,tình yêu thương'),
('Hoa baby', 'Phụ kiện, Đám cưới, Kết hợp', 'Sự trong sáng và tình yêu vĩnh cửu', 'Trắng: thuần khiết', 'Dễ chăm sóc, ít nước', 'Quanh năm', 'Thấp', 'đám cưới,phụ kiện,kết hợp,trong sáng'),
('Hoa đồng tiền', 'Khai trương, Chúc mừng, Tài lộc', 'Sự giàu có, may mắn và thịnh vượng', 'Vàng: tài lộc, Xanh: may mắn', 'Tưới nước vừa phải, đặt nơi thoáng mát', 'Quanh năm', 'Trung bình', 'khai trương,tài lộc,may mắn,thịnh vượng'),
('Hoa đồng tiền', 'Khai trương, Chúc mừng, Tài lộc', 'Sự giàu có, may mắn và thịnh vượng', 'Vàng: tài lộc, Xanh: may mắn', 'Tưới nước vừa phải, đặt nơi thoáng mát', 'Quanh năm', 'Trung bình', 'khai trương,tài lộc,may mắn,thịnh vượng'),
('Hoa salem', 'Đám cưới, Khai trương, Trang trí', 'Sự may mắn và hạnh phúc', 'Tím: quý phái, Trắng: thanh lịch', 'Dễ chăm sóc, ít nước', 'Quanh năm', 'Thấp - Trung bình', 'đám cưới,khai trương,trang trí,may mắn');


-- db: gợi ý sản phẩm dựa trên lịch sử mua hàng
-- Recommendation system tables

-- Table for tracking product views
CREATE TABLE IF NOT EXISTS `view_history` (
  `view_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `session_id` VARCHAR(255) DEFAULT NULL,
  `product_id` INT NOT NULL,
  `viewed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`view_id`),
  KEY `user_id` (`user_id`),
  KEY `session_id` (`session_id`),
  KEY `product_id` (`product_id`),
  KEY `viewed_at` (`viewed_at`),
  CONSTRAINT `view_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `view_history_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX idx_user_viewed ON view_history(user_id, viewed_at DESC);
CREATE INDEX idx_session_viewed ON view_history(session_id, viewed_at DESC);
CREATE INDEX idx_product_viewed ON view_history(product_id, viewed_at DESC);
