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

async function setup() {
    try {
        await sql.connect(dbConfig);
        console.log('--- Đang cập nhật Database ---');

        // Thêm cột Avatar, Address vào NguoiDung
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NguoiDung') AND name = 'Avatar')
            ALTER TABLE NguoiDung ADD Avatar NVARCHAR(MAX) NULL;
            
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NguoiDung') AND name = 'Address')
            ALTER TABLE NguoiDung ADD Address NVARCHAR(MAX) NULL;
        `);
        console.log('✅ Đã cập nhật bảng NguoiDung (Avatar, Address)');

        // Tạo bảng Vouchers nếu chưa có
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('Vouchers') AND type in (N'U'))
            CREATE TABLE Vouchers (
                MaVoucher INT PRIMARY KEY IDENTITY(1,1),
                Code NVARCHAR(50) UNIQUE NOT NULL,
                GiamGia INT NOT NULL, -- Số tiền hoặc %? Ta mặc định là số tiền/giá trị (VD: 10000, 20000)
                MoTa NVARCHAR(255),
                NgayHetHan DATETIME,
                Status NVARCHAR(20) DEFAULT 'active'
            );
        `);
        console.log('✅ Đã kiểm tra/tạo bảng Vouchers');

        // Thêm cột TrangThai chi tiết cho HoaDon nếu chưa có
        // Hiện tại HoaDon.TrangThai đang dùng chung, ta cứ để vậy nhưng code logic sẽ phong phú hơn.

    } catch (err) {
        console.error('❌ Lỗi setup db:', err);
    } finally {
        await sql.close();
    }
}

setup();
