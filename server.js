// (Đặt đoạn này SAU khi khai báo const app = express();)
// 🗑️ Xóa hóa đơn
// Đặt sau khi khai báo app
const openurl = require('openurl');
const express = require('express');
const path = require('path');
const sql = require('mssql');

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
  server: 'MY-CHEESE',
  database: 'CoopmartDB',
  options: { 
    encrypt: false, 
    trustServerCertificate: true
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: '',
      userName: '',
      password: ''
    }
  }
};

// 🚪 Đăng nhập
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const found = users.find(u => u.username === username && u.password === password);
  if (!found) return res.send('Sai tài khoản hoặc mật khẩu!');
  const redirectUrl = found.role === 'admin' ? '/admin/admin.html' : '/index.html?user=' + encodeURIComponent(found.username);
  res.redirect(redirectUrl);
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
    // Join để lấy tên sản phẩm
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

// 🗑️ Xóa danh mục
app.delete('/api/danhmuc/:id', async (req, res) => {
  const maDanhMuc = req.params.id;
  try {
    await sql.connect(dbConfig);
    // Xóa các sản phẩm thuộc danh mục này trước
    await sql.query`DELETE FROM SanPham WHERE MaDanhMuc = ${maDanhMuc}`;
    // Sau đó xóa danh mục
    await sql.query`DELETE FROM DanhMuc WHERE MaDanhMuc = ${maDanhMuc}`;
    res.json({ message: '✅ Đã xóa danh mục và các sản phẩm thuộc danh mục này!' });
  } catch (err) {
    console.error('❌ Lỗi xóa danh mục:', err.message);
    res.status(500).send('Lỗi khi xóa danh mục');
  } finally {
    sql.close();
  }
});

// ✏️ Sửa danh mục
app.put('/api/danhmuc/:id', uploadDanhMuc.none(), async (req, res) => {
  const id = req.params.id;
  const { TenDanhMuc } = req.body;
  console.log('🛠️ Đang sửa danh mục:', id, '→', TenDanhMuc);
  console.log('📦 Dữ liệu từ body:', req.body);


  if (!TenDanhMuc || !id) {
    return res.status(400).send('Thiếu dữ liệu');
  }

  try {
    await sql.connect(dbConfig);
    const ketQua = await sql.query`
      UPDATE DanhMuc SET TenDanhMuc = ${TenDanhMuc} WHERE MaDanhMuc = ${id}
    `;
    if (ketQua.rowsAffected[0] === 0) {
      return res.status(404).send('Không tìm thấy danh mục');
    }
    res.json({ message: '✅ Đã sửa danh mục!' });
  } catch (err) {
    console.error('❌ Lỗi sửa danh mục:', err.message);
    res.status(500).send('Lỗi khi sửa danh mục');
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