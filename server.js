const openurl = require('openurl');
const express = require('express');
const path = require('path');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PORT = 3000;


// ⚙️ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Đặt các route API ở đây ---
// (Toàn bộ các route API đã có sẵn bên dưới)

// 📁 Static assets (Đặt SAU các route API)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// 🔐 Tài khoản mẫu
const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'chuong', password: 'user123', role: 'user' }
];

// 🗃️ Cấu hình database
const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'CoopmartDB',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: { 
    encrypt: process.env.DB_ENCRYPT === 'true', 
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
  }
};

// Nếu có DB_DOMAIN, dùng NTLM (Windows Auth), nếu không dùng SQL Auth mặc định
if (process.env.DB_DOMAIN) {
  dbConfig.authentication = {
    type: 'ntlm',
    options: {
      domain: process.env.DB_DOMAIN,
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  };
}

// 🚪 Đăng nhập (Sử dụng Database)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT Username, Role FROM NguoiDung 
      WHERE Username = ${username} AND Password = ${password} AND Status = 'active'
    `;
    
    if (result.recordset.length === 0) {
      return res.send('<script>alert("Sai tài khoản hoặc mật khẩu!"); window.location.href="/login.html";</script>');
    }
    
    const user = result.recordset[0];
    const redirectUrl = user.Role === 'admin' ? '/admin/admin.html' : '/index.html?user=' + encodeURIComponent(user.Username);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('❌ Lỗi login:', err.message);
    res.status(500).send('Lỗi hệ thống khi đăng nhập');
  } finally {
    sql.close();
  }
});

// 📝 Đăng ký tài khoản
app.post('/api/auth/register', async (req, res) => {
  const { username, password, fullName, phone } = req.body;
  try {
    await sql.connect(dbConfig);
    // Kiểm tra trùng username
    const checkUser = await sql.query`SELECT Username FROM NguoiDung WHERE Username = ${username}`;
    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
    }
    
    await sql.query`
      INSERT INTO NguoiDung (Username, Password, Role, FullName, Phone)
      VALUES (${username}, ${password}, 'user', ${fullName}, ${phone})
    `;
    res.json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    console.error('❌ Lỗi đăng ký:', err.message);
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  } finally {
    sql.close();
  }
});

// 🛒 Thêm sản phẩm (có upload ảnh)
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

app.post('/api/sanpham', upload.single('HinhAnh'), async (req, res) => {
  const { TenSanPham, DonGia, DonViTinh, MaDanhMuc } = req.body;
  const hinhAnh = req.file ? req.file.filename : null;
  console.log('📥 Dữ liệu nhận từ form:', req.body, 'Ảnh:', hinhAnh);
  try {
    await sql.connect(dbConfig);
    const ketQua = await sql.query`
      INSERT INTO SanPham (TenSanPham, DonGia, DonViTinh, MaDanhMuc, HinhAnh)
      VALUES (
        CAST(${TenSanPham} AS NVARCHAR(200)),
        CAST(${DonGia} AS DECIMAL(18,2)),
        CAST(${DonViTinh} AS NVARCHAR(50)),
        CAST(${MaDanhMuc} AS INT),
        CAST(${hinhAnh} AS NVARCHAR(255))
      )
    `;
    console.log('✅ Ghi sản phẩm thành công. Rows:', ketQua.rowsAffected);
    res.json({ message: '✅ Đã thêm sản phẩm thành công!' });
  } catch (err) {
    console.error('❌ Lỗi SQL:', err.message);
    console.error('❌ Chi tiết stack:', err.stack);
    res.status(500).send('Lỗi khi thêm sản phẩm');
  } finally {
    sql.close();
  }
});

// 🗑️ Xóa sản phẩm
app.delete('/api/sanpham/:id', async (req, res) => {
  const maSanPham = req.params.id;
  try {
    await sql.connect(dbConfig);
    await sql.query`DELETE FROM SanPham WHERE MaSanPham = ${maSanPham}`;
    res.json({ message: '✅ Đã xóa sản phẩm!' });
  } catch (err) {
    console.error('❌ Lỗi khi xóa sản phẩm:', err.message);
    res.status(500).send('Lỗi khi xóa sản phẩm');
  } finally {
    sql.close();
  }
});

// 🛒 Cập nhật sản phẩm (có upload ảnh)
app.put('/api/sanpham/:id', upload.single('HinhAnh'), async (req, res) => {
  const maSanPham = req.params.id;
  const { TenSanPham, DonGia, DonViTinh, MaDanhMuc } = req.body;
  const hinhAnh = req.file ? req.file.filename : null;
  
  try {
    await sql.connect(dbConfig);
    if (hinhAnh) {
      await sql.query`
        UPDATE SanPham 
        SET TenSanPham = ${TenSanPham}, DonGia = ${DonGia}, DonViTinh = ${DonViTinh}, MaDanhMuc = ${MaDanhMuc}, HinhAnh = ${hinhAnh}
        WHERE MaSanPham = ${maSanPham}
      `;
    } else {
      await sql.query`
        UPDATE SanPham 
        SET TenSanPham = ${TenSanPham}, DonGia = ${DonGia}, DonViTinh = ${DonViTinh}, MaDanhMuc = ${MaDanhMuc}
        WHERE MaSanPham = ${maSanPham}
      `;
    }
    res.json({ message: '✅ Đã cập nhật sản phẩm thành công!' });
  } catch (err) {
    console.error('❌ Lỗi cập nhật sản phẩm:', err.message);
    res.status(500).send('Lỗi khi cập nhật sản phẩm');
  } finally {
    sql.close();
  }
});


// 📦 Lấy danh sách sản phẩm
app.get('/api/sanpham', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query('SELECT * FROM SanPham');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Lỗi lấy sản phẩm:', err.message);
    res.status(500).send('Lỗi truy vấn sản phẩm');
  } finally {
    sql.close();
  }
});

// 🧾 Tạo hóa đơn
app.post('/api/hoadon', async (req, res) => {
  const { tenKhachHang, soDienThoai, items } = req.body;
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      INSERT INTO HoaDon (TenKhachHang, SoDienThoai)
      OUTPUT INSERTED.MaHoaDon
      VALUES (${tenKhachHang}, ${soDienThoai})
    `;
    const maHoaDon = result.recordset[0].MaHoaDon;

    for (const item of items) {
      await sql.query`
        INSERT INTO ChiTietHoaDon (MaHoaDon, MaSanPham, SoLuong, DonGia)
        VALUES (${maHoaDon}, ${item.MaSanPham}, ${item.SoLuong}, ${item.DonGia})
      `;
    }

    res.json({ message: '✅ Đã tạo hóa đơn thành công!', maHoaDon });
  } catch (err) {
    console.error('❌ Lỗi tạo hóa đơn:', err.message);
    res.status(500).send('Lỗi khi tạo hóa đơn');
  } finally {
    sql.close();
  }
});

// 🔍 Lấy danh sách hóa đơn
app.get('/api/hoadon', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query('SELECT * FROM HoaDon ORDER BY MaHoaDon DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Lỗi lấy danh sách hóa đơn:', err.message);
    res.status(500).send('Lỗi truy vấn hóa đơn');
  } finally {
    sql.close();
  }
});

// 🔍 Xem hóa đơn theo ID
app.get('/api/hoadon/:id', async (req, res) => {
  const maHoaDon = req.params.id;
  try {
    await sql.connect(dbConfig);
    const hoaDon = await sql.query`SELECT * FROM HoaDon WHERE MaHoaDon = ${maHoaDon}`;
    const chiTiet = await sql.query`
      SELECT cthd.*, sp.TenSanPham FROM ChiTietHoaDon cthd
      JOIN SanPham sp ON cthd.MaSanPham = sp.MaSanPham
      WHERE cthd.MaHoaDon = ${maHoaDon}
    `;
    res.json({ hoaDon: hoaDon.recordset[0], chiTiet: chiTiet.recordset });
  } catch (err) {
    console.error('❌ Lỗi lấy hóa đơn:', err.message);
    res.status(500).send('Lỗi truy vấn hóa đơn');
  } finally {
    sql.close();
  }
});


// 📦 Lấy danh sách danh mục
app.get('/api/danhmuc', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query('SELECT * FROM DanhMuc');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Lỗi lấy danh mục:', err.message);
    res.status(500).send('Lỗi truy vấn danh mục');
  } finally {
    sql.close();
  }
});

// ➕ Thêm danh mục (có upload ảnh)
const storageDanhMuc = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const uploadDanhMuc = multer({ storage: storageDanhMuc });

app.post('/api/danhmuc', uploadDanhMuc.single('HinhAnh'), async (req, res) => {
  const TenDanhMuc = req.body ? req.body.TenDanhMuc : undefined;
  const hinhAnh = req.file ? req.file.filename : null;
  if (!TenDanhMuc) {
    return res.status(400).send('Thiếu tên danh mục');
  }
  try {
    await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO DanhMuc (TenDanhMuc, HinhAnh)
      VALUES (${TenDanhMuc}, ${hinhAnh})
    `;
    res.json({ message: '✅ Đã thêm danh mục!' });
  } catch (err) {
    console.error('❌ Lỗi thêm danh mục:', err.message);
    res.status(500).send('Lỗi khi thêm danh mục');
  } finally {
    sql.close();
  }
});

// 🔄 Cập nhật danh mục
app.put('/api/danhmuc/:id', uploadDanhMuc.single('HinhAnh'), async (req, res) => {
  const maDanhMuc = req.params.id;
  const { TenDanhMuc } = req.body;
  const hinhAnh = req.file ? req.file.filename : null;
  
  try {
    await sql.connect(dbConfig);
    if (hinhAnh) {
      await sql.query`UPDATE DanhMuc SET TenDanhMuc = ${TenDanhMuc}, HinhAnh = ${hinhAnh} WHERE MaDanhMuc = ${maDanhMuc}`;
    } else {
      await sql.query`UPDATE DanhMuc SET TenDanhMuc = ${TenDanhMuc} WHERE MaDanhMuc = ${maDanhMuc}`;
    }
    res.json({ message: '✅ Đã cập nhật danh mục!' });
  } catch (err) {
    console.error('❌ Lỗi cập nhật danh mục:', err.message);
    res.status(500).send('Lỗi khi cập nhật danh mục');
  } finally {
    sql.close();
  }
});

// 🗑️ Xóa danh mục
app.delete('/api/danhmuc/:id', async (req, res) => {
  const maDanhMuc = req.params.id;
  try {
    await sql.connect(dbConfig);
    await sql.query`DELETE FROM DanhMuc WHERE MaDanhMuc = ${maDanhMuc}`;
    res.json({ message: '✅ Đã xóa danh mục!' });
  } catch (err) {
    console.error('❌ Lỗi khi xóa danh mục:', err.message);
    res.status(500).send('Lỗi khi xóa danh mục');
  } finally {
    sql.close();
  }
});


// 👥 API Quản lý người dùng (Admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT MaNguoiDung, Username, Role, FullName, Phone, Status FROM NguoiDung`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    sql.close();
  }
});

app.post('/api/admin/users/:id/toggle-status', async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(dbConfig);
    const user = await sql.query`SELECT Status FROM NguoiDung WHERE MaNguoiDung = ${id}`;
    if (user.recordset.length === 0) return res.status(404).send('Không tìm thấy user');
    
    const newStatus = user.recordset[0].Status === 'active' ? 'blocked' : 'active';
    await sql.query`UPDATE NguoiDung SET Status = ${newStatus} WHERE MaNguoiDung = ${id}`;
    res.json({ message: 'Cập nhật thành công', newStatus });
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    sql.close();
  }
});

// 📊 Thống kê doanh thu và báo cáo
app.get('/api/stats', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    
    // 1. Tổng doanh thu (Chỉ tính hóa đơn đã xác nhận)
    const revenueRes = await sql.query`
      SELECT SUM(ct.SoLuong * ct.DonGia) as TotalRevenue
      FROM ChiTietHoaDon ct
      JOIN HoaDon h ON ct.MaHoaDon = h.MaHoaDon
      WHERE h.TrangThai = N'Đã xác nhận'
    `;
    
    // 2. Số lượng sản phẩm, danh mục, user
    const counts = await sql.query`
      SELECT 
        (SELECT COUNT(*) FROM SanPham) as products,
        (SELECT COUNT(*) FROM DanhMuc) as categories,
        (SELECT COUNT(*) FROM NguoiDung) as users
    `;
    
    // 3. Doanh thu theo tháng (6 tháng gần nhất)
    const monthlyRevenueRes = await sql.query`
      SELECT 
        MONTH(h.NgayLap) as month,
        YEAR(h.NgayLap) as year,
        SUM(ct.SoLuong * ct.DonGia) as revenue
      FROM ChiTietHoaDon ct
      JOIN HoaDon h ON ct.MaHoaDon = h.MaHoaDon
      WHERE h.TrangThai = N'Đã xác nhận'
      AND h.NgayLap >= DATEADD(month, -6, GETDATE())
      GROUP BY MONTH(h.NgayLap), YEAR(h.NgayLap)
      ORDER BY YEAR(h.NgayLap) DESC, MONTH(h.NgayLap) DESC
    `;

    res.json({
      totalRevenue: revenueRes.recordset[0].TotalRevenue || 0,
      products: counts.recordset[0].products,
      categories: counts.recordset[0].categories,
      users: counts.recordset[0].users,
      monthly: monthlyRevenueRes.recordset
    });
  } catch (err) {
    console.error('❌ Lỗi stats:', err.message);
    res.status(500).send('Lỗi khi lấy thống kê');
  } finally {
    sql.close();
  }
});
// 🌐 Điều hướng trang chính
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// 🚀 Khởi chạy server
// ✅ Xác nhận hóa đơn (đặt đúng vị trí sau khi khai báo app)
app.post('/api/hoadon/:id/xacnhan', async (req, res) => {
  const maHoaDon = req.params.id;
  try {
    await sql.connect(dbConfig);
    await sql.query`UPDATE HoaDon SET TrangThai = N'Đã xác nhận' WHERE MaHoaDon = ${maHoaDon}`;
    res.json({ message: 'Đã xác nhận đơn!' });
  } catch (err) {
    console.error('❌ Lỗi xác nhận hóa đơn:', err.message);
    res.status(500).send('Lỗi xác nhận hóa đơn');
  } finally {
    sql.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  openurl.open(`http://localhost:${PORT}/login.html`);
});