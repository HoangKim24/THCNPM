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

const categories = [
    { name: 'Rau Củ Tươi', img: 'cat-rau-cu.png' },
    { name: 'Trái Cây Nội', img: 'cat-trai-cay.png' },
    { name: 'Trái Cây Nhập', img: 'cat-nhap-khau.png' },
    { name: 'Thịt Các Loại', img: 'cat-thit.png' },
    { name: 'Hải Sản Tươi', img: 'cat-hai-san.png' },
    { name: 'Sữa & Bánh', img: 'cat-sua-banh.png' },
    { name: 'Đồ Uống', img: 'cat-do-uong.png' },
    { name: 'Gia Vị', img: 'cat-gia-vi.png' },
    { name: 'Đồ Khô', img: 'cat-do-kho.png' },
    { name: 'Hóa Mỹ Phẩm', img: 'cat-hoa-my-pham.png' }
];

const products = [
    { name: 'Cải Thìa Hữu Cơ', price: 15000, unit: 'Bó 500g', cat: 'Rau Củ Tươi' },
    { name: 'Cà Rốt Đà Lạt', price: 22000, unit: 'Kg', cat: 'Rau Củ Tươi' },
    { name: 'Bông Cải Xanh', price: 35000, unit: 'Cây', cat: 'Rau Củ Tươi' },
    { name: 'Xoài Cát Hòa Lộc', price: 85000, unit: 'Kg', cat: 'Trái Cây Nội' },
    { name: 'Vú Sữa Lò Rèn', price: 60000, unit: 'Kg', cat: 'Trái Cây Nội' },
    { name: 'Dưa Hấu Không Hạt', price: 25000, unit: 'Kg', cat: 'Trái Cây Nội' },
    { name: 'Táo Envy Mỹ', price: 120000, unit: 'Kg', cat: 'Trái Cây Nhập' },
    { name: 'Nho Mẫu Đơn HQ', price: 350000, unit: 'Chùm', cat: 'Trái Cây Nhập' },
    { name: 'Việt Quất Tươi', price: 95000, unit: 'Hộp 125g', cat: 'Trái Cây Nhập' },
    { name: 'Thịt Ba Chỉ Heo', price: 145000, unit: 'Kg', cat: 'Thịt Các Loại' },
    { name: 'Thăn Bò Úc', price: 280000, unit: 'Kg', cat: 'Thịt Các Loại' },
    { name: 'Gà Ta Thả Vườn', price: 160000, unit: 'Con', cat: 'Thịt Các Loại' },
    { name: 'Tôm Sú Tươi', price: 220000, unit: 'Kg', cat: 'Hải Sản Tươi' },
    { name: 'Cá Hồi Fillet', price: 450000, unit: 'Kg', cat: 'Hải Sản Tươi' },
    { name: 'Mực Lá Phan Thiết', price: 320000, unit: 'Kg', cat: 'Hải Sản Tươi' },
    { name: 'Sữa Tươi TH True', price: 38000, unit: 'Lốc 4 hộp', cat: 'Sữa & Bánh' },
    { name: 'Bánh Mì Sandwich', price: 25000, unit: 'Túi', cat: 'Sữa & Bánh' },
    { name: 'Sữa Chua Vinamilk', price: 28000, unit: 'Lốc 4 hộp', cat: 'Sữa & Bánh' },
    { name: 'Nước Khoáng Lavie', price: 5000, unit: 'Chai 500ml', cat: 'Đồ Uống' },
    { name: 'Bia Heineken', price: 450000, unit: 'Thùng 24', cat: 'Đồ Uống' },
    { name: 'Nước Ép Cam', price: 45000, unit: 'Chai 1L', cat: 'Đồ Uống' },
    { name: 'Nước Mắm Nam Ngư', price: 55000, unit: 'Chai 750ml', cat: 'Gia Vị' },
    { name: 'Dầu Ăn Neptune', price: 65000, unit: 'Chai 1L', cat: 'Gia Vị' },
    { name: 'Hạt Nêm Knorr', price: 42000, unit: 'Gói 400g', cat: 'Gia Vị' },
    { name: 'Gạo ST25', price: 185000, unit: 'Túi 5kg', cat: 'Đồ Khô' },
    { name: 'Mì Hảo Hảo', price: 115000, unit: 'Thùng 30', cat: 'Đồ Khô' },
    { name: 'Miến Phú Hương', price: 12000, unit: 'Gói', cat: 'Đồ Khô' },
    { name: 'Dầu Gội Pantene', price: 135000, unit: 'Chai 650g', cat: 'Hóa Mỹ Phẩm' },
    { name: 'Nước Rửa Chén', price: 32000, unit: 'Chai 750ml', cat: 'Hóa Mỹ Phẩm' },
    { name: 'Bột Giặt OMO', price: 195000, unit: 'Túi 4kg', cat: 'Hóa Mỹ Phẩm' }
];

async function seed() {
    try {
        await sql.connect(dbConfig);
        console.log('--- Đang chèn dữ liệu mẫu ---');

        for (const cat of categories) {
            const check = await sql.query`SELECT MaDanhMuc FROM DanhMuc WHERE TenDanhMuc = ${cat.name}`;
            let catId;
            if (check.recordset.length === 0) {
                const res = await sql.query`INSERT INTO DanhMuc (TenDanhMuc, HinhAnh) OUTPUT INSERTED.MaDanhMuc VALUES (${cat.name}, ${cat.img})`;
                catId = res.recordset[0].MaDanhMuc;
                console.log(`✅ Đã thêm danh mục: ${cat.name}`);
            } else {
                catId = check.recordset[0].MaDanhMuc;
            }

            const catProducts = products.filter(p => p.cat === cat.name);
            for (const p of catProducts) {
                const checkSp = await sql.query`SELECT MaSanPham FROM SanPham WHERE TenSanPham = ${p.name}`;
                if (checkSp.recordset.length === 0) {
                    await sql.query`INSERT INTO SanPham (TenSanPham, DonGia, DonViTinh, MaDanhMuc) VALUES (${p.name}, ${p.price}, ${p.unit}, ${catId})`;
                    console.log(`   + Đã thêm sản phẩm: ${p.name}`);
                }
            }
        }

        console.log('--- Hoàn tất seeding ---');
    } catch (err) {
        console.error('❌ Lỗi seeding:', err);
    } finally {
        await sql.close();
    }
}

seed();
