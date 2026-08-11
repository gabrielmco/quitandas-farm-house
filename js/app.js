/* ============================================
   QUITANDAS FARM HOUSE - MAIN APP
   Routing, event binding, initialization
   ============================================ */

import '../css/variables.css';
import '../css/animations.css';
import '../css/components.css';
import '../css/admin.css';
import '../css/responsive.css';

import { STORE_CONFIG, PRODUCTS, ADDONS, ORDER_STATUSES, PAYMENT_METHODS, CATEGORIES } from './data.js';
import { store, KEYS } from './store.js';
import { pingSupabase, autoPingSupabaseIfOlderThan24h } from './supabaseClient.js';
import {
  renderHeader, renderHeroBanner, renderSearchBar, renderCategoryTabs,
  renderProductSections, renderProductModal, renderCartDrawer, renderCartFab,
  renderLoginScreen, renderLoginOptionsScreen, renderCheckoutScreen, renderOrderStatusScreen,
  renderMyOrdersScreen, renderAdminLogin, renderAdminPanel,
  initScrollAnimations, showToast, formatPrice
} from './ui.js';

// ── State ──

let currentScreen = 'home';
let currentAdminTab = 'orders';
let selectedProduct = null;
let modalQty = 1;
let modalSelectedSize = null;
let modalSelectedAddons = [];
let selectedDelivery = 'delivery';
let selectedPayment = PAYMENT_METHODS[0];
let notificationSound = null;
let deferredPrompt = null;

// ── Notification Sound ──

function playNotificationSound() {
  try {
    if (!notificationSound) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      notificationSound = ctx;
    }
    const ctx = notificationSound;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Silent fail
  }
}

// ── Router ──

function navigate(screen, params = {}) {
  currentScreen = screen;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update hash for bookmarking
  if (screen === 'home') window.location.hash = '';
  else if (screen === 'order' && params.code) window.location.hash = `#/pedido/${params.code}`;
  else if (screen === 'admin') window.location.hash = '#/admin';
  else if (screen === 'login') window.location.hash = '#/login';
  else if (screen === 'checkout') window.location.hash = '#/checkout';
  else if (screen === 'my-orders') window.location.hash = '#/meus-pedidos';
}

function handleHashRoute() {
  const hash = window.location.hash;
  if (hash.startsWith('#/pedido/')) {
    const code = hash.replace('#/pedido/', '');
    currentScreen = 'order';
    render({ code });
  } else if (hash === '#/admin') {
    currentScreen = 'admin';
    render();
  } else if (hash === '#/login') {
    currentScreen = 'login';
    render();
  } else if (hash === '#/checkout') {
    currentScreen = 'checkout';
    render();
  } else if (hash === '#/meus-pedidos') {
    currentScreen = 'my-orders';
    render();
  } else {
    currentScreen = 'home';
    render();
  }
}

// ── Main Render ──

function render(params = {}) {
  const app = document.getElementById('app');

  let content = '';
  let showHeader = true;
  let showFab = false;

  switch (currentScreen) {
    case 'home':
      showFab = true;
      content = `
        ${renderHeader()}
        ${renderHeroBanner()}
        ${renderSearchBar()}
        ${renderCategoryTabs()}
        <main id="app-main">${renderProductSections()}</main>
        ${renderCartDrawer()}
        ${renderCartFab()}
      `;
      break;

    case 'login':
      showHeader = false;
      content = renderLoginScreen(params.returnTo || 'checkout');
      break;

    case 'login-options':
      showHeader = false;
      content = renderLoginOptionsScreen();
      break;

    case 'checkout':
      content = `
        ${renderHeader()}
        <main id="app-main">${renderCheckoutScreen()}</main>
      `;
      break;

    case 'order':
      const code = params.code || window.location.hash.replace('#/pedido/', '');
      content = `
        ${renderHeader()}
        <main id="app-main">${renderOrderStatusScreen(code)}</main>
      `;
      break;

    case 'my-orders':
      content = `
        ${renderHeader()}
        <main id="app-main">${renderMyOrdersScreen()}</main>
      `;
      break;

    case 'admin':
      if (!store.isAdminLoggedIn()) {
        showHeader = false;
        content = renderAdminLogin();
      } else {
        content = `
          ${renderHeader()}
          <main id="app-main">${renderAdminPanel(currentAdminTab)}</main>
        `;
      }
      break;
  }

  app.innerHTML = content;

  // Initialize animations
  requestAnimationFrame(() => {
    initScrollAnimations();
    bindEvents();
    
    if (window.anime && document.querySelectorAll('.product-card').length > 0) {
      anime({
        targets: '.product-card',
        translateY: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        easing: 'spring(1, 80, 10, 0)',
        duration: 800
      });
    }
  });
}

// ── Event Binding ──

function bindEvents() {
  // ── Header ──
  const btnHome = document.getElementById('btn-home');
  if (btnHome) btnHome.addEventListener('click', () => navigate('home'));

  const btnSearch = document.getElementById('btn-search');
  if (btnSearch) btnSearch.addEventListener('click', toggleSearch);

  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) btnLogin.addEventListener('click', () => navigate('login', { returnTo: 'home' }));

  const btnUser = document.getElementById('btn-user');
  if (btnUser) btnUser.addEventListener('click', () => navigate('my-orders'));

  const btnAdminLink = document.getElementById('btn-admin-link');
  if (btnAdminLink) btnAdminLink.addEventListener('click', () => navigate('admin'));

  // ── Search ──
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const main = document.getElementById('app-main');
        if (main) {
          main.innerHTML = renderProductSections(e.target.value);
          initScrollAnimations();
          bindProductCardEvents();
          if (window.anime) {
            anime({
              targets: '.product-card',
              translateY: [50, 0],
              opacity: [0, 1],
              delay: anime.stagger(100),
              easing: 'spring(1, 80, 10, 0)',
              duration: 800
            });
          }
        }
      }, 300);
    });
  }

  // ── Category Tabs & Scroll Spy ──
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const catId = tab.dataset.category;
      const section = document.getElementById(`cat-${catId}`);
      if (section) {
        const yOffset = -120;
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  initScrollSpy();

  // ── Product Cards ──
  bindProductCardEvents();

  // ── Cart ──
  bindCartEvents();

  // ── Login ──
  bindLoginEvents();

  // ── Checkout ──
  bindCheckoutEvents();

  // ── Order Status ──
  const btnBackHome = document.getElementById('btn-back-home');
  if (btnBackHome) btnBackHome.addEventListener('click', () => navigate('home'));

  // ── Order cards click ──
  document.querySelectorAll('.order-card').forEach(card => {
    card.addEventListener('click', () => {
      navigate('order', { code: card.dataset.orderCode });
    });
  });

  // ── Admin ──
  bindAdminEvents();
}

// ── Search Toggle ──

function toggleSearch() {
  const bar = document.getElementById('search-bar');
  if (bar) {
    const isVisible = bar.style.display !== 'none';
    bar.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      const input = document.getElementById('search-input');
      if (input) input.focus();
    }
  }
}

// ── Product Card Events ──

function bindProductCardEvents() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.product-card__add-btn')) {
        e.stopPropagation();
      }
      openProductModal(card.dataset.productId);
    });
  });
}

function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || !store.isProductAvailable(product)) return;

  store.trackVisitorAction('view_product', { productName: product.name });

  selectedProduct = product;
  modalQty = 1;
  modalSelectedSize = product.hasSize ? product.sizes[0] : null;
  modalSelectedAddons = [];

  const modalContainer = document.createElement('div');
  modalContainer.id = 'modal-container';
  modalContainer.innerHTML = renderProductModal(product);
  document.body.appendChild(modalContainer);
  document.body.classList.add('modal-open');

  if (window.anime) {
    anime({
      targets: '.modal__content',
      translateY: ['100%', 0],
      opacity: [0, 1],
      easing: 'spring(1, 80, 10, 0)',
      duration: 800
    });
  }

  bindModalEvents();
  updateModalPrice();
}

function bindModalEvents() {
  // Close modal on overlay click
  const overlay = document.getElementById('product-modal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeProductModal();
    });
  }

  // Size selection
  document.querySelectorAll('#modal-container .option-item[data-size-id]').forEach(item => {
    item.addEventListener('click', () => {
      const sizeId = item.dataset.sizeId;
      modalSelectedSize = selectedProduct.sizes.find(s => s.id === sizeId);
      // Update radio UI
      document.querySelectorAll('#modal-container .custom-radio').forEach(r => r.classList.remove('checked'));
      item.querySelector('.custom-radio')?.classList.add('checked');
      updateModalPrice();
    });
  });

  // Addon selection
  document.querySelectorAll('#modal-container .option-item[data-addon-id]').forEach(item => {
    item.addEventListener('click', () => {
      const addonId = item.dataset.addonId;
      const checkbox = item.querySelector('.custom-checkbox');
      const addon = ADDONS.find(a => a.id === addonId);

      if (checkbox.classList.contains('checked')) {
        checkbox.classList.remove('checked');
        modalSelectedAddons = modalSelectedAddons.filter(a => a.id !== addonId);
      } else {
        checkbox.classList.add('checked');
        modalSelectedAddons.push(addon);
      }
      updateModalPrice();
    });
  });

  // Quantity
  const qtyMinus = document.getElementById('modal-qty-minus');
  const qtyPlus = document.getElementById('modal-qty-plus');
  if (qtyMinus) qtyMinus.addEventListener('click', () => {
    modalQty = Math.max(1, modalQty - 1);
    document.getElementById('modal-qty').textContent = modalQty;
    updateModalPrice();
  });
  if (qtyPlus) qtyPlus.addEventListener('click', () => {
    modalQty++;
    document.getElementById('modal-qty').textContent = modalQty;
    updateModalPrice();
  });

  // Add to cart
  const addBtn = document.getElementById('modal-add-btn');
  if (addBtn) addBtn.addEventListener('click', addToCartFromModal);
}

function updateModalPrice() {
  const basePrice = modalSelectedSize ? modalSelectedSize.price : selectedProduct.price;
  const addonsPrice = modalSelectedAddons.reduce((s, a) => s + a.price, 0);
  const total = (basePrice + addonsPrice) * modalQty;

  const priceEl = document.getElementById('modal-price');
  if (priceEl) priceEl.textContent = formatPrice(basePrice);

  const btnEl = document.getElementById('modal-add-btn');
  if (btnEl) btnEl.textContent = `Adicionar ${formatPrice(total)}`;
}

function addToCartFromModal() {
  const obs = document.getElementById('modal-obs')?.value || '';

  const cartItem = {
    id: selectedProduct.id,
    name: selectedProduct.name,
    image: selectedProduct.image,
    price: selectedProduct.price,
    quantity: modalQty,
    selectedSize: modalSelectedSize,
    selectedAddons: [...modalSelectedAddons],
    observations: obs,
  };

  store.addToCart(cartItem);
  store.trackVisitorAction('update_cart', { cartCount: store.getCartCount(), cartTotal: store.getCartSubtotal() });
  showToast(`${selectedProduct.name} adicionado à sacola!`);
  closeProductModal();

  // Update FAB
  updateCartFab();
}

function closeProductModal() {
  const container = document.getElementById('modal-container');
  if (container) {
    container.querySelector('.modal-overlay')?.classList.remove('active');
    setTimeout(() => container.remove(), 300);
  }
  document.body.classList.remove('modal-open');
  selectedProduct = null;
}

// ── Cart Events ──

function bindCartEvents() {
  const cartFab = document.getElementById('cart-fab');
  if (cartFab) cartFab.addEventListener('click', openCart);

  const cartClose = document.getElementById('cart-close');
  if (cartClose) cartClose.addEventListener('click', closeCart);

  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Delivery calculation info
  const btnCalcDelivery = document.getElementById('btn-calc-delivery');
  if (btnCalcDelivery) {
    btnCalcDelivery.addEventListener('click', () => {
      showToast(`Taxa fixa de entrega: ${formatPrice(STORE_CONFIG.deliveryFee)} (Lima Duarte - MG)`, 'info');
    });
  }

  // Coupon toggle
  const couponToggle = document.getElementById('btn-coupon-toggle');
  const couponBox = document.getElementById('coupon-box');
  const couponArrow = document.getElementById('coupon-arrow');
  if (couponToggle && couponBox) {
    couponToggle.addEventListener('click', () => {
      const isHidden = couponBox.style.display === 'none';
      couponBox.style.display = isHidden ? 'flex' : 'none';
      if (couponArrow) couponArrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // Apply coupon
  const btnApplyCoupon = document.getElementById('btn-apply-coupon-code');
  if (btnApplyCoupon) {
    btnApplyCoupon.addEventListener('click', () => {
      const codeInput = document.getElementById('coupon-input-code');
      const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
      if (!code) {
        showToast('Digite um código de cupom', 'warning');
        return;
      }
      const coupon = (COUPONS || []).find(c => c.code === code);
      if (coupon) {
        showToast(`Cupom ${coupon.code} aplicado! ${coupon.label}`, 'success');
      } else {
        showToast('Cupom inválido ou expirado', 'error');
      }
    });
  }

  // Cart item quantity controls
  document.querySelectorAll('.cart-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.key;
      const cart = store.getCart();
      const item = cart.find(i => i.cartKey === key);
      if (item && item.quantity > 1) {
        store.updateCartItemQty(key, item.quantity - 1);
      } else {
        store.removeFromCart(key);
      }
      refreshCart();
    });
  });

  document.querySelectorAll('.cart-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.key;
      const cart = store.getCart();
      const item = cart.find(i => i.cartKey === key);
      if (item) {
        store.updateCartItemQty(key, item.quantity + 1);
      }
      refreshCart();
    });
  });

  // Remove buttons (.cart-item-remove and .cart-item__remove)
  document.querySelectorAll('.cart-item-remove, .cart-item__remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      store.removeFromCart(btn.dataset.key);
      refreshCart();
      showToast('Item removido da sacola', 'info');
    });
  });

  // Checkout button
  const btnCheckout = document.getElementById('btn-checkout');
  if (btnCheckout) btnCheckout.addEventListener('click', () => {
    closeCart();
    if (!store.getUser()) {
      navigate('login-options');
    } else {
      navigate('checkout');
    }
  });
}

function openCart() {
  refreshCartContent();
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.classList.add('drawer-open');
  bindCartEvents();
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('drawer-open');
}

function refreshCart() {
  refreshCartContent();
  updateCartFab();
  bindCartEvents();
}

function refreshCartContent() {
  const drawerWrapper = document.getElementById('cart-drawer')?.parentElement;
  if (!drawerWrapper) return;

  const isOpen = document.getElementById('cart-drawer')?.classList.contains('open');

  const cartHTML = renderCartDrawer();
  const temp = document.createElement('div');
  temp.innerHTML = cartHTML;

  const oldOverlay = document.getElementById('cart-overlay');
  const oldDrawer = document.getElementById('cart-drawer');
  if (oldOverlay) oldOverlay.replaceWith(temp.querySelector('.cart-overlay'));
  if (oldDrawer) oldDrawer.replaceWith(temp.querySelector('.cart-drawer'));

  if (isOpen) {
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('active');
  }
}

function updateCartFab() {
  const oldFab = document.getElementById('cart-fab');
  if (oldFab) {
    const temp = document.createElement('div');
    temp.innerHTML = renderCartFab();
    const newFab = temp.firstElementChild;
    oldFab.replaceWith(newFab);
    newFab.addEventListener('click', openCart);
  }
}

// ── Login Events ──

function bindLoginEvents() {
  // Login Options (Screen)
  const optGoogle = document.getElementById('btn-opt-google');
  if (optGoogle) {
    optGoogle.addEventListener('click', () => {
      const user = {
        id: 'google_' + Date.now(),
        name: 'Cliente Google',
        email: 'cliente@gmail.com',
        phone: '',
        address: '',
        reference: '',
        loginMethod: 'google',
      };
      store.setUser(user);
      showToast('Logado com conta Google!', 'success');
      navigate('checkout');
    });
  }

  const optSite = document.getElementById('btn-opt-site');
  if (optSite) {
    optSite.addEventListener('click', () => {
      navigate('login', { returnTo: 'checkout' });
    });
  }

  const optGuest = document.getElementById('btn-opt-guest');
  if (optGuest) {
    optGuest.addEventListener('click', () => {
      const guestUser = {
        id: 'guest_' + Date.now(),
        name: '',
        phone: '',
        address: '',
        reference: '',
        isGuest: true,
      };
      store.setUser(guestUser);
      showToast('Modo rápido (sem cadastro) ativado!', 'info');
      navigate('checkout');
    });
  }

  const backCart = document.getElementById('btn-back-cart');
  if (backCart) {
    backCart.addEventListener('click', () => {
      navigate('home');
      setTimeout(openCart, 100);
    });
  }

  // Google login in full login screen
  const googleBtn = document.getElementById('btn-google-login');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      const user = {
        id: 'google_' + Date.now(),
        name: 'Cliente Google',
        email: 'cliente@gmail.com',
        phone: '',
        address: '',
        reference: '',
        loginMethod: 'google',
      };
      store.setUser(user);
      showToast('Bem-vindo(a)! Complete seus dados abaixo.', 'success');

      const nameInput = document.getElementById('login-name');
      if (nameInput) nameInput.value = user.name;
    });
  }

  // Manual login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('login-name').value.trim();
      const phone = document.getElementById('login-phone').value.trim();
      const address = document.getElementById('login-address').value.trim();
      const reference = document.getElementById('login-reference')?.value.trim() || '';

      if (!name || !phone || !address) {
        showToast('Preencha nome, WhatsApp e endereço', 'error');
        return;
      }

      const user = {
        id: 'user_' + Date.now(),
        name,
        phone: phone.replace(/\D/g, ''),
        address,
        reference,
        loginMethod: 'manual',
      };
      store.setUser(user);
      showToast(`Olá, ${name}!`, 'success');

      const returnTo = document.getElementById('login-return-to')?.value || 'home';
      navigate(returnTo === 'checkout' ? 'checkout' : 'home');
    });
  }
}

// ── Checkout Events ──

function bindCheckoutEvents() {
  // Delivery options
  document.querySelectorAll('.delivery-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.delivery-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedDelivery = opt.dataset.delivery;

      const addressSection = document.getElementById('delivery-address-section');
      const feeEl = document.getElementById('delivery-fee-value');
      const totalEl = document.getElementById('checkout-total');
      const subtotal = store.getCartSubtotal();

      if (selectedDelivery === 'pickup') {
        if (addressSection) addressSection.style.display = 'none';
        if (feeEl) feeEl.textContent = 'Grátis';
        if (totalEl) totalEl.textContent = formatPrice(subtotal);
      } else {
        if (addressSection) addressSection.style.display = 'block';
        if (feeEl) feeEl.textContent = formatPrice(STORE_CONFIG.deliveryFee);
        if (totalEl) totalEl.textContent = formatPrice(subtotal + STORE_CONFIG.deliveryFee);
      }
    });
  });

  // Payment options
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => {
        o.classList.remove('selected');
        o.querySelector('.custom-radio')?.classList.remove('checked');
      });
      opt.classList.add('selected');
      opt.querySelector('.custom-radio')?.classList.add('checked');

      const paymentId = opt.dataset.paymentId;
      selectedPayment = PAYMENT_METHODS.find(p => p.id === paymentId);

      const changeSection = document.getElementById('change-section');
      if (changeSection) {
        changeSection.style.display = paymentId === 'dinheiro' ? 'block' : 'none';
      }

      const pixSection = document.getElementById('pix-copia-section');
      if (pixSection) {
        pixSection.style.display = paymentId === 'pix-copia' ? 'block' : 'none';
      }
    });
  });

  // Pix Copy Button
  const btnCopyPix = document.getElementById('btn-copy-pix');
  if (btnCopyPix) {
    btnCopyPix.addEventListener('click', () => {
      const pixKey = '32984185335';
      navigator.clipboard.writeText(pixKey).then(() => {
        showToast('Chave Pix copiada com sucesso!', 'success');
        btnCopyPix.textContent = '✓ Copiado!';
        setTimeout(() => { btnCopyPix.textContent = 'Copiar Chave Pix'; }, 3000);
      }).catch(() => {
        showToast('Chave Pix: 32984185335', 'info');
      });
    });
  }

  // Coupon Application
  const btnApplyCoupon = document.getElementById('btn-apply-coupon');
  if (btnApplyCoupon) {
    btnApplyCoupon.addEventListener('click', () => {
      const input = document.getElementById('checkout-coupon-input');
      const code = input?.value.trim().toUpperCase();
      const msgEl = document.getElementById('coupon-message');
      const discountRow = document.getElementById('coupon-discount-row');
      const discountVal = document.getElementById('coupon-discount-val');
      const totalEl = document.getElementById('checkout-total');

      const found = COUPONS.find(c => c.code === code);
      if (found) {
        const subtotal = store.getCartSubtotal();
        const deliveryFee = selectedDelivery === 'pickup' ? 0 : STORE_CONFIG.deliveryFee;
        let discount = found.type === 'percent' ? (subtotal * (found.value / 100)) : found.value;
        discount = Math.min(discount, subtotal);
        const newTotal = subtotal - discount + deliveryFee;

        if (discountRow) discountRow.style.display = 'flex';
        if (discountVal) discountVal.textContent = `- ${formatPrice(discount)}`;
        if (totalEl) totalEl.textContent = formatPrice(newTotal);
        if (msgEl) {
          msgEl.style.color = 'var(--color-status-done-txt)';
          msgEl.textContent = `✓ Cupom ${found.code} aplicado com sucesso!`;
        }
        showToast(`Cupom ${found.code} aplicado!`, 'success');
      } else {
        if (msgEl) {
          msgEl.style.color = 'var(--color-accent)';
          msgEl.textContent = 'Cupom inválido ou expirado';
        }
        showToast('Cupom inválido', 'error');
      }
    });
  }

  // Place order
  const btnPlaceOrder = document.getElementById('btn-place-order');
  if (btnPlaceOrder) {
    btnPlaceOrder.addEventListener('click', placeOrder);
  }
}

function placeOrder() {
  const user = store.getUser();
  const cart = store.getCart();
  if (!user || cart.length === 0) return;

  const subtotal = store.getCartSubtotal();
  const deliveryFee = selectedDelivery === 'pickup' ? 0 : STORE_CONFIG.deliveryFee;
  
  let discountVal = 0;
  const couponInput = document.getElementById('checkout-coupon-input');
  const code = couponInput?.value.trim().toUpperCase();
  if (code) {
    const found = COUPONS.find(c => c.code === code);
    if (found) {
      discountVal = found.type === 'percent' ? (subtotal * (found.value / 100)) : found.value;
      discountVal = Math.min(discountVal, subtotal);
    }
  }

  const total = Math.max(0, subtotal - discountVal + deliveryFee);
  const discountText = discountVal > 0 ? `- R$ ${discountVal.toFixed(2).replace('.', ',')}` : '';

  // Minimum order validation
  if (subtotal < (STORE_CONFIG.minOrderValue || 10)) {
    showToast(`O valor mínimo para pedidos é ${formatPrice(STORE_CONFIG.minOrderValue || 10)}`, 'error');
    return;
  }

  const address = selectedDelivery === 'pickup'
    ? 'Retirada no Balcão'
    : (document.getElementById('checkout-address')?.value || user.address);
  const reference = document.getElementById('checkout-reference')?.value || user.reference;
  const observations = document.getElementById('checkout-obs')?.value || '';
  const change = document.getElementById('checkout-change')?.value || '';

  const orderCode = store.generateOrderCode();

  const order = {
    code: orderCode,
    userId: user.id,
    customer: {
      name: user.name,
      phone: user.phone,
      email: user.email || '',
    },
    items: cart.map(i => ({ ...i })),
    subtotal,
    deliveryFee,
    total,
    deliveryType: selectedDelivery,
    address,
    reference,
    paymentMethod: selectedPayment.id,
    paymentLabel: selectedPayment.label,
    change,
    observations,
    status: 'received',
    statusHistory: [{ status: 'received', timestamp: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
  };

  store.addOrder(order);
  store.registerCustomer(user);
  store.trackVisitorAction('order_placed', { customerName: user.name });
  store.clearCart();

  let waText = `*Novo Pedido - ${orderCode}*\n\n`;
  waText += `*Cliente:* ${user.name}\n`;
  waText += `*Telefone:* ${user.phone}\n\n`;
  
  waText += `*Itens do Pedido:*\n`;
  cart.forEach(item => {
    waText += `- ${item.quantity}x ${item.name} (R$ ${item.price.toFixed(2).replace('.', ',')})\n`;
    if (item.observations) waText += `  _Obs: ${item.observations}_\n`;
  });
  
  waText += `\n*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
  if (discountText) waText += `*Desconto:* ${discountText}\n`;
  if (selectedDelivery !== 'pickup') waText += `*Taxa de Entrega:* R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
  waText += `*Total:* R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
  
  waText += `*Entrega:* ${selectedDelivery === 'pickup' ? 'Retirada no Balcão' : 'Delivery'}\n`;
  if (selectedDelivery !== 'pickup') {
    waText += `*Endereço:* ${address}\n`;
    if (reference) waText += `*Referência:* ${reference}\n`;
  }
  waText += `\n*Pagamento:* ${selectedPayment.label}\n`;
  if (change) waText += `*Troco para:* R$ ${change}\n`;
  if (observations) waText += `\n*Observações:* ${observations}\n`;
  
  const waUrl = `https://wa.me/5532984185335?text=${encodeURIComponent(waText)}`;
  window.open(waUrl, '_blank');

  showToast(`Pedido ${orderCode} realizado com sucesso!`, 'success', 5000);
  playNotificationSound();

  navigate('order', { code: orderCode });
}

// ── Admin Events ──

function bindAdminEvents() {
  // Admin login
  const adminForm = document.getElementById('admin-login-form');
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('admin-user').value.trim();
      const pass = document.getElementById('admin-pass').value.trim();

      // Utiliza hash SHA-256 para evitar expor senhas em texto plano no JS
      const encoder = new TextEncoder();
      const data = encoder.encode(pass);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      // Hash SHA-256 da senha admin padrão ("admin123")
      const ADMIN_PASS_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

      if (user === 'admin' && hashHex === ADMIN_PASS_HASH) {
        store.setAdmin({ user: 'admin', loggedInAt: new Date().toISOString() });
        showToast('Bem-vindo ao Painel Gestor!', 'success');
        navigate('admin');
      } else {
        showToast('Credenciais inválidas', 'error');
      }
    });
  }

  // Admin logout
  const btnAdminLogout = document.getElementById('btn-admin-logout');
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      store.logoutAdmin();
      navigate('home');
    });
  }

  // Admin tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentAdminTab = tab.dataset.adminTab;
      navigate('admin');
    });
  });

  // Export CSV buttons
  const btnExportFinancial = document.getElementById('btn-export-financial-csv');
  if (btnExportFinancial) {
    btnExportFinancial.addEventListener('click', () => {
      const ok = store.exportFinancialReportCSV();
      if (ok) showToast('Relatório DRE & Vendas exportado com sucesso (.CSV)!', 'success');
      else showToast('Nenhum pedido encontrado para exportação.', 'warning');
    });
  }

  const btnExportCustomers = document.getElementById('btn-export-customers-csv');
  if (btnExportCustomers) {
    btnExportCustomers.addEventListener('click', () => {
      const ok = store.exportCustomersCSV();
      if (ok) showToast('Base de Clientes exportada com sucesso (.CSV)!', 'success');
      else showToast('Nenhum cliente registrado para exportação.', 'warning');
    });
  }

  // Save Target Goal
  const btnSaveGoal = document.getElementById('btn-save-target-goal');
  if (btnSaveGoal) {
    btnSaveGoal.addEventListener('click', () => {
      const val = document.getElementById('input-target-goal')?.value;
      if (val) {
        store.setTargetGoal(val);
        showToast('Nova Meta Mensal salva com sucesso!', 'success');
        navigate('admin');
      }
    });
  }

  // Sound test
  const btnTestSound = document.getElementById('btn-test-sound');
  if (btnTestSound) {
    btnTestSound.addEventListener('click', () => {
      playNotificationSound();
      showToast('Som da campainha testado!', 'success');
    });
  }

  // Ping Supabase Keep-Alive Manual
  const btnPingSupabase = document.getElementById('btn-ping-supabase');
  if (btnPingSupabase) {
    btnPingSupabase.addEventListener('click', async () => {
      showToast('Enviando sinal de atividade para o Supabase...', 'info');
      const res = await pingSupabase();
      if (res.success) {
        showToast(`🟢 Supabase Ativo! Latência: ${res.latency}ms (Status HTTP ${res.status})`, 'success');
      } else {
        showToast(`⚠️ Atenção Supabase: ${res.message || 'Sem conexão .env'}`, 'warning');
      }
    });
  }

  // Store toggle
  const storeToggle = document.getElementById('store-toggle');
  if (storeToggle) {
    storeToggle.addEventListener('click', () => {
      const isOpen = storeToggle.classList.contains('active');
      store.setStoreOpen(!isOpen);
      storeToggle.classList.toggle('active');
      showToast(isOpen ? 'Loja fechada' : 'Loja aberta para pedidos!');
      navigate('admin');
    });
  }

  // Product toggles
  document.querySelectorAll('[data-product-toggle]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const productId = toggle.dataset.productToggle;
      const product = PRODUCTS.find(p => p.id === productId);
      const currentAvail = store.isProductAvailable(product);
      store.setProductAvailability(productId, !currentAvail);
      toggle.classList.toggle('active');
      toggle.closest('.admin-product-card')?.classList.toggle('disabled');
      showToast(currentAvail
        ? `${product.name} desativado do cardápio`
        : `${product.name} ativado no cardápio!`
      );
    });
  });

  // Advance order status
  document.querySelectorAll('.admin-btn-advance').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.orderCode;
      const nextStatus = btn.dataset.nextStatus;
      store.updateOrderStatus(code, nextStatus);
      const statusLabel = ORDER_STATUSES.find(s => s.id === nextStatus)?.label || nextStatus;
      showToast(`Pedido ${code} → ${statusLabel}`);
      navigate('admin');
    });
  });
}

// ── Polling for order status updates (for client view) ──

function startOrderPolling(orderCode) {
  const interval = setInterval(() => {
    if (currentScreen !== 'order') {
      clearInterval(interval);
      return;
    }
    const order = store.getOrderByCode(orderCode);
    if (order) {
      // Re-render order status
      const main = document.getElementById('app-main');
      if (main) {
        main.innerHTML = renderOrderStatusScreen(orderCode);
        initScrollAnimations();
        bindEvents();
      }
    }
  }, 3000);
}

// ── Scroll Spy ──

function initScrollSpy() {
  const sections = document.querySelectorAll('.category-section');
  const tabs = document.querySelectorAll('.category-tab');
  if (sections.length === 0 || tabs.length === 0) return;

  const handleScroll = () => {
    let current = '';
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.id.replace('cat-', '');
      }
    });

    if (current) {
      tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === current);
      });
    }
  };

  window.removeEventListener('scroll', handleScroll);
  window.addEventListener('scroll', handleScroll, { passive: true });
}

// ── Listen for storage events (cross-tab sync) ──

window.addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith('qfh_')) {
    // Re-render current screen
    render();
  }
});

// ── Initialize ──

function init() {
  // Track visitor session on load & auto-ping Supabase to prevent project pausing
  store.trackVisitorAction('page_view');
  autoPingSupabaseIfOlderThan24h();

  // Handle hash routing
  window.addEventListener('hashchange', () => {
    store.trackVisitorAction('page_view');
    handleHashRoute();
  });

  // Initial render
  handleHashRoute();

  // PWA Install Prompt Logic
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btnInstall = document.getElementById('btn-install');
    if (btnInstall) {
      btnInstall.style.display = 'inline-flex';
    }
  });

  // Automatic Phone Input Masking
  document.addEventListener('input', (e) => {
    if (e.target && (e.target.type === 'tel' || e.target.id.includes('phone'))) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.substring(0, 11);
      if (value.length > 6) {
        e.target.value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
      } else if (value.length > 2) {
        e.target.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      } else if (value.length > 0) {
        e.target.value = `(${value}`;
      }
    }
  });

  document.addEventListener('click', async (e) => {
    const installBtn = e.target.closest('#btn-install');
    if (installBtn && deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
        installBtn.style.display = 'none';
      }
    }
  });
}

// ── Start ──
document.addEventListener('DOMContentLoaded', init);
