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
  const profileSpan = document.querySelector('.profile span');
  if (profileSpan) profileSpan.textContent = currentUser;

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
