// 🗂️ Hiển thị danh mục ở public/categories.html
fetch('/api/danhmuc')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('categories-list');
    list.innerHTML = '';
    data.forEach(dm => {
      list.innerHTML += `
        <div class="category-box">
          <img src="images/${dm.HinhAnh ? dm.HinhAnh : 'placeholder-category.png'}" alt="${dm.TenDanhMuc}" class="category-img">
          <div class="category-info">
            <h3>${dm.TenDanhMuc}</h3>
          </div>
        </div>
      `;
    });
  });
