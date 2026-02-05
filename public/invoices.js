// Danh sách hóa đơn: ưu tiên lọc theo SĐT đã lưu (đơn gần nhất), không có thì hiển thị tất cả
(function() {
  const container = document.getElementById('user-invoices');
  if (!container) return;

  const latestOrder = JSON.parse(localStorage.getItem('latestOrder') || '{}');
  const soDienThoaiUser = (latestOrder.soDienThoai || '').trim();

  async function load() {
    let html = '';
    try {
      const res = await fetch('/api/hoadon');
      const ds = await res.json();
      let list = ds || [];

      if (soDienThoaiUser) {
        list = list.filter(hd => (hd.SoDienThoai || '').toString().trim() === soDienThoaiUser);
      }

      if (list.length === 0) {
        if (soDienThoaiUser) {
          html = '<p>Bạn chưa có hóa đơn nào với SĐT này. Đặt hàng tại <a href="products.html">Sản phẩm</a>.</p>';
        } else {
          html = '<p>Bạn chưa đặt hàng. Đặt hàng tại <a href="products.html">Sản phẩm</a>, sau khi thanh toán hóa đơn sẽ hiển thị tại đây (theo SĐT bạn nhập).</p>';
        }
      } else {
        html = '<table class="invoice-table"><thead><tr><th>Mã</th><th>Ngày</th><th>Trạng thái</th><th>Xem</th></tr></thead><tbody>';
        list.forEach(hd => {
          const statusClass = hd.TrangThai === 'Đã xác nhận' ? 'status xacnhan' : 'status';
          const ngay = hd.NgayLap ? new Date(hd.NgayLap).toLocaleDateString('vi-VN') : '';
          html += `<tr><td>#${hd.MaHoaDon}</td><td>${ngay}</td><td><span class="${statusClass}">${hd.TrangThai || 'Đã đặt'}</span></td><td><a href="invoice.html?ma=${hd.MaHoaDon}" class="btn">Xem</a></td></tr>`;
        });
        html += '</tbody></table>';
      }
    } catch (e) {
      html = '<p>Lỗi khi tải hóa đơn. Kiểm tra kết nối server.</p>';
    }
    container.innerHTML = html;
  }

  load();
})();
