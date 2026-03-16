/**
 * Script dùng chung cho user: lưu username từ login, hiển thị profile, giỏ hàng
 */
(function() {
  const params = new URLSearchParams(window.location.search);
  const userFromUrl = params.get('user');
  if (userFromUrl) {
    localStorage.setItem('currentUser', userFromUrl);
    // Xóa ?user= khỏi URL cho gọn (không reload lại trang)
    if (window.history.replaceState) {
      const url = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', url);
    }
  }

  const currentUser = localStorage.getItem('currentUser') || 'Khách';
  const profileSection = document.querySelector('.profile');
  const profileSpan = document.querySelector('.profile span');
  
  if (profileSpan) profileSpan.textContent = currentUser;

  // Logout function
  function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }

  // Create Dropdown if logged in
  if (currentUser !== 'Khách' && profileSection) {
    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown hidden';
    dropdown.innerHTML = `
      <a href="profile.html"><i class="bx bx-user"></i> Thông tin cá nhân</a>
      <a href="#" id="logout-btn"><i class="bx bx-log-out"></i> Đăng xuất</a>
    `;
    profileSection.appendChild(dropdown);
    profileSection.style.cursor = 'pointer';

    profileSection.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });

    document.addEventListener('click', () => {
      dropdown.classList.add('hidden');
    });
  } else if (profileSection) {
    profileSection.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  // Giỏ hàng: toggle panel trên mọi trang có cart-toggle
  const cartToggle = document.getElementById('cart-toggle');
  const cartPanel = document.getElementById('cart-panel');
  if (cartToggle && cartPanel) {
    cartToggle.addEventListener('click', function(e) {
      e.preventDefault();
      cartPanel.classList.toggle('hidden');
      if (typeof window.renderCart === 'function') window.renderCart();
      if (typeof window.capNhatGioPublic === 'function') window.capNhatGioPublic();
    });
  }
})();
