const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function cleanup() {
    try {
        await sql.connect(dbConfig);
        console.log('Connected to DB');

        // Fix Apple product and any other product using the elephant image or having "Cáikg"
        await sql.query`
            UPDATE SanPham 
            SET HinhAnh = 'placeholder-product.png'
            WHERE HinhAnh = 'HinhAnh-1752415674712-693980431.jpg'
        `;
        
        await sql.query`
            UPDATE SanPham 
            SET DonViTinh = 'kg'
            WHERE DonViTinh = 'Cáikg'
        `;

        await sql.query`
            UPDATE SanPham 
            SET DonViTinh = 'Cái'
            WHERE DonViTinh = 'CáiCái'
        `;

        // Fix categories
        await sql.query`
            UPDATE DanhMuc 
            SET HinhAnh = 'placeholder-category.png'
            WHERE HinhAnh = 'HinhAnh-1752415674712-693980431.jpg' OR HinhAnh IS NULL
        `;

        console.log('Cleanup complete');
    } catch (err) {
        console.error('Cleanup failed:', err);
    } finally {
        await sql.close();
    }
}

cleanup();
