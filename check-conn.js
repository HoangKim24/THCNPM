const sql = require('mssql');
require('dotenv').config();

const config = {
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
    config.authentication = {
        type: 'ntlm',
        options: {
            domain: process.env.DB_DOMAIN,
            userName: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        }
    };
}

console.log('🔄 Đang thử kết nối với cấu hình:', {
    server: config.server,
    database: config.database,
    user: config.user,
    authType: config.authentication ? config.authentication.type : 'default'
});

async function runTest() {
    try {
        await sql.connect(config);
        console.log('✅ Kết nối thành công!');
        const result = await sql.query('SELECT 1 as Connected');
        console.log('📊 Truy vấn mẫu thành công:', result.recordset);
    } catch (err) {
        console.error('❌ Lỗi kết nối:', err.message);
        console.error('Stack trace:', err.stack);
        
        if (err.message.includes('Login failed')) {
            console.log('💡 Gợi ý: Nếu dùng Windows Authentication (NTLM), hãy điền đầy đủ DB_USER, DB_PASSWORD và DB_DOMAIN (nếu có).');
        }
    } finally {
        await sql.close();
    }
}

runTest();
