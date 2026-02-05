document.addEventListener('DOMContentLoaded', () => {
  const inputMaDanhMuc = document.getElementById('MaDanhMuc');
  const btnSubmit = document.getElementById('btnSubmitDM');
  const btnHuy = document.getElementById('btnHuyDM');
  taiDanhMuc(); // 🔄 Load danh mục lúc mở trang

  const form = document.getElementById('formThemDanhMuc');
  const input = document.getElementById('TenDanhMuc');
  const inputHinhAnh = document.getElementById('HinhAnhDanhMuc');
  const previewHinhAnh = document.getElementById('previewHinhAnhDanhMuc');
  const thongBao = document.getElementById('thongBao');

  inputHinhAnh.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      previewHinhAnh.style.display = 'block';
      const reader = new FileReader();
      reader.onload = function(e) {
        previewHinhAnh.src = e.target.result;
      };
      reader.readAsDataURL(this.files[0]);
    } else {
      previewHinhAnh.style.display = 'none';
      previewHinhAnh.src = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ten = input.value.trim();
    if (!ten) return;
    const maDM = inputMaDanhMuc.value;
    const formData = new FormData(form);
    let url = '/api/danhmuc';
    let method = 'POST';
    if (maDM) {
      url = `/api/danhmuc/${maDM}`;
      method = 'PUT';
    }
    try {
      const res = await fetch(url, {
        method,
        body: formData
      });
      if (!res.ok) throw new Error('Thêm/cập nhật thất bại');
      const result = await res.json();
      thongBao.textContent = result.message || (maDM ? '✅ Đã cập nhật danh mục!' : '✅ Đã thêm danh mục!');
      thongBao.style.color = 'green';
      thongBao.style.display = 'block';
      form.reset();
      previewHinhAnh.style.display = 'none';
      previewHinhAnh.src = '';
      btnSubmit.textContent = 'Thêm';
      btnHuy.style.display = 'none';
      inputMaDanhMuc.value = '';
      taiDanhMuc();
      setTimeout(() => thongBao.style.display = 'none', 3000);
    } catch (err) {
      console.error('❌ Lỗi thêm/cập nhật:', err);
      thongBao.textContent = '❌ Lỗi khi thêm/cập nhật danh mục!';
      thongBao.style.color = 'red';
      thongBao.style.display = 'block';
    }
  });
});

async function taiDanhMuc() {
  try {
    const res = await fetch('/api/danhmuc');
    const data = await res.json();

    const tbody = document.getElementById('bangDanhMuc');
    tbody.innerHTML = '';

    data.forEach(dm => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${dm.MaDanhMuc}</td>
        <td>${dm.TenDanhMuc}</td>
        <td>
          <button class="btn-sua" data-id="${dm.MaDanhMuc}">✏️ Sửa</button>
          <button class="btn-xoa" data-id="${dm.MaDanhMuc}">🗑️ Xóa</button>
        </td>
      `;
      tbody.appendChild(row);

      // Sửa: điền dữ liệu lên form
      row.querySelector('.btn-sua').addEventListener('click', () => {
        document.getElementById('MaDanhMuc').value = dm.MaDanhMuc;
        document.getElementById('TenDanhMuc').value = dm.TenDanhMuc;
        btnSubmit.textContent = 'Cập nhật';
        document.getElementById('btnHuyDM').style.display = 'inline-block';
        inputHinhAnh.value = '';
        previewHinhAnh.style.display = 'none';
        previewHinhAnh.src = '';
      });
  // Nút hủy cập nhật
  document.getElementById('btnHuyDM').onclick = () => {
    form.reset();
    previewHinhAnh.style.display = 'none';
    previewHinhAnh.src = '';
    btnSubmit.textContent = 'Thêm';
    btnHuy.style.display = 'none';
    inputMaDanhMuc.value = '';
  };

      row.querySelector('.btn-xoa').addEventListener('click', async () => {
        const id = dm.MaDanhMuc;
        if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

        try {
          const res = await fetch(`/api/danhmuc/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Xóa thất bại');
          const result = await res.json();
          thongBao.textContent = result.message || '✅ Đã xóa!';
          thongBao.style.color = 'green';
          thongBao.style.display = 'block';
          setTimeout(() => thongBao.style.display = 'none', 3000);
          taiDanhMuc();
        } catch (err) {
          console.error('❌ Lỗi khi xóa:', err);
          thongBao.textContent = '❌ Lỗi khi xóa danh mục!';
          thongBao.style.color = 'red';
          thongBao.style.display = 'block';
          setTimeout(() => thongBao.style.display = 'none', 3000);
        }
      });
    });
  } catch (err) {
    console.error('❌ Lỗi khi tải danh mục:', err);
  }
}