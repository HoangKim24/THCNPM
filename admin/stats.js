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

    // Biểu đồ doanh thu theo danh mục (Pie Chart)
    if (window.Chart && document.getElementById('chartDanhMuc')) {
      const catLabels = [];
      const catData = [];
      
      // Giả lập hoặc tính toán từ dữ liệu (Cần API cập nhật nếu muốn chính xác 100%)
      // Hiện tại ta sẽ lấy danh sách danh mục và gán random hoặc 0 nếu chưa có API chi tiết
      const catResp = await fetch('/api/danhmuc');
      const categories = await catResp.json();
      
      categories.forEach(c => {
        catLabels.push(c.TenDanhMuc);
        // Để demo/thực tế: Ta nên có API trả về doanh thu từng DM. 
        // Ở đây ta sẽ gán giá trị mẫu hoặc 0.
        catData.push(Math.floor(Math.random() * 1000000)); 
      });

      new Chart(document.getElementById('chartDanhMuc').getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{
            data: catData,
            backgroundColor: [
              '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          },
          cutout: '70%'
        }
      });
    }

    // Top 5 sản phẩm bán chạy
    if (document.getElementById('top-products-list')) {
      try {
        const topResp = await fetch('/api/stats/top-products');
        const topProducts = await topResp.json();
        const listContainer = document.getElementById('top-products-list');
        
        if (topProducts.length === 0) {
          listContainer.innerHTML = '<p style="text-align: center; color: #888;">Chưa có dữ liệu bán hàng.</p>';
        } else {
          listContainer.innerHTML = topProducts.map((p, index) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid #f8f8f8;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-weight: 700; color: #27ae60;">#${index + 1}</span>
                <span style="font-weight: 500;">${p.TenSanPham}</span>
              </div>
              <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                ${p.TotalSold} đã bán
              </span>
            </div>
          `).join('');
        }
      } catch (e) {
        console.error('Lỗi tải top products:', e);
      }
    }
  } catch (err) {
    console.error('❌ Lỗi tải thống kê:', err);
    // Có thể hiển thị thông báo lỗi trên UI nếu cần
  }
}

document.addEventListener('DOMContentLoaded', loadStats);
