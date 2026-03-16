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
          <td>
            <span class="status-badge" style="padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; background: ${getStatusColor(hd.TrangThai)}; color: #fff;">
              ${hd.TrangThai || 'Chờ xác nhận'}
            </span>
          </td>
          <td><button class="xemBtn" data-id="${hd.MaHoaDon}">👁️ Xem</button></td>
          <td><button class="xoaBtn" data-id="${hd.MaHoaDon}" style="color:#e74c3c;background:#fdf2f2;border:none;border-radius:4px;padding:6px 12px;cursor:pointer;">Xóa</button></td>
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
        
        // Cập nhật footer modal để chọn trạng thái
        const modalFooter = document.querySelector('.modal-footer') || document.createElement('div');
        modalFooter.className = 'modal-footer';
        modalFooter.style.marginTop = '20px';
        modalFooter.style.display = 'flex';
        modalFooter.style.gap = '10px';
        modalFooter.style.justifyContent = 'flex-end';
        
        modalFooter.innerHTML = `
          <select id="updateStatusSelect" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
            <option value="Chờ xác nhận" ${data.TrangThai==='Chờ xác nhận'?'selected':''}>Chờ xác nhận</option>
            <option value="Đã xác nhận" ${data.TrangThai==='Đã xác nhận'?'selected':''}>Đã xác nhận</option>
            <option value="Đang giao" ${data.TrangThai==='Đang giao'?'selected':''}>Đang giao</option>
            <option value="Hoàn thành" ${data.TrangThai==='Hoàn thành'?'selected':''}>Hoàn thành</option>
            <option value="Đã hủy" ${data.TrangThai==='Đã hủy'?'selected':''}>Đã hủy</option>
          </select>
          <button id="saveStatusBtn" class="btn btn-primary" style="background:#27ae60; color:#fff; padding: 10px 20px; border:none; border-radius:8px; cursor:pointer;">Lưu thay đổi</button>
        `;

        const existingFooter = modal.querySelector('.modal-footer');
        if (!existingFooter) {
            modal.querySelector('.modal-content').appendChild(modalFooter);
        }

        document.getElementById('saveStatusBtn').onclick = () => updateStatus(maHD);
        modal.classList.remove('hidden');
      });
  }

  function getStatusColor(status) {
    switch(status) {
      case 'Hoàn thành': return '#27ae60';
      case 'Đang giao': return '#3498db';
      case 'Đã xác nhận': return '#f1c40f';
      case 'Đã hủy': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  // Cập nhật trạng thái
  function updateStatus(maHD) {
    const newStatus = document.getElementById('updateStatusSelect').value;
    fetch(`/api/hoadon/${maHD}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trangThai: newStatus })
    })
    .then(res => res.json())
    .then(data => {
      alert('✅ Đã cập nhật trạng thái đơn hàng!');
      modal.classList.add('hidden');
      location.reload();
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