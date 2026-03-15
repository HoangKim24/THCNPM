// admin/stats.js - Tự động thống kê số lượng sản phẩm, danh mục, doanh thu, tài khoản
// Đã được tối ưu hóa để sử dụng API /api/stats từ server

async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    if (!response.ok) throw new Error('Không thể lấy dữ liệu thống kê');
    
    const data = await response.json();
    
    // Hiển thị các thông số cơ bản
    document.getElementById('stat-sanpham').textContent = data.products + ' sản phẩm';
    document.getElementById('stat-danhmuc').textContent = data.categories + ' nhóm';
    document.getElementById('stat-user').textContent = data.users + ' người dùng';
    document.getElementById('stat-doanhthu').textContent = data.totalRevenue.toLocaleString() + ' ₫';

    // Cảnh báo hàng sắp hết (giả định < 5 là sắp hết)
    const lowStockCount = data.lowStockCount || 0;
    const lowStockBox = document.getElementById('low-stock-alert');
    const lowStockText = document.getElementById('stat-low-stock');
    if (lowStockCount > 0 && lowStockBox) {
      lowStockBox.style.display = 'block';
      lowStockText.textContent = lowStockCount + ' sản phẩm';
    }

    // Xử lý dữ liệu biểu đồ
    if (window.Chart && document.getElementById('chartDoanhThu')) {
      // Chuẩn bị nhãn và dữ liệu cho 12 tháng gần nhất
      const labelsThang = [];
      const doanhThuThang = [];
      
      // Sắp xếp dữ liệu từ cũ đến mới (để vẽ biểu đồ từ trái sang phải)
      const sortedMonthly = [...data.monthly].reverse();
      
      sortedMonthly.forEach(m => {
        labelsThang.push(`${m.month}/${m.year}`);
        doanhThuThang.push(m.revenue);
      });

      // Vẽ biểu đồ
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
  } catch (err) {
    console.error('❌ Lỗi tải thống kê:', err);
    // Có thể hiển thị thông báo lỗi trên UI nếu cần
  }
}

document.addEventListener('DOMContentLoaded', loadStats);
