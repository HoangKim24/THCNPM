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

(async () => {
  try {
    console.log('🔄 Đang kết nối tới:', dbConfig.server);
    await sql.connect(dbConfig);
    const result = await sql.query('SELECT 1 as test');
    console.log('✅ Kết nối thành công!', result.recordset);
  } catch (err) {
    console.error('❌ Lỗi kết nối:', err.message);
  } finally {
    await sql.close();
  }
})();
