# Hệ Thống Quản Lý Bán Hàng

Ứng dụng web quản lý bán hàng với giao diện admin và khách hàng, sử dụng Node.js và SQL Server.

## 📋 Tính Năng

### Phần Khách Hàng
- 🏠 Trang chủ hiển thị sản phẩm
- 🔍 Xem chi tiết sản phẩm
- 📂 Duyệt sản phẩm theo danh mục
- 🛒 Giỏ hàng
- 💳 Thanh toán
- 📄 Xem hóa đơn

### Phần Quản Trị
- 📊 Thống kê doanh thu
- 🏷️ Quản lý danh mục sản phẩm
- 📦 Quản lý sản phẩm (thêm, sửa, xóa)
- 🖼️ Upload hình ảnh sản phẩm
- 📝 Quản lý hóa đơn

## 🛠️ Công Nghệ Sử Dụng

- **Backend**: Node.js, Express.js
- **Database**: Microsoft SQL Server (MSSQL)
- **Frontend**: HTML, CSS, JavaScript
- **Upload**: Multer

## 📦 Cài Đặt

### Yêu Cầu
- Node.js (v14 trở lên)
- SQL Server
- npm hoặc yarn

### Các Bước Cài Đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd THCNPM-main
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình Database**

Mở file `server.js` và cập nhật thông tin kết nối database:

```javascript
const dbConfig = {
  server: 'YOUR_SERVER_NAME',
  database: 'CoopmartDB',
  options: { 
    encrypt: false, 
    trustServerCertificate: true
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: '',
      userName: 'YOUR_USERNAME',
      password: 'YOUR_PASSWORD'
    }
  }
};
```

4. **Tạo Database**

Chạy script SQL để tạo database `CoopmartDB` với các bảng:
- DanhMuc
- SanPham
- HoaDon
- ChiTietHoaDon

5. **Chạy ứng dụng**
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 👥 Tài Khoản Demo

### Admin
- Username: `admin`
- Password: `admin123`

### User
- Username: `chuong`
- Password: `user123`

## 📁 Cấu Trúc Thư Mục

```
THCNPM-main/
├── admin/              # Giao diện quản trị
│   ├── admin.html      # Trang chủ admin
│   ├── danhmuc.html    # Quản lý danh mục
│   ├── sanpham.html    # Quản lý sản phẩm
│   ├── hoadon.html     # Quản lý hóa đơn
│   └── *.js            # Scripts riêng
├── public/             # Giao diện khách hàng
│   ├── index.html      # Trang chủ
│   ├── products.html   # Danh sách sản phẩm
│   ├── cart.html       # Giỏ hàng
│   ├── checkout.html   # Thanh toán
│   ├── images/         # Thư mục chứa hình ảnh
│   └── *.js            # Scripts riêng
├── server.js           # Server chính
├── test-db.js          # Test kết nối database
└── package.json        # Dependencies
```

## 🔌 API Endpoints

### Sản Phẩm
- `GET /api/sanpham` - Lấy danh sách sản phẩm
- `POST /api/sanpham` - Thêm sản phẩm mới
- `PUT /api/sanpham/:id` - Cập nhật sản phẩm
- `DELETE /api/sanpham/:id` - Xóa sản phẩm

### Danh Mục
- `GET /api/danhmuc` - Lấy danh sách danh mục
- `POST /api/danhmuc` - Thêm danh mục mới
- `PUT /api/danhmuc/:id` - Cập nhật danh mục
- `DELETE /api/danhmuc/:id` - Xóa danh mục

### Hóa Đơn
- `GET /api/hoadon` - Lấy danh sách hóa đơn
- `POST /api/hoadon` - Tạo hóa đơn mới
- `DELETE /api/hoadon/:id` - Xóa hóa đơn

### Xác Thực
- `POST /login` - Đăng nhập

## 🚀 Sử Dụng

1. Truy cập `http://localhost:3000` để vào trang khách hàng
2. Truy cập `http://localhost:3000/login.html` để đăng nhập
3. Đăng nhập với tài khoản admin để vào trang quản trị

## 📝 Ghi Chú

- Hình ảnh sản phẩm được lưu trong thư mục `public/images/`
- Sử dụng NTLM authentication cho SQL Server
- Cần cấu hình SQL Server cho phép kết nối TCP/IP

## 📄 License

ISC

## 👨‍💻 Tác Giả

THCNPM Team
