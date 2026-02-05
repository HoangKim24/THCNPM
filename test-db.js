const sql = require('mssql');

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

(async () => {
  try {
    await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO SanPham (TenSanPham, DonGia, DonViTinh, MaDanhMuc)
      VALUES (N'Test bánh mì', 25000, N'Cái', 6)
    `;
    console.log('✅ Test chèn thành công');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    console.error(err);
  } finally {
    await sql.close();
  }
})();