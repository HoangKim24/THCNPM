// Ảnh mặc định khi sản phẩm không có ảnh
const DEFAULT_IMG = 'images/HinhAnh-1752415674712-693980431.jpg';

function getDanhMucFromUrl() {
  const p = new URLSearchParams(window.location.search);
  const ma = p.get('danhmuc');
  return ma ? parseInt(ma, 10) : null;
}

// Tải danh sách sản phẩm từ server
fetch('/api/sanpham')
  .then(res => res.json())
  .then(data => {
    const maDanhMuc = getDanhMucFromUrl();
    let listSp = data;
    if (maDanhMuc) {
      listSp = data.filter(sp => sp.MaDanhMuc === maDanhMuc);
    }

    const list = document.getElementById('products-list');
    list.innerHTML = '';
    listSp.forEach(sp => {
      const imgSrc = sp.HinhAnh ? 'images/' + sp.HinhAnh : DEFAULT_IMG;
      const price = typeof sp.DonGia === 'number' ? sp.DonGia : parseFloat(sp.DonGia) || 0;
      list.innerHTML += `
        <div class="product-box">
          <a href="product-detail.html?id=${sp.MaSanPham}" class="product-box-link">
            <img src="${imgSrc}" alt="${(sp.TenSanPham || '').replace(/"/g, '&quot;')}" onerror="this.src='${DEFAULT_IMG}'">
            <div class="product-info">
              <h3>${(sp.TenSanPham || '').replace(/</g, '&lt;')}</h3>
              <p class="weight">${(sp.DonViTinh || '').replace(/</g, '&lt;')}</p>
              <p class="price">${price.toLocaleString('vi-VN')}₫</p>
            </div>
          </a>
          <button class="btn add-to-cart" data-id="${sp.MaSanPham}" data-name="${(sp.TenSanPham || '').replace(/"/g, '&quot;')}" data-price="${price}">
            Thêm vào giỏ <i class='bx bx-cart-alt'></i>
          </button>
        </div>
      `;
    });

    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        const existing = cart.find(sp => sp.MaSanPham === id);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({ MaSanPham: id, name, price, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        capNhatGioPublic();
        const panel = document.getElementById('cart-panel');
        if (panel) panel.classList.remove('hidden');
      });
    });
  })
  .catch(err => {
    console.error('Lỗi tải sản phẩm:', err);
    const list = document.getElementById('products-list');
    if (list) list.innerHTML = '<p>Không thể tải sản phẩm. Kiểm tra kết nối server/database.</p>';
  });

// Trang sản phẩm: nút "Thanh toán" chuyển sang cart.html (trang giỏ hàng có nút Thanh toán)

function capNhatGioPublic() {
  const ul = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!ul) return;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  ul.innerHTML = '';
  let tongTien = 0;

  cart.forEach(sp => {
    tongTien += sp.price * sp.quantity;
    ul.innerHTML += `
      <li>
        ${(sp.name || '').replace(/</g, '&lt;')} x ${sp.quantity}
        <button type="button" class="plus" data-name="${(sp.name || '').replace(/"/g, '&quot;')}">+</button>
        <button type="button" class="minus" data-name="${(sp.name || '').replace(/"/g, '&quot;')}">−</button>
      </li>
    `;
  });

  if (totalEl) totalEl.textContent = tongTien.toLocaleString('vi-VN') + '₫';

  document.querySelectorAll('.plus').forEach(btn => {
    btn.onclick = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const item = cart.find(sp => sp.name === btn.dataset.name);
      if (item) { item.quantity += 1; localStorage.setItem('cart', JSON.stringify(cart)); capNhatGioPublic(); }
    };
  });

  document.querySelectorAll('.minus').forEach(btn => {
    btn.onclick = () => {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const item = cart.find(sp => sp.name === btn.dataset.name);
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) cart = cart.filter(sp => sp.name !== btn.dataset.name);
        localStorage.setItem('cart', JSON.stringify(cart));
        capNhatGioPublic();
      }
    };
  });
}

const cartToggle = document.getElementById('cart-toggle');
if (cartToggle) {
  cartToggle.addEventListener('click', function(e) {
    e.preventDefault();
    const panel = document.getElementById('cart-panel');
    if (panel) panel.classList.toggle('hidden');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  capNhatGioPublic();
});
