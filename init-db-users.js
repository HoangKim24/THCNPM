const sql = require('mssql');
require('dotenv').config();

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

const createTableQuery = `
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NguoiDung')
BEGIN
    CREATE TABLE NguoiDung (
        MaNguoiDung INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        Password NVARCHAR(100) NOT NULL,
        Role NVARCHAR(20) DEFAULT 'user',
        FullName NVARCHAR(100),
        Phone NVARCHAR(20),
        Status NVARCHAR(20) DEFAULT 'active'
    );
    
    -- Insert sample users
    INSERT INTO NguoiDung (Username, Password, Role, FullName)
    VALUES ('admin', 'admin123', 'admin', N'Quản trị viên'),
           ('chuong', 'user123', 'user', N'Nguyễn Văn Chương');
END
`;

(async () => {
  try {
    console.log('🔄 Đang khởi tạo bảng NguoiDung...');
    await sql.connect(dbConfig);
    await sql.query(createTableQuery);
    console.log('✅ Khởi tạo thành công!');
    
    const users = await sql.query('SELECT * FROM NguoiDung');
    console.log('👥 Danh sách người dùng hiện tại:', users.recordset);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await sql.close();
  }
})();
