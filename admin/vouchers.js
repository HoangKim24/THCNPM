document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('vouchers-list');
  const addModal = document.getElementById('addModal');
  const addForm = document.getElementById('addVoucherForm');

  // Load danh sách
  function loadVouchers() {
    fetch('/api/vouchers')
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = data.map(v => `
          <tr>
            <td style="font-weight: 700; color: #27ae60;">${v.Code}</td>
            <td>${v.GiamGia.toLocaleString()}₫</td>
            <td>${v.MoTa || ''}</td>
            <td>${v.NgayHetHan ? new Date(v.NgayHetHan).toLocaleDateString() : 'Không'}</td>
            <td>
              <button onclick="deleteVoucher(${v.MaVoucher})" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:1.2rem;" title="Xóa">
                <i class="bx bx-trash"></i>
              </button>
            </td>
          </tr>
        `).join('');
        if (data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">Chưa có voucher nào.</td></tr>';
        }
      });
  }

  // Xóa voucher
  window.deleteVoucher = (id) => {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return;
    fetch(`/api/vouchers/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        loadVouchers();
      });
  };

  // Mở/Đóng modal
  document.getElementById('openAddModal').onclick = () => addModal.classList.remove('hidden');
  document.getElementById('closeModal').onclick = () => addModal.classList.add('hidden');

  // Thêm voucher
  addForm.onsubmit = (e) => {
    e.preventDefault();
    const payload = {
      code: document.getElementById('v-code').value,
      giamGia: parseInt(document.getElementById('v-giam').value),
      moTa: document.getElementById('v-mota').value,
      ngayHetHan: document.getElementById('v-date').value
    };

    fetch('/api/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      addModal.classList.add('hidden');
      addForm.reset();
      loadVouchers();
    });
  };

  loadVouchers();
});
