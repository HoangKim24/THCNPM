const DEFAULT_IMG = 'images/placeholder-product.png';

function getDanhMucFromUrl() {
  const p = new URLSearchParams(window.location.search);
  const ma = p.get('danhmuc');
  return ma ? parseInt(ma, 10) : null;
}

// Tải danh sách sản phẩm và danh mục
let allProducts = [];
let allCategories = [];

async function initProducts() {
  try {
    const [pResp, cResp] = await Promise.all([
      fetch('/api/sanpham'),
      fetch('/api/danhmuc')
    ]);
    allProducts = await pResp.json();
    allCategories = await cResp.json();

    // Điền danh mục vào filter
    const catFilter = document.getElementById('category-filter');
    allCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.MaDanhMuc;
      opt.textContent = cat.TenDanhMuc;
      catFilter.appendChild(opt);
    });

    // Check URL params
    const maDanhMuc = getDanhMucFromUrl();
    if (maDanhMuc) catFilter.value = maDanhMuc;

    renderProducts();

    // Gán sự kiện filter
    document.getElementById('search-input').addEventListener('input', renderProducts);
    document.getElementById('category-filter').addEventListener('change', renderProducts);
    document.getElementById('price-filter').addEventListener('change', renderProducts);

  } catch (err) {
    console.error('Lỗi khởi tạo:', err);
    document.getElementById('products-list').innerHTML = '<p>Không thể tải dữ liệu.</p>';
  }
}

function renderProducts() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const catId = document.getElementById('category-filter').value;
  const priceRange = document.getElementById('price-filter').value;

  let filtered = allProducts.filter(sp => {
    // Search
    const matchSearch = sp.TenSanPham.toLowerCase().includes(searchTerm);
    // Category
    const matchCat = catId === 'all' || sp.MaDanhMuc == catId;
    // Price
    let matchPrice = true;
    const price = typeof sp.DonGia === 'number' ? sp.DonGia : parseFloat(sp.DonGia) || 0;
    if (priceRange === '0-50000') matchPrice = price < 50000;
    else if (priceRange === '50000-100000') matchPrice = price >= 50000 && price <= 100000;
    else if (priceRange === '100000-above') matchPrice = price > 100000;

    return matchSearch && matchCat && matchPrice;
  });

  const list = document.getElementById('products-list');
  list.innerHTML = '';
  
  if (filtered.length === 0) {
    list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 50px; color: #666;">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>';
    return;
  }

  filtered.forEach(sp => {
    const imgSrc = sp.HinhAnh ? 'images/' + sp.HinhAnh : DEFAULT_IMG;
    const price = typeof sp.DonGia === 'number' ? sp.DonGia : parseFloat(sp.DonGia) || 0;
    list.innerHTML += `
      <div class="product-card">
        <a href="product-detail.html?id=${sp.MaSanPham}" class="product-card-link">
          <div class="product-card-img">
            <img src="${imgSrc}" alt="${(sp.TenSanPham || '').replace(/"/g, '&quot;')}" onerror="this.src='${DEFAULT_IMG}'">
          </div>
          <div class="product-card-info">
            <h3>${(sp.TenSanPham || '').replace(/</g, '&lt;')}</h3>
            <p class="product-card-price">${price.toLocaleString('vi-VN')}₫</p>
          </div>
        </a>
        <button class="btn btn-add-to-cart add-to-cart" data-id="${sp.MaSanPham}" data-name="${(sp.TenSanPham || '').replace(/"/g, '&quot;')}" data-price="${price}">
          Thêm vào giỏ <i class='bx bx-cart-alt'></i>
        </button>
      </div>
    `;
  });

  // Re-attach listeners
  attachCartEvents();
}

function attachCartEvents() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.onclick = () => {
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
      };
    });
}

initProducts();

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
