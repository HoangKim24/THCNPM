document.addEventListener('DOMContentLoaded', () => {

  const cartToggle = document.getElementById('cart-toggle');
  const cartPanel = document.getElementById('cart-panel');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');

  if (!cartToggle || !cartPanel) return;

  function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  function renderCart() {
    const cart = getCart();
    cartItemsEl.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<li>Giỏ hàng trống.</li>';
    } else {
      cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        cartItemsEl.innerHTML += `<li>${item.name} x${item.quantity} - ${subtotal.toLocaleString()}₫</li>`;
      });
    }
    cartTotalEl.textContent = total.toLocaleString() + '₫';
  }

  if (cartToggle) {
    cartToggle.addEventListener('click', (e) => {
      e.preventDefault();
      cartPanel.classList.toggle('hidden');
      renderCart();
    });
  }

  window.renderCart = renderCart;
  renderCart();
});
