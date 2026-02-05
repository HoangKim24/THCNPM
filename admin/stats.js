// admin/stats.js - Tự động thống kê số lượng sản phẩm, danh mục, doanh thu, tài khoản

async function loadStats() {
  // Lấy doanh thu từng tháng (12 tháng gần nhất)
  let doanhThuThang = Array(12).fill(0);
  let labelsThang = [];
  try {
    const resHD = await fetch('/api/hoadon');
    const dsHD = await resHD.json();
    let allChiTiet = [];
    for (const hd of dsHD) {
      if (hd.TrangThai === 'Đã xác nhận') {
        try {
          const resCT = await fetch(`/api/hoadon/${hd.MaHoaDon}`);
          const dataCT = await resCT.json();
          // Lấy tháng/năm từ NgayLap
          if (hd.NgayLap) {
            const d = new Date(hd.NgayLap);
            const thang = d.getMonth();
            const nam = d.getFullYear();
            const idx = (new Date().getFullYear() - nam) * 12 + (new Date().getMonth() - thang);
            if (idx >= 0 && idx < 12) {
              doanhThuThang[11-idx] += dataCT.chiTiet.reduce((sum, ct) => sum + (ct.SoLuong * ct.DonGia), 0);
            }
          }
          allChiTiet = allChiTiet.concat(dataCT.chiTiet || []);
        } catch {}
      }
    }
    // Tạo nhãn tháng
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labelsThang.push(`${d.getMonth()+1}/${d.getFullYear()}`);
    }
  } catch {}
  // Sản phẩm
  let sp = 0, dm = 0, doanhThu = 0;
  try {
    const resSP = await fetch('/api/sanpham');
    const dataSP = await resSP.json();
    sp = dataSP.length;
  } catch {}
  try {
    const resDM = await fetch('/api/danhmuc');
    const dataDM = await resDM.json();
    dm = dataDM.length;
  } catch {}
  try {
    const resHD = await fetch('/api/hoadon');
    const dsHD = await resHD.json();
    // Lấy tất cả chi tiết hóa đơn của các hóa đơn đã xác nhận
    let allChiTiet = [];
    for (const hd of dsHD) {
      if (hd.TrangThai === 'Đã xác nhận') {
        try {
          const resCT = await fetch(`/api/hoadon/${hd.MaHoaDon}`);
          const dataCT = await resCT.json();
          allChiTiet = allChiTiet.concat(dataCT.chiTiet || []);
        } catch {}
      }
    }
    // Tính doanh thu từ chi tiết hóa đơn
    doanhThu = allChiTiet.reduce((sum, ct) => sum + (ct.SoLuong * ct.DonGia), 0);
  } catch {}
  // Tài khoản mẫu cứng (nếu muốn lấy từ DB thì cần API riêng)
  const userCount = 2;
  // Hiển thị
  document.getElementById('stat-sanpham').textContent = sp + ' sản phẩm';
  document.getElementById('stat-danhmuc').textContent = dm + ' nhóm';
  document.getElementById('stat-user').textContent = userCount + ' người dùng';
  document.getElementById('stat-doanhthu').textContent = doanhThu.toLocaleString() + ' ₫';

  // Vẽ biểu đồ doanh thu tháng
  if (window.Chart && document.getElementById('chartDoanhThu')) {
    new Chart(document.getElementById('chartDoanhThu').getContext('2d'), {
      type: 'line',
      data: {
        labels: labelsThang,
        datasets: [{
          label: 'Doanh thu',
          data: doanhThuThang,
          borderColor: '#2d8f4e',
          backgroundColor: 'rgba(45,143,78,0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#2d8f4e',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.parsed.y.toLocaleString() + ' ₫' } }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString() + ' ₫' } }
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', loadStats);
