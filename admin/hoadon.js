document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('dsHoaDon');
  const modal = document.getElementById('chiTietModal');
  const ul = document.getElementById('dsSanPham');
  const tong = document.getElementById('tongTien');
  const btnXacNhan = document.getElementById('xacNhanBtn');

  // 🚚 Tải danh sách hóa đơn
  fetch('/api/hoadon')
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = '';
      data.forEach(hd => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${hd.MaHoaDon}</td>
          <td>${hd.NgayLap ? new Date(hd.NgayLap).toLocaleDateString() : ''}</td>
          <td>${hd.TenKhachHang || ''}</td>
          <td>${hd.SoDienThoai || hd.SDT || ''}</td>
          <td>${hd.TrangThai || ''}</td>
          <td><button class="xemBtn" data-id="${hd.MaHoaDon}">👁️ Xem</button></td>
          <td><button class="xoaBtn" data-id="${hd.MaHoaDon}" style="color:#e74c3c;background:#fff;border:1px solid #e74c3c;border-radius:4px;padding:2px 8px;cursor:pointer;">Xóa</button></td>
        `;
        row.querySelector('.xemBtn').addEventListener('click', () => xemChiTiet(hd.MaHoaDon));
        row.querySelector('.xoaBtn').addEventListener('click', () => xoaHoaDon(hd.MaHoaDon));
        tbody.appendChild(row);
  // Xóa hóa đơn
  function xoaHoaDon(maHD) {
    if (!confirm('Bạn có chắc muốn xóa hóa đơn này?')) return;
    fetch(`/api/hoadon/${maHD}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        alert(data.message || 'Đã xóa hóa đơn!');
        setTimeout(() => location.reload(), 500);
      })
      .catch(() => alert('Lỗi khi xóa hóa đơn!'));
  }
      });
    });

  // 👁️ Xem chi tiết hóa đơn
  function xemChiTiet(maHD) {
    fetch(`/api/hoadon/${maHD}`)
      .then(res => res.json())
      .then(data => {
        ul.innerHTML = '';
        let total = 0;
        // Hỗ trợ cả data.chiTiet hoặc data.ChiTiet
        const chiTiet = data.chiTiet || data.ChiTiet || [];
        chiTiet.forEach(sp => {
          const line = `${sp.TenSanPham} x ${sp.SoLuong} = ${(sp.DonGia * sp.SoLuong).toLocaleString()}₫`;
          ul.innerHTML += `<li>${line}</li>`;
          total += sp.SoLuong * sp.DonGia;
        });
        tong.textContent = `Tổng tiền: ${total.toLocaleString()}₫`;
        btnXacNhan.onclick = () => xacNhan(maHD);
        modal.classList.remove('hidden');
      });
  }

  // ✅ Xác nhận đơn
  function xacNhan(maHD) {
    fetch(`/api/hoadon/${maHD}/xacnhan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      alert('✅ Đã xác nhận đơn!');
      modal.classList.add('hidden');
      // Reload lại danh sách hóa đơn
      setTimeout(() => location.reload(), 500);
    });
  }

  // ❌ Đóng modal
  document.getElementById('dongModalBtn').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
});