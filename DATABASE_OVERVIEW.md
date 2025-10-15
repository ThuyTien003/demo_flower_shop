# 📊 TỔNG QUAN HỆ THỐNG DATABASE - CỬA HÀNG BÁN HOA

**Sinh viên thực hiện:** Trần Thủy Tiên & Yến Bình  
**Database:** `cuahangbanhoa`  
**MySQL Version:** 8.0.41  
**Charset:** utf8mb4_unicode_ci

---

## 🎯 MỤC TIÊU DỰ ÁN

Xây dựng hệ thống quản lý cửa hàng bán hoa trực tuyến với các tính năng:
- Quản lý sản phẩm hoa theo danh mục
- Giỏ hàng & thanh toán trực tuyến
- **Chatbot AI tư vấn hoa thông minh**
- **Hệ thống gợi ý sản phẩm cá nhân hóa**
- Quản lý đơn hàng & vận chuyển
- Blog/Tin tức về hoa
- Admin dashboard đầy đủ

---

## 📋 CẤU TRÚC DATABASE

### Tổng quan: **29 bảng** được chia thành **9 module chính**

```
cuahangbanhoa/
├── 1. QUẢN LÝ NGƯỜI DÙNG (1 bảng)
│   └── users
│
├── 2. QUẢN LÝ SẢN PHẨM (4 bảng)
│   ├── categories
│   ├── products
│   ├── product_images
│   └── reviews
│
├── 3. GIỎ HÀNG & YÊU THÍCH (3 bảng)
│   ├── carts
│   ├── cart_items
│   └── wishlists
│
├── 4. QUẢN LÝ ĐƠN HÀNG (4 bảng)
│   ├── orders
│   ├── order_items
│   ├── shipping_methods
│   └── payment_methods
│
├── 5. BLOG & TIN TỨC (3 bảng)
│   ├── blog_categories
│   ├── blog_posts
│   └── blog_comments
│
├── 6. LIÊN HỆ & ADMIN (4 bảng)
│   ├── contacts
│   ├── admin_logs
│   ├── product_history
│   └── sliders
│
├── 7. CHATBOT AI ⭐ (4 bảng)
│   ├── chat_conversations
│   ├── chat_messages
│   ├── chat_recommendations
│   └── flower_knowledge
│
├── 8. RECOMMENDATION SYSTEM ⭐ (2 bảng)
│   ├── view_history
│   └── user_preferences
│
└── 9. BẢNG PHỤ TRỢ (2 bảng)
    ├── coupons
    └── notifications
```

---

## 🔑 CÁC BẢNG CHÍNH & CHỨC NĂNG

### 1️⃣ **Module Người Dùng**

#### `users` - Quản lý tài khoản
- Lưu thông tin: username, email, password_hash
- Phân quyền: `role` (user/admin)
- Thông tin cá nhân: full_name, phone, address

---

### 2️⃣ **Module Sản Phẩm**

#### `categories` - Danh mục sản phẩm
- Hỗ trợ danh mục cha-con (parent_id)
- Slug-friendly URLs

#### `products` - Sản phẩm hoa
- Thông tin: name, description, price, stock_quantity
- Trạng thái: is_active (hiển thị/ẩn)
- Liên kết với category

#### `product_images` - Hình ảnh sản phẩm
- Hỗ trợ nhiều ảnh cho 1 sản phẩm
- Đánh dấu ảnh chính: is_primary

#### `reviews` - Đánh giá sản phẩm
- Rating: 1-5 sao
- Comment từ khách hàng

---

### 3️⃣ **Module Giỏ Hàng**

#### `carts` - Giỏ hàng
- Hỗ trợ cả user đã đăng nhập (user_id) và khách (session_id)

#### `cart_items` - Chi tiết giỏ hàng
- Lưu: product_id, quantity, unit_price

#### `wishlists` - Danh sách yêu thích
- Lưu sản phẩm yêu thích của user

---

### 4️⃣ **Module Đơn Hàng**

#### `orders` - Đơn hàng
- Trạng thái: pending, processing, shipped, delivered, cancelled
- Tổng tiền: total_amount
- Địa chỉ giao hàng: shipping_address
- Ghi chú: note

#### `order_items` - Chi tiết đơn hàng
- Sản phẩm trong đơn: product_id, quantity, unit_price, subtotal

#### `shipping_methods` - Phương thức vận chuyển
- Ví dụ: Giao hàng tiêu chuẩn, Giao hàng nhanh, Giao trong ngày
- Chi phí: cost, estimated_days

#### `payment_methods` - Phương thức thanh toán
- Ví dụ: COD, Chuyển khoản, VNPay, MoMo

---

### 5️⃣ **Module Blog**

#### `blog_categories` - Danh mục blog
- Ví dụ: Chăm sóc hoa, Ý nghĩa hoa, Hoa theo dịp

#### `blog_posts` - Bài viết
- Nội dung: title, content, image_url
- Tác giả: author_id (liên kết với users)

#### `blog_comments` - Bình luận
- User comment trên bài viết

---

### 6️⃣ **Module Admin**

#### `contacts` - Liên hệ từ khách hàng
- Form liên hệ: name, email, phone, message

#### `admin_logs` - Nhật ký hoạt động admin
- Theo dõi: action, table_name, record_id
- Ai làm gì, khi nào

#### `product_history` - Lịch sử thay đổi sản phẩm
- Tracking mọi thay đổi của sản phẩm
- Người thay đổi: changed_by

#### `sliders` - Banner/Slider trang chủ
- Quản lý banner quảng cáo

---

### 7️⃣ **Module Chatbot AI** ⭐ (Tính năng nổi bật)

#### `chat_conversations` - Cuộc hội thoại
- Lưu session chat của user
- Hỗ trợ cả user và guest (session_id)

#### `chat_messages` - Tin nhắn
- Phân loại: sender_type (user/bot)
- Intent detection: intent, confidence
- Lưu toàn bộ lịch sử chat

#### `chat_recommendations` - Gợi ý trong chat
- Bot gợi ý sản phẩm phù hợp
- Lý do gợi ý: reason, score

#### `flower_knowledge` - Kiến thức về hoa
- Database kiến thức cho chatbot:
  - Ý nghĩa hoa (meaning)
  - Dịp phù hợp (occasion)
  - Ý nghĩa màu sắc (color_significance)
  - Cách chăm sóc (care_tips)
  - Mùa (season)
  - Keywords để search

**Ví dụ dữ liệu:**
```
Hoa hồng:
- Occasion: Tình yêu, Sinh nhật, Kỷ niệm
- Meaning: Tình yêu, sự lãng mạn và đam mê
- Color: Đỏ (tình yêu mãnh liệt), Trắng (thuần khiết), Vàng (tình bạn)
- Keywords: tình yêu, lãng mạn, valentine, sinh nhật, cầu hôn
```

---

### 8️⃣ **Module Recommendation System** ⭐ (Tính năng nổi bật)

#### `view_history` - Lịch sử xem sản phẩm
- Tracking: user_id/session_id, product_id, viewed_at
- Phân tích hành vi người dùng

#### `user_preferences` - Sở thích người dùng
- Học từ hành vi: preference_type, preference_value
- Độ tin cậy: confidence (0.00-1.00)
- Ví dụ: Thích hoa màu hồng, Thích giá 500k-1tr, Thích hoa cưới

**Cách hoạt động:**
1. User xem sản phẩm → Lưu vào `view_history`
2. Hệ thống phân tích → Tạo `user_preferences`
3. Gợi ý sản phẩm dựa trên preferences + view history

---

### 9️⃣ **Module Phụ Trợ**

#### `coupons` - Mã giảm giá
- Loại: percentage (%), fixed (số tiền cố định)
- Điều kiện: min_order_value
- Giới hạn: usage_limit, used_count

#### `notifications` - Thông báo
- Gửi thông báo cho user
- Trạng thái: is_read

---

## 🔗 QUAN HỆ GIỮA CÁC BẢNG

### Mối quan hệ chính:

```
users (1) ----< (n) orders
users (1) ----< (n) reviews
users (1) ----< (n) wishlists
users (1) ----< (n) carts
users (1) ----< (n) chat_conversations

categories (1) ----< (n) products
products (1) ----< (n) product_images
products (1) ----< (n) reviews
products (1) ----< (n) cart_items
products (1) ----< (n) order_items

orders (1) ----< (n) order_items
carts (1) ----< (n) cart_items

chat_conversations (1) ----< (n) chat_messages
chat_messages (1) ----< (n) chat_recommendations
```

---

## 📊 THỐNG KÊ DATABASE

| Thông tin | Số lượng |
|-----------|----------|
| **Tổng số bảng** | 29 bảng |
| **Bảng chính** | 20 bảng |
| **Bảng phụ trợ** | 9 bảng |
| **Foreign Keys** | 35+ quan hệ |
| **Indexes** | 15+ indexes |

---

## ⚡ TỐI ƯU HÓA

### Indexes được tạo:
```sql
-- Tối ưu tìm kiếm lịch sử xem
CREATE INDEX idx_user_viewed ON view_history(user_id, viewed_at DESC);
CREATE INDEX idx_session_viewed ON view_history(session_id, viewed_at DESC);

-- Tối ưu lọc đơn hàng
CREATE INDEX idx_order_status ON orders(status, created_at DESC);

-- Tối ưu lọc sản phẩm
CREATE INDEX idx_product_category ON products(category_id, is_active);
```

### Cascade Delete:
- Xóa user → Tự động xóa: carts, wishlists, reviews, chat_conversations
- Xóa product → Tự động xóa: product_images
- Xóa order → Tự động xóa: order_items

---

## 🎨 TÍNH NĂNG NỔI BẬT

### 1. **Chatbot AI Tư Vấn Hoa** 🤖
- Tư vấn chọn hoa theo dịp (sinh nhật, cưới, khai trương...)
- Giải thích ý nghĩa hoa và màu sắc
- Hướng dẫn chăm sóc hoa
- Gợi ý sản phẩm phù hợp ngay trong chat
- Lưu lịch sử hội thoại

### 2. **Recommendation System** 🎯
- Gợi ý sản phẩm cá nhân hóa dựa trên:
  - Lịch sử xem sản phẩm
  - Lịch sử mua hàng
  - Sở thích đã học
- Sản phẩm tương tự (Similar Products)
- Personalized Recommendations

### 3. **Quản Lý Đơn Hàng Đầy Đủ** 📦
- Tracking trạng thái đơn hàng
- Nhiều phương thức vận chuyển
- Nhiều phương thức thanh toán
- Ghi chú đơn hàng

### 4. **Admin Dashboard** 👨‍💼
- Quản lý users, products, orders, categories
- Xem logs hoạt động
- Theo dõi lịch sử thay đổi sản phẩm
- Quản lý sliders/banners

---

## 💾 DỮ LIỆU MẪU

Database đã có sẵn dữ liệu mẫu:
- **Users:** 6 users (bao gồm admin)
- **Categories:** 4 danh mục (Hoa cưới, Hoa khai trương, Bó hoa tươi, Hoa sáp)
- **Products:** 25+ sản phẩm với hình ảnh
- **Orders:** 15 đơn hàng mẫu
- **Blog Posts:** 4 bài viết
- **Flower Knowledge:** 10+ loài hoa với kiến thức đầy đủ

---

## 🔐 BẢO MẬT

- **Password:** Mã hóa bằng bcrypt (password_hash)
- **JWT:** Xác thực API bằng JSON Web Token
- **Role-based Access:** Phân quyền user/admin
- **Cascade Delete:** Đảm bảo tính toàn vẹn dữ liệu

---

## 📝 GHI CHÚ KỸ THUẬT

### Charset & Collation:
- **Charset:** utf8mb4 (hỗ trợ emoji và ký tự đặc biệt)
- **Collation:** utf8mb4_unicode_ci (so sánh không phân biệt hoa thường)

### Engine:
- **InnoDB:** Hỗ trợ transactions và foreign keys

### Timestamps:
- `created_at`: Tự động lưu thời gian tạo
- `updated_at`: Tự động cập nhật khi có thay đổi

---

## 🚀 KẾT LUẬN

Database được thiết kế:
- ✅ **Chuẩn hóa tốt** (3NF)
- ✅ **Có tính mở rộng cao**
- ✅ **Tối ưu hiệu suất** (indexes)
- ✅ **Bảo mật tốt** (password hash, role-based)
- ✅ **Tính năng hiện đại** (AI chatbot, recommendation)
- ✅ **Dễ bảo trì** (foreign keys, cascade)

**Điểm nổi bật:**
- Chatbot AI với knowledge base về hoa
- Recommendation system thông minh
- Quản lý đơn hàng đầy đủ
- Admin tracking đầy đủ

---

**Cảm ơn thầy/cô đã xem!** 🌸
