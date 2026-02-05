document.addEventListener('DOMContentLoaded', () => {
  // Thêm biến toàn cục cho form, input ảnh, preview ảnh
  window.form = document.getElementById('formThem');
  window.inputHinhAnh = document.getElementById('inputHinhAnh');
  window.previewHinhAnh = document.getElementById('previewHinhAnh');

  taiSanPham(); // ⏫ Load bảng khi trang mở

  // 🎯 Xử lý form thêm sản phẩm (có ảnh)
  const form = document.getElementById('formThem');
  const inputHinhAnh = document.getElementById('inputHinhAnh');
  const previewHinhAnh = document.getElementById('previewHinhAnh');

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const maSP = form.inputMaSanPham.value;
    const formData = new FormData(form);
    let url = '/api/sanpham';
    let method = 'POST';
    if (maSP) {
      url = `/api/sanpham/${maSP}`;
      method = 'PUT';
    }
    fetch(url, {
      method,
      body: formData
    })
      .then(res => res.json())
      .then(result => {
        const thongBao = document.getElementById('ketQuaThem');
        thongBao.textContent = result.message || (maSP ? '✅ Đã cập nhật sản phẩm!' : '✅ Đã thêm sản phẩm!');
        thongBao.style.display = 'block';
        form.reset();
        previewHinhAnh.style.display = 'none';
        previewHinhAnh.src = '';
        document.getElementById('btnSubmit').textContent = 'Thêm';
        document.getElementById('btnHuy').style.display = 'none';
        taiSanPham(); // ⬅️ Load bảng lại sau khi thêm/cập nhật
        setTimeout(() => {
          thongBao.style.display = 'none';
        }, 3000);
      })
      .catch(err => {
        console.error('❌ Lỗi thêm/cập nhật:', err);
        const thongBao = document.getElementById('ketQuaThem');
        thongBao.textContent = '❌ Lỗi khi thêm/cập nhật sản phẩm!';
        thongBao.style.display = 'block';
        thongBao.style.color = 'red';
      });
  });
});

// 🔁 Hàm tải lại danh sách sản phẩm
function taiSanPham() {
  fetch('/api/sanpham')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('dssp');
      tbody.innerHTML = '';

      data.forEach(sp => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${sp.MaSanPham}</td>
          <td>
            ${sp.HinhAnh ? `<img src="/images/${sp.HinhAnh}" alt="Ảnh" style="max-width:50px;max-height:50px;vertical-align:middle;"> ` : ''}
            ${sp.TenSanPham}
          </td>
          <td>${sp.DonGia.toLocaleString()} đ</td>
          <td>${sp.DonViTinh}</td>
          <td>${sp.MaDanhMuc}</td>
          <td>
            <button class="btn-sua" data-id="${sp.MaSanPham}">✏️ Sửa</button>
            <button class="btn-xoa" data-id="${sp.MaSanPham}">🗑️ Xóa</button>
          </td>
        `;
        tbody.appendChild(row);

        // 🎯 Gắn sự kiện sửa
        row.querySelector('.btn-sua').addEventListener('click', () => {
          // Điền dữ liệu vào form
          document.getElementById('inputMaSanPham').value = sp.MaSanPham;
          form.TenSanPham.value = sp.TenSanPham;
          form.DonGia.value = sp.DonGia;
          form.DonViTinh.value = sp.DonViTinh;
          form.MaDanhMuc.value = sp.MaDanhMuc;
          document.getElementById('btnSubmit').textContent = 'Cập nhật';
          document.getElementById('btnHuy').style.display = 'inline-block';
          // Ẩn preview ảnh cũ, reset input file
          previewHinhAnh.style.display = 'none';
          previewHinhAnh.src = '';
          inputHinhAnh.value = '';
        });

        // 🎯 Gắn sự kiện xóa sau khi render
        row.querySelector('.btn-xoa').addEventListener('click', () => {
          fetch(`/api/sanpham/${sp.MaSanPham}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(result => {
              console.log(result.message);
              taiSanPham(); // ⬅️ Load bảng lại sau khi xóa
            })
            .catch(err => console.error('❌ Lỗi khi xóa:', err));
        });
      });
  // Nút hủy cập nhật
  document.getElementById('btnHuy').onclick = () => {
    form.reset();
    previewHinhAnh.style.display = 'none';
    previewHinhAnh.src = '';
    document.getElementById('btnSubmit').textContent = 'Thêm';
    document.getElementById('btnHuy').style.display = 'none';
  };
    })
    .catch(err => {
      console.error('❌ Lỗi khi tải sản phẩm:', err);
    });
}