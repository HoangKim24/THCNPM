# ⚜️ Luxury Perfume Management System

> Một giải pháp quản lý bán hàng cao cấp dành riêng cho các cửa hàng nước hoa Luxury, tích hợp quản lý kho, doanh thu và trải nghiệm khách hàng tinh tế.

---

## ✨ Điểm Nổi Bật

- **Giao diện Sang trọng**: Tối ưu hóa trải nghiệm người dùng với phong cách hiện đại.
- **Quản lý Vouchers**: Hệ thống mã giảm giá linh hoạt cho khách hàng VIP.
- **Thống kê Thời gian thực**: Theo dõi doanh thu, sản phẩm bán chạy qua biểu đồ trực quan.
- **Hệ thống Đa tầng**: Phân quyền rõ ràng giữa Khách hàng và Quản trị viên.

## 📋 Tính Năng Chính

### 💎 Trải Nghiệm Khách Hàng
- [x] **Trang chủ**: Hiển thị bộ sưu tập nước hoa mới nhất.
- [x] **Chi tiết sản phẩm**: Thông tin chi tiết về tầng hương, nồng độ và câu chuyện thương hiệu.
- [x] **Giỏ hàng & Thanh toán**: Quy trình mua hàng nhanh chóng, hỗ trợ ghi chú địa chỉ.
- [x] **Hóa đơn & Lịch sử**: Theo dõi đơn hàng đã mua dễ dàng.
- [x] **Hồ sơ cá nhân**: Quản lý thông tin, đổi ảnh đại diện và mật khẩu.

### 🛡️ Quản Trị Hệ Thống (Admin Panel)
- [x] **Dashboard Dashboard**: Thống kê tổng doanh thu, số lượng đơn hàng và người dùng.
- [x] **Quản lý Sản phẩm**: Thêm/Sửa/Xóa sản phẩm với tính năng upload hình ảnh tự động.
- [x] **Quản lý Danh mục**: Phân loại nước hoa theo thương hiệu hoặc loại (EDP, EDT...).
- [x] **Xử lý Đơn hàng**: Xem chi tiết và cập nhật trạng thái đơn hàng (Chờ xử lý/Đã xác nhận).
- [x] **Hệ thống Voucher**: Tạo và quản lý các chương trình khuyến mãi.
- [x] **Quản lý Người dùng**: Kiểm soát trạng thái hoạt động của tài khoản khách hàng.

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Database** | Microsoft SQL Server (MSSQL) |
| **Frontend** | HTML5, CSS3 (Vanilla), JavaScript (ES6+) |
| **Tiện ích** | Multer (Upload), Dotenv (Config), Openurl |

## 🚀 Hướng Dẫn Cài Đặt

### 1. Yêu Cầu Hệ Thống
- Node.js v16.x trở lên.
- Microsoft SQL Server.

### 2. Cài Đặt Dự Án
```bash
# Clone repository
git clone <repository-url>

# Di chuyển vào thư mục
cd THCNPM-main

# Cài đặt thư viện
npm install
```

### 3. Cấu Hình Biến Môi Trường
Tạo tệp `.env` tại thư mục gốc và cấu hình như sau:
```env
PORT=3000
DB_SERVER=localhost
DB_NAME=CoopmartDB
DB_USER=your_username
DB_PASSWORD=your_password
DB_TRUST_CERT=true
DB_ENCRYPT=false
```

### 4. Khởi Chạy
```bash
npm start
```
Truy cập: `http://localhost:3000`

## 📂 Cấu Trúc Thư Mục
- `/admin`: Chứa giao diện và logic của trang quản trị.
- `/public`: Chứa giao diện khách hàng, CSS, và hình ảnh sản phẩm.
- `server.js`: API Server chính xử lý logic nghiệp vụ.
- `*.js (root)`: Các script hỗ trợ khởi tạo và kiểm tra database.

---

## 👨‍💻 Tác Giả
Dự án được phát triển bởi **Hoàng Kim** & Team THCNPM.

> [!TIP]
> Để bảo mật tốt nhất, hãy đảm bảo bạn không chia sẻ tệp `.env` chứa mật khẩu database lên các kho lưu trữ công khai.
