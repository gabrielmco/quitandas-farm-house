/* ============================================
   QUITANDAS FARM HOUSE - UI RENDERER
   Renders all components and manages animations
   ============================================ */

import { STORE_CONFIG, CATEGORIES, PRODUCTS, ADDONS, PAYMENT_METHODS, ORDER_STATUSES, NEIGHBORHOODS, COUPONS, PIX_KEY } from './data.js';
import { store, KEYS } from './store.js';

// ── Helper: Format currency ──

export function formatPrice(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Helper: Format date ──

function formatDate(isoString) {
  const d = new Date(isoString);
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${day} de ${months[d.getMonth()]}, ${hours}h${mins}`;
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

// ── Toast System ──

export function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icon = type === 'success' ? 'ph-check-circle' : type === 'error' ? 'ph-warning' : 'ph-info';
  toast.innerHTML = `<i class="ph ${icon} toast__icon"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('exiting');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Store Status ──

export function getStoreStatusHTML() {
  const isOpen = store.isStoreOpen();
  if (isOpen) {
    return `<div class="store-status store-status--open">
      <span class="store-status__dot"></span>
      <span>Aberto Agora</span>
    </div>`;
  }
  return `<div class="store-status store-status--closed" title="Você pode fazer o pedido que entregaremos no próximo horário de abertura">
    <span class="store-status__dot"></span>
    <span>Fechado - Agende seu Pedido</span>
  </div>`;
}

// ── Render Header ──

export function renderHeader() {
  const user = store.getUser();
  const cartCount = store.getCartCount();
  const userNameEscaped = user ? escapeHTML(user.name) : '';
  const userBtn = user
    ? `<button class="header-btn" id="btn-user" title="${userNameEscaped}" aria-label="Conta do usuário ${userNameEscaped}" style="position:relative;">
        <i class="ph ph-user"></i>
      </button>`
    : `<button class="header-btn" id="btn-login" title="Entrar" aria-label="Fazer login">
        <i class="ph ph-user"></i>
      </button>`;

  return `
    <header class="app-header">
      <div class="header-brand">
        <img src="${STORE_CONFIG.logo}" alt="Logo Quitandas Farm House" class="header-logo" id="btn-home" width="40" height="40">
        <span class="header-title">Quitandas</span>
      </div>
      <div class="header-actions">
        <button class="header-btn" id="btn-install" title="Instalar App" aria-label="Instalar aplicativo" style="display: none;">
          <i class="ph ph-download-simple"></i>
        </button>
        <button class="header-btn" id="btn-search" title="Buscar" aria-label="Buscar produtos">
          <i class="ph ph-magnifying-glass"></i>
        </button>
        ${userBtn}
        <button class="header-btn" id="btn-admin-link" title="Painel Admin" aria-label="Painel Administrativo" style="position:relative;">
          <i class="ph ph-gear"></i>
        </button>
      </div>
    </header>
  `;
}

// ── Render Hero Banner ──

export function renderHeroBanner() {
  const isOpen = store.isStoreOpen();
  const statusColor = isOpen ? '#81C784' : '#E57373';
  const statusText = isOpen ? 'Aberto' : 'Fechado';

  return `
    <section class="hero-section">
      <div class="hero-banner">
        <img src="${STORE_CONFIG.banner}" alt="Banner Quitandas Farm House" class="hero-banner__bg" fetchpriority="high" width="1200" height="400">
        <div class="hero-banner__overlay"></div>
      </div>
      
      <div class="hero-card-wrapper container">
        <div class="hero-card">
          <img src="${STORE_CONFIG.logo}" alt="Logo Quitandas Farm House" class="hero-card__logo" width="80" height="80">
          
          <div class="hero-card__info">
            <div class="hero-card__header">
              <h1 class="hero-card__title">${STORE_CONFIG.name}</h1>
              <i class="ph ph-caret-right hero-card__arrow"></i>
            </div>
            
            <div class="hero-card__status">
              <span class="hero-card__status-dot" style="background-color: ${statusColor};"></span>
              <span style="color: ${statusColor}; font-weight: 600; font-size: 0.85rem;">${statusText}</span>
            </div>

            <div class="hero-card__pills">
              <div class="hero-card__pill">
                <i class="ph ph-moped"></i>
                <span>${formatPrice(STORE_CONFIG.deliveryFee)}</span>
              </div>
              <div class="hero-card__pill">
                <i class="ph ph-clock"></i>
                <span>${STORE_CONFIG.estimatedTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ── Render Search Bar ──

export function renderSearchBar() {
  return `
    <div class="search-bar" id="search-bar" style="display:none;">
      <div class="search-input-wrapper">
        <i class="ph ph-magnifying-glass search-icon"></i>
        <input type="text" class="search-input" id="search-input" placeholder="Buscar no cardápio..." autocomplete="off">
      </div>
    </div>
  `;
}

// ── Render Category Tabs ──

export function renderCategoryTabs() {
  const tabs = CATEGORIES.map((cat, i) =>
    `<button class="category-tab ${i === 0 ? 'active' : ''}" data-category="${cat.id}">
      <i class="ph ${cat.icon}"></i> ${cat.name}
    </button>`
  ).join('');

  return `
    <nav class="category-tabs">
      <div class="category-tabs__list">${tabs}</div>
    </nav>
  `;
}

// ── Render Product Card ──

function renderProductCard(product, staggerIndex) {
  const available = store.isProductAvailable(product);
  const stagger = `stagger-${Math.min(staggerIndex + 1, 8)}`;
  const unavailableClass = available ? '' : 'product-card--unavailable';
  const badge = !available ? '<span class="product-card__badge">Indisponível</span>' : '';
  const priceLabel = product.hasSize ? `A partir de ${formatPrice(product.price)}` : formatPrice(product.price);
  const nameEsc = escapeHTML(product.name);
  const descEsc = escapeHTML(product.description);

  return `
    <article class="product-card hover-lift anim-fade-in-up ${stagger} ${unavailableClass}"
             data-product-id="${product.id}" tabindex="0" aria-label="${nameEsc}, ${priceLabel}">
      ${badge}
      <div class="product-card__img-wrapper hover-zoom" style="--bg-img: url('${product.image}')">
        <img src="${product.image}" alt="${nameEsc}" class="product-card__img" loading="lazy" width="300" height="200">
      </div>
      <div class="product-card__info">
        <div>
          <h3 class="product-card__name">${nameEsc}</h3>
          <p class="product-card__desc">${descEsc}</p>
        </div>
        <div class="product-card__footer">
          <span class="product-card__price">${priceLabel}</span>
          ${available ? `<button class="product-card__add-btn hover-press" aria-label="Ver detalhes e adicionar ${nameEsc}">+</button>` : ''}
        </div>
      </div>
    </article>
  `;
}

// ── Render Products by Category ──

export function renderProductSections(filter = '') {
  let html = '';
  CATEGORIES.forEach(cat => {
    let products = PRODUCTS.filter(p => p.category === cat.id);
    if (filter) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.description.toLowerCase().includes(filter.toLowerCase())
      );
    }
    if (products.length === 0) return;

    html += `
      <section class="category-section" id="cat-${cat.id}">
        <h2 class="category-section__title">
          <i class="ph ${cat.icon} category-section__icon"></i>
          ${cat.name}
        </h2>
        <div class="products-grid">
          ${products.map((p, i) => renderProductCard(p, i)).join('')}
        </div>
      </section>
    `;
  });
  return html;
}

// ── Render Product Detail Modal ──

export function renderProductModal(product) {
  const sizesHTML = product.hasSize ? `
    <div class="options-group">
      <div class="options-group__title">
        Tamanho
        <span class="options-group__badge">Obrigatório</span>
      </div>
      ${product.sizes.map((s, i) => `
        <div class="option-item" data-size-id="${s.id}">
          <div class="option-item__info">
            <span class="option-item__name">${s.name}</span>
            <span class="option-item__price">${formatPrice(s.price)}</span>
          </div>
          <div class="custom-radio ${i === 0 ? 'checked' : ''}" data-size-id="${s.id}"></div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const availableAddons = ADDONS.filter(a => !a.categories || a.categories.includes(product.category));
  const addonsHTML = availableAddons.length > 0 ? `
    <div class="options-group" style="margin-top:var(--space-4);">
      <div class="options-group__title">
        Adicionais & Acompanhamentos
        <span class="options-group__badge">Opcional</span>
      </div>
      ${availableAddons.map(a => `
        <div class="option-item" data-addon-id="${a.id}">
          <div class="option-item__info">
            <span class="option-item__name">${a.name}</span>
            <span class="option-item__price">${a.price > 0 ? formatPrice(a.price) : 'Grátis'}</span>
          </div>
          <div class="custom-checkbox" data-addon-id="${a.id}"></div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const nameEsc = escapeHTML(product.name);
  const descEsc = escapeHTML(product.description);

  return `
    <div class="modal-overlay active" id="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal">
        <div class="modal__handle"></div>
        <div class="modal__scroll-content">
          <div class="modal__img-wrapper">
            <img src="${product.image}" alt="${nameEsc}" class="modal__img" width="500" height="300">
          </div>
          <div class="modal__body">
            <h2 class="modal__title" id="modal-title">${nameEsc}</h2>
            <p class="modal__desc">${descEsc}</p>
            <p class="modal__price" id="modal-price">${formatPrice(product.price)}</p>

            ${sizesHTML}
            ${addonsHTML}

            <div class="form-group" style="margin-top:var(--space-4);">
              <label class="form-label" for="modal-obs">Observações</label>
              <textarea class="form-input form-textarea" id="modal-obs" placeholder="Ex: Capricha no sabor..."></textarea>
            </div>
          </div>
        </div>

        <div class="modal__footer">
          <div class="qty-control">
            <button class="qty-btn" id="modal-qty-minus" aria-label="Diminuir quantidade">−</button>
            <span class="qty-value" id="modal-qty">1</span>
            <button class="qty-btn" id="modal-qty-plus" aria-label="Aumentar quantidade">+</button>
          </div>
          <button class="btn btn--primary" id="modal-add-btn" style="flex:1;">
            Adicionar ${formatPrice(product.price)}
          </button>
        </div>
      </div>
    </div>
  `;
}

// ── Render Cart Drawer (Replica Image 1) ──

export function renderCartDrawer() {
  const cart = store.getCart();
  const subtotal = store.getCartSubtotal();

  let itemsHTML;
  if (cart.length === 0) {
    itemsHTML = `
      <div class="cart-drawer__empty">
        <i class="ph ph-shopping-cart cart-drawer__empty-icon"></i>
        <p class="cart-drawer__empty-text">Sua sacola está vazia</p>
        <p class="cart-drawer__empty-sub">Adicione itens do cardápio</p>
      </div>
    `;
  } else {
    itemsHTML = cart.map(item => {
      const price = item.selectedSize ? item.selectedSize.price : item.price;
      const totalItem = price * item.quantity;
      const sizeText = item.selectedSize ? item.selectedSize.name : '';

      return `
        <div class="cart-item" data-cart-key="${item.cartKey}">
          <img src="${item.image}" alt="${escapeHTML(item.name)}" class="cart-item__img">
          <div class="cart-item__info">
            <div class="cart-item__top-row">
              <span class="cart-item__name">${escapeHTML(item.name)}</span>
              <button class="cart-item__trash cart-item-remove" data-key="${item.cartKey}" title="Remover item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
            ${sizeText ? `<p class="cart-item__details">Tamanho: ${escapeHTML(sizeText)}</p>` : ''}
            ${item.observations ? `<p class="cart-item__details"><i class="ph ph-note"></i> ${escapeHTML(item.observations)}</p>` : ''}
            <div class="cart-item__bottom-row">
              <div class="cart-item__qty-box">
                <button class="cart-item__qty-btn cart-qty-minus" data-key="${item.cartKey}">−</button>
                <span class="cart-item__qty-num">${item.quantity}</span>
                <button class="cart-item__qty-btn cart-qty-plus" data-key="${item.cartKey}">+</button>
              </div>
              <span class="cart-item__price">${formatPrice(totalItem)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  const isOpen = store.isStoreOpen();

  return `
    <div class="cart-overlay" id="cart-overlay"></div>
    <aside class="cart-drawer" id="cart-drawer">
      <div class="cart-drawer__header">
        <h2 class="cart-drawer__title">Minha sacola</h2>
        <button class="cart-drawer__close" id="cart-close">✕</button>
      </div>

      <div class="cart-drawer__body">
        <button class="cart-delivery-btn" id="btn-calc-delivery">
          <span style="display:flex;align-items:center;gap:8px;">
            <i class="ph ph-map-pin"></i>
            <span>Calcular taxa e tempo de entrega</span>
          </span>
          <span>›</span>
        </button>

        ${itemsHTML}

        ${cart.length > 0 ? `
          <div class="cart-coupon-wrap">
            <div class="cart-coupon-toggle" id="btn-coupon-toggle">
              <span>Cupom de desconto</span>
              <span id="coupon-arrow" style="font-size:12px;transition:transform 0.2s;">∨</span>
            </div>
            <div class="cart-coupon-box" id="coupon-box" style="display:none;">
              <input type="text" id="coupon-input-code" placeholder="Código do cupom">
              <button id="btn-apply-coupon-code">Aplicar</button>
            </div>
          </div>
        ` : ''}
      </div>

      ${cart.length > 0 ? `
        <div class="cart-drawer__footer">
          <div class="cart-summary">
            <div class="cart-summary__total-row">
              <span class="cart-summary__total-label">Total:</span>
              <span class="cart-summary__total-val">${formatPrice(subtotal)}</span>
            </div>
            <p class="cart-store-status-text">
              ${isOpen ? '🟢 Loja Aberta • Entrega de 30-50 min' : 'Fechado no momento • Abrimos sexta às 17:00'}
            </p>
          </div>
          <button class="btn btn--primary" id="btn-checkout" style="width:100%;height:52px;font-size:16px;border-radius:12px;">
            Continuar
          </button>
        </div>
      ` : ''}
    </aside>
  `;
}

// ── Render Cart FAB (Replica Images 2 & 3) ──

export function renderCartFab() {
  const count = store.getCartCount();
  const subtotal = store.getCartSubtotal();
  if (count === 0) return '<div class="cart-fab" id="cart-fab"></div>';

  return `
    <button class="cart-fab visible" id="cart-fab">
      <div class="cart-fab__main">
        <div class="cart-fab__icon-wrap">
          <svg class="cart-fab__bag-svg" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span class="cart-fab__badge">${count}</span>
        </div>
        <div class="cart-fab__text-wrap">
          <span class="cart-fab__title">
            <i class="ph ph-shopping-cart cart-fab__icon"></i>
            ${count} ${count === 1 ? 'item' : 'itens'} • Ver sacola
          </span>
          <span class="cart-fab__price">${formatPrice(subtotal)}</span>
        </div>
      </div>
      <div class="cart-fab__arrow-box">
        <span>›</span>
      </div>
    </button>
  `;
}

// ── Render Login Options Screen (Guest vs Account) ──

export function renderLoginOptionsScreen() {
  return `
    <div class="login-screen">
      <div class="login-card anim-scale-in is-visible" style="max-width:440px;padding:32px 24px;text-align:center;">
        <img src="${STORE_CONFIG.logo}" alt="Logo" class="login-logo" style="width:72px;height:72px;border-radius:18px;margin:0 auto 16px;">
        <h2 class="login-title" style="font-size:22px;margin-bottom:6px;">Como deseja continuar?</h2>
        <p class="login-subtitle" style="font-size:14px;margin-bottom:24px;">Escolha a melhor opção para seu pedido</p>

        <div style="display:flex;flex-direction:column;gap:12px;">
          <button class="btn btn--secondary hover-press" id="btn-opt-google" style="width:100%;height:48px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:15px;background:#262320;border:1px solid rgba(255,255,255,0.1);">
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Entrar com Google
          </button>

          <button class="btn btn--secondary hover-press" id="btn-opt-site" style="width:100%;height:48px;font-size:15px;background:#262320;border:1px solid rgba(255,255,255,0.1);">
            <i class="ph ph-key"></i> Entrar ou Criar Conta no Site
          </button>

          <div style="margin:8px 0;display:flex;align-items:center;gap:12px;">
            <div style="flex:1;height:1px;background:rgba(255,255,255,0.1);"></div>
            <span style="font-size:12px;color:rgba(255,255,255,0.4);">ou</span>
            <div style="flex:1;height:1px;background:rgba(255,255,255,0.1);"></div>
          </div>

          <button class="btn btn--primary hover-press" id="btn-opt-guest" style="width:100%;height:50px;font-size:15px;">
            <i class="ph ph-lightning"></i> Pedir Sem Cadastro (WhatsApp)
          </button>
        </div>

        <button class="btn btn--ghost" id="btn-back-cart" style="width:100%;margin-top:16px;font-size:14px;">
          ← Voltar à Sacola
        </button>
      </div>
    </div>
  `;
}

// ── Render Login Screen ──

export function renderLoginScreen(returnTo = 'checkout') {
  return `
    <div class="login-screen">
      <div class="login-card anim-scale-in is-visible">
        <img src="${STORE_CONFIG.logo}" alt="Logo" class="login-logo floating">
        <h2 class="login-title">Entrar</h2>
        <p class="login-subtitle">Para continuar seu pedido</p>

        <button class="login-google-btn hover-press" id="btn-google-login">
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Entrar com Google
        </button>

        <div class="login-divider">ou</div>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Seu nome</label>
            <input type="text" class="form-input" id="login-name" placeholder="Ex: Maria" required>
          </div>
          <div class="form-group">
            <label class="form-label">WhatsApp</label>
            <input type="tel" class="form-input" id="login-phone" placeholder="(32) 99999-9999" required>
          </div>
          <div class="form-group">
            <label class="form-label">Endereço em Lima Duarte</label>
            <input type="text" class="form-input" id="login-address" placeholder="Rua, número, bairro" required>
          </div>
          <div class="form-group">
            <label class="form-label">Ponto de referência</label>
            <input type="text" class="form-input" id="login-reference" placeholder="Próximo ao...">
          </div>
          <button type="submit" class="btn btn--primary hover-press">Continuar</button>
        </form>

        <input type="hidden" id="login-return-to" value="${returnTo}">
      </div>
    </div>
  `;
}

// ── Render Checkout Screen ──

export function renderCheckoutScreen() {
  const user = store.getUser();
  const cart = store.getCart();
  const subtotal = store.getCartSubtotal();

  if (!user || cart.length === 0) return '';

  const paymentOptionsHTML = PAYMENT_METHODS.map((pm, i) => `
    <div class="payment-option ${i === 0 ? 'selected' : ''}" data-payment-id="${pm.id}">
      <i class="ph ${pm.icon} payment-option__icon"></i>
      <div class="custom-radio ${i === 0 ? 'checked' : ''}"></div>
      <span class="payment-option__label">${pm.label}</span>
    </div>
  `).join('');

  const cartItemsHTML = cart.map(item => {
    const price = item.selectedSize ? item.selectedSize.price : item.price;
    const addonsPrice = (item.selectedAddons || []).reduce((s, a) => s + a.price, 0);
    const total = (price + addonsPrice) * item.quantity;
    return `<div class="order-details-card__row">
      <span>${item.quantity}x ${item.name}</span>
      <span>${formatPrice(total)}</span>
    </div>`;
  }).join('');

  return `
    <div class="checkout">
      <h2 style="font-family:var(--font-display);font-size:var(--fs-2xl);font-weight:var(--fw-bold);color:var(--color-cream);margin-bottom:var(--space-6);">
        Finalizar Pedido
      </h2>

      <!-- Entrega -->
      <div class="checkout__section anim-fade-in-up stagger-1">
        <h3 class="checkout__section-title"><i class="ph ph-moped"></i> Entrega</h3>
        <div class="delivery-options">
          <div class="delivery-option selected" data-delivery="delivery">
            <div class="delivery-option__icon"><i class="ph ph-moped"></i></div>
            <div class="delivery-option__label">Entrega</div>
            <div class="delivery-option__price">${formatPrice(STORE_CONFIG.deliveryFee)}</div>
          </div>
          <div class="delivery-option" data-delivery="pickup">
            <div class="delivery-option__icon"><i class="ph ph-storefront"></i></div>
            <div class="delivery-option__label">Retirar</div>
            <div class="delivery-option__price">Grátis</div>
          </div>
        </div>

        <div id="delivery-address-section">
          <div class="form-group">
            <label class="form-label">Bairro em Lima Duarte - MG</label>
            <select class="form-input form-select" id="checkout-neighborhood">
              ${NEIGHBORHOODS.map(n => `<option value="${n.name}">${n.name} - Entrega ${formatPrice(n.fee)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Endereço (Rua e Número)</label>
            <input type="text" class="form-input" id="checkout-address" value="${user.address || ''}" placeholder="Ex: Rua José Sales, 321">
          </div>
          <div class="form-group">
            <label class="form-label">Ponto de referência</label>
            <input type="text" class="form-input" id="checkout-reference" value="${user.reference || ''}" placeholder="Ex: Em cima da barraquinha do Zé">
          </div>
        </div>
      </div>

      <!-- Pagamento -->
      <div class="checkout__section anim-fade-in-up stagger-2">
        <h3 class="checkout__section-title"><i class="ph ph-credit-card"></i> Pagamento</h3>
        <div class="payment-options" id="payment-options">
          ${paymentOptionsHTML}
        </div>

        <div id="pix-copia-section" style="display:none;margin-top:var(--space-4);background:var(--color-bg-elevated);padding:var(--space-4);border-radius:var(--radius-lg);border:1px solid var(--color-border);text-align:center;">
          <p style="font-size:var(--fs-sm);color:var(--color-cream);margin-bottom:var(--space-2);font-weight:var(--fw-semibold);"><i class="ph ph-device-mobile"></i> Chave Pix Quitandas Farm House</p>
          <p style="font-size:var(--fs-xs);color:var(--color-text-secondary);margin-bottom:var(--space-3);">${PIX_KEY.name} (${PIX_KEY.type})</p>
          <div style="background:var(--color-bg-surface);padding:var(--space-3);border-radius:var(--radius-md);font-family:monospace;color:var(--color-accent);font-size:var(--fs-md);margin-bottom:var(--space-3);word-break:break-all;" id="pix-key-val">
            ${PIX_KEY.key}
          </div>
          <button class="btn btn--secondary btn--sm" id="btn-copy-pix" type="button">
            <i class="ph ph-copy"></i> Copiar Chave Pix
          </button>
        </div>

        <div id="change-section" style="display:none;margin-top:var(--space-4);">
          <div class="form-group">
            <label class="form-label">Troco para quanto?</label>
            <input type="text" class="form-input" id="checkout-change" placeholder="Ex: R$ 50,00">
          </div>
        </div>
      </div>

      <!-- Cupom de Desconto -->
      <div class="checkout__section anim-fade-in-up stagger-3">
        <h3 class="checkout__section-title"><i class="ph ph-ticket"></i> Cupom de Desconto</h3>
        <div style="display:flex;gap:var(--space-2);">
          <input type="text" class="form-input" id="checkout-coupon-input" placeholder="Ex: QUITANDAS10" style="text-transform:uppercase;">
          <button class="btn btn--secondary btn--sm" id="btn-apply-coupon" type="button">Aplicar</button>
        </div>
        <div id="coupon-message" style="margin-top:var(--space-2);font-size:var(--fs-xs);"></div>
      </div>

      <!-- Resumo -->
      <div class="checkout__section anim-fade-in-up stagger-4">
        <h3 class="checkout__section-title"><i class="ph ph-receipt"></i> Resumo do Pedido</h3>
        ${cartItemsHTML}
        <div class="cart-summary" style="margin-top:var(--space-4);">
          <div class="cart-summary__row">
            <span>Subtotal</span>
            <span>${formatPrice(subtotal)}</span>
          </div>
          <div class="cart-summary__row" id="coupon-discount-row" style="display:none;color:var(--color-status-done-txt);">
            <span>Desconto</span>
            <span id="coupon-discount-val">- R$ 0,00</span>
          </div>
          <div class="cart-summary__row" id="delivery-fee-row">
            <span>Taxa de entrega</span>
            <span id="delivery-fee-value">${formatPrice(STORE_CONFIG.deliveryFee)}</span>
          </div>
          <div class="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span id="checkout-total">${formatPrice(subtotal + STORE_CONFIG.deliveryFee)}</span>
          </div>
        </div>
      </div>

      <!-- Observações -->
      <div class="checkout__section anim-fade-in-up stagger-5">
        <h3 class="checkout__section-title"><i class="ph ph-note-pencil"></i> Observações</h3>
        <textarea class="form-input form-textarea" id="checkout-obs" placeholder="Alguma observação geral sobre o pedido?"></textarea>
      </div>

      <button class="btn btn--primary btn--lg hover-press" id="btn-place-order" style="margin-top:var(--space-4);">
        Confirmar Pedido
      </button>
    </div>
  `;
}

// ── Render Order Status Screen ──

export function renderOrderStatusScreen(orderCode) {
  const order = store.getOrderByCode(orderCode);
  if (!order) {
    return `<div class="order-status">
      <div class="cart-drawer__empty">
        <i class="ph ph-magnifying-glass cart-drawer__empty-icon"></i>
        <p class="cart-drawer__empty-text">Pedido não encontrado</p>
      </div>
    </div>`;
  }

  const statusIndex = ORDER_STATUSES.findIndex(s => s.id === order.status);
  const timelineHTML = ORDER_STATUSES.map((s, i) => {
    const isCurrent = i === statusIndex;
    const isCompleted = i < statusIndex;
    const cls = isCurrent ? 'current' : isCompleted ? 'completed' : '';
    const historyEntry = (order.statusHistory || []).find(h => h.status === s.id);
    const timeText = historyEntry ? formatTime(historyEntry.timestamp) : '';

    return `
      <div class="status-step ${cls}">
        <div class="status-step__indicator">${isCompleted ? '<i class="ph ph-check"></i>' : `<i class="ph ${s.icon}"></i>`}</div>
        <div class="status-step__content">
          <p class="status-step__title">${s.label}</p>
          ${timeText ? `<p class="status-step__time">${timeText}</p>` : ''}
        </div>
      </div>
    `;
  }).join('');

  const itemsHTML = order.items.map(item => {
    const price = item.selectedSize ? item.selectedSize.price : item.price;
    const addonsPrice = (item.selectedAddons || []).reduce((s, a) => s + a.price, 0);
    const total = (price + addonsPrice) * item.quantity;
    return `<div class="order-details-card__row">
      <span>${item.quantity}x ${item.name}</span>
      <span>${formatPrice(total)}</span>
    </div>`;
  }).join('');

  return `
    <div class="order-status">
      <div class="order-code anim-scale-in is-visible">
        <p class="order-code__label">Código do Pedido</p>
        <p class="order-code__value">${order.code}</p>
        <p class="order-date">${formatDate(order.createdAt)}</p>
      </div>

      <div class="status-timeline anim-fade-in-up is-visible">
        ${timelineHTML}
      </div>

      <div class="order-details-card anim-fade-in-up is-visible">
        <h3 class="order-details-card__title"><i class="ph ph-map-pin"></i> Entrega</h3>
        <div class="order-details-card__row">
          <span>Endereço</span>
          <span>${order.address || 'Retirada no Balcão'}</span>
        </div>
        ${order.reference ? `<div class="order-details-card__row">
          <span>Referência</span>
          <span>${order.reference}</span>
        </div>` : ''}
        <div class="order-details-card__row">
          <span>Pagamento</span>
          <span>${order.paymentLabel || ''}</span>
        </div>
      </div>

      <div class="order-details-card anim-fade-in-up is-visible">
        <h3 class="order-details-card__title"><i class="ph ph-shopping-bag"></i> Itens do Pedido</h3>
        ${itemsHTML}
        <div style="border-top:1px solid var(--color-divider);margin-top:var(--space-3);padding-top:var(--space-3);">
          <div class="order-details-card__row">
            <span>Subtotal</span>
            <span>${formatPrice(order.subtotal)}</span>
          </div>
          <div class="order-details-card__row">
            <span>Taxa de entrega</span>
            <span>${formatPrice(order.deliveryFee)}</span>
          </div>
          <div class="order-details-card__row" style="font-weight:var(--fw-bold);font-size:var(--fs-lg);">
            <span>Total</span>
            <span style="color:var(--color-text-accent);">${formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <a href="https://wa.me/${STORE_CONFIG.phone}" target="_blank" rel="noopener"
         class="btn btn--secondary hover-press" style="width:100%;margin-top:var(--space-4);">
        <i class="ph ph-whatsapp-logo"></i> Falar com o Restaurante
      </a>

      <button class="btn btn--ghost" id="btn-back-home" style="width:100%;margin-top:var(--space-3);">
        ← Voltar ao Cardápio
      </button>
    </div>
  `;
}

// ── Render My Orders ──

export function renderMyOrdersScreen() {
  const user = store.getUser();
  if (!user) return '';

  const orders = store.getUserOrders(user.id);

  if (orders.length === 0) {
    return `
      <div class="orders-list">
        <h2 style="font-family:var(--font-display);font-size:var(--fs-2xl);font-weight:var(--fw-bold);color:var(--color-cream);margin-bottom:var(--space-6);">
          Meus Pedidos
        </h2>
        <div class="cart-drawer__empty">
          <i class="ph ph-clipboard-text cart-drawer__empty-icon"></i>
          <p class="cart-drawer__empty-text">Nenhum pedido ainda</p>
          <p class="cart-drawer__empty-sub">Faça seu primeiro pedido!</p>
        </div>
      </div>
    `;
  }

  const ordersHTML = orders.map(order => {
    const statusObj = ORDER_STATUSES.find(s => s.id === order.status);
    const badgeClass = `admin-order__status-badge--${order.status}`;
    const itemsText = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

    return `
      <div class="order-card hover-lift" data-order-code="${order.code}">
        <div class="order-card__header">
          <span class="order-card__code">${order.code}</span>
          <span class="order-card__date">${formatDate(order.createdAt)}</span>
        </div>
        <span class="order-card__status admin-order__status-badge ${badgeClass}">
          ${statusObj ? `<i class="ph ${statusObj.icon}"></i>` : ''} ${statusObj ? statusObj.label : order.status}
        </span>
        <p class="order-card__items">${itemsText}</p>
        <p class="order-card__total">${formatPrice(order.total)}</p>
      </div>
    `;
  }).join('');

  return `
    <div class="orders-list">
      <h2 style="font-family:var(--font-display);font-size:var(--fs-2xl);font-weight:var(--fw-bold);color:var(--color-cream);margin-bottom:var(--space-6);">
        Meus Pedidos
      </h2>
      ${ordersHTML}
      <button class="btn btn--ghost" id="btn-back-home" style="width:100%;margin-top:var(--space-4);">
        ← Voltar ao Cardápio
      </button>
    </div>
  `;
}

// ── Render Admin Login ──

export function renderAdminLogin() {
  return `
    <div class="admin-login">
      <div class="admin-login-card anim-scale-in is-visible">
        <img src="${STORE_CONFIG.logo}" alt="Logo" class="login-logo">
        <h2 class="admin-login__title">Painel Administrativo</h2>
        <p class="admin-login__subtitle">Acesso restrito ao gestor</p>

        <div class="admin-login__prefilled">
          <p>Usuário: <strong>admin</strong></p>
          <p>Senha: <strong>admin123</strong></p>
        </div>

        <form id="admin-login-form">
          <div class="form-group">
            <label class="form-label">Usuário</label>
            <input type="text" class="form-input" id="admin-user" value="admin" required>
          </div>
          <div class="form-group">
            <label class="form-label">Senha</label>
            <input type="password" class="form-input" id="admin-pass" value="admin123" required>
          </div>
          <button type="submit" class="btn btn--primary hover-press">Entrar no Painel</button>
        </form>
      </div>
    </div>
  `;
}

// ── Render Admin Panel ──

export function renderAdminPanel(activeTab = 'orders') {
  const orders = store.getOrders();
  const allProducts = PRODUCTS;
  const customers = store.getCustomers();
  const visitors = store.getVisitors();
  const metrics = store.getFinancialMetrics();

  // Stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== 'done').length;
  const todayOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const totalRevenue = metrics.grossRevenue;
  const abandonedCartsCount = metrics.abandonedCartsCount;

  // Store status
  const isOpen = store.isStoreOpen();

  let contentHTML = '';

  if (activeTab === 'orders') {
    const activeOrders = orders.filter(o => o.status !== 'done');
    const doneOrders = orders.filter(o => o.status === 'done');
    const allToShow = [...activeOrders, ...doneOrders.slice(0, 5)];

    if (allToShow.length === 0) {
      contentHTML = `
        <div class="admin-empty">
          <i class="ph ph-clipboard-text admin-empty__icon"></i>
          <p class="admin-empty__text">Nenhum pedido ainda</p>
        </div>
      `;
    } else {
      contentHTML = `<div class="admin-orders">
        ${allToShow.map(order => renderAdminOrderCard(order)).join('')}
      </div>`;
    }
  } else if (activeTab === 'products') {
    contentHTML = `<div class="admin-products">
      ${allProducts.map(p => {
        const avail = store.isProductAvailable(p);
        const estCost = p.price * 0.38;
        const estProfit = p.price - estCost;
        return `
          <div class="admin-product-card ${avail ? '' : 'disabled'}">
            <img src="${p.image}" alt="${p.name}" class="admin-product__img">
            <div class="admin-product__info">
              <p class="admin-product__name">${p.name}</p>
              <p class="admin-product__category">${CATEGORIES.find(c => c.id === p.category)?.name || ''} • Margem: ~62%</p>
              <span style="font-size:0.75rem;color:var(--color-status-done-txt);">Lucro estimado: ${formatPrice(estProfit)}</span>
            </div>
            <span class="admin-product__price">${formatPrice(p.price)}</span>
            <div class="toggle-switch ${avail ? 'active' : ''}" data-product-toggle="${p.id}"></div>
          </div>
        `;
      }).join('')}
    </div>`;
  } else if (activeTab === 'analytics') {
    const hourlyMax = Math.max(...metrics.hourlyDistribution, 1);
    
    contentHTML = `
      <div class="admin-analytics-dashboard" style="display:flex;flex-direction:column;gap:var(--space-6);">
        
        <!-- Banners de Ações Financeiras Executivas -->
        <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
          <button class="btn btn--primary" id="btn-export-financial-csv" style="flex:1;min-width:240px;gap:8px;">
            <i class="ph ph-file-csv" style="font-size:1.3rem;"></i> Exportar DRE & Vendas (.CSV)
          </button>
          <button class="btn btn--secondary" id="btn-export-customers-csv" style="flex:1;min-width:240px;gap:8px;">
            <i class="ph ph-user-list" style="font-size:1.3rem;"></i> Exportar Base de Clientes (.CSV)
          </button>
        </div>

        <!-- Meta de Faturamento Mensal -->
        <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--space-5);">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-3);">
            <div>
              <span style="font-size:var(--fs-xs);text-transform:uppercase;letter-spacing:1px;color:var(--color-text-secondary);font-weight:600;">Meta de Faturamento Mensal</span>
              <h2 style="font-size:var(--fs-xl);color:var(--color-cream);margin-top:2px;">${formatPrice(metrics.grossRevenue)} / <span style="color:var(--color-accent);">${formatPrice(metrics.targetGoal)}</span></h2>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <input type="number" id="input-target-goal" value="${metrics.targetGoal}" style="width:120px;padding:6px 10px;border-radius:8px;background:var(--color-bg-deep);border:1px solid var(--color-border);color:var(--color-cream);font-size:0.85rem;" placeholder="Nova Meta R$">
              <button class="btn btn--secondary btn--sm" id="btn-save-target-goal">Salvar Meta</button>
            </div>
          </div>
          
          <div style="width:100%;height:12px;background:var(--color-bg-deep);border-radius:6px;overflow:hidden;position:relative;">
            <div style="width:${metrics.goalProgressPercent}%;height:100%;background:linear-gradient(90deg, var(--color-accent), #81C784);border-radius:6px;transition:width 0.6s ease;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--color-text-secondary);margin-top:6px;">
            <span>Progresso Atual: <strong>${metrics.goalProgressPercent.toFixed(1)}%</strong></span>
            <span>Faltam: <strong>${formatPrice(Math.max(0, metrics.targetGoal - metrics.grossRevenue))}</strong></span>
          </div>
        </div>

        <!-- DRE Demonstrativo de Resultado -->
        <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--space-5);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:var(--space-4);">
            <i class="ph ph-chart-line-up" style="font-size:1.6rem;color:var(--color-accent);"></i>
            <div>
              <h3 style="color:var(--color-cream);font-size:var(--fs-lg);margin:0;">DRE - Demonstrativo Financeiro Simplificado</h3>
              <p style="font-size:var(--fs-xs);color:var(--color-text-secondary);margin:0;">Apuração de receita, custos e margem líquida do negócio</p>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--space-3);margin-bottom:var(--space-4);">
            <div style="background:var(--color-bg-deep);padding:var(--space-3);border-radius:var(--radius-md);border-left:4px solid #81C784;">
              <span style="font-size:var(--fs-xs);color:var(--color-text-secondary);">Receita Bruta Total</span>
              <strong style="display:block;font-size:1.2rem;color:#81C784;margin-top:2px;">${formatPrice(metrics.grossRevenue)}</strong>
            </div>

            <div style="background:var(--color-bg-deep);padding:var(--space-3);border-radius:var(--radius-md);border-left:4px solid #E57373;">
              <span style="font-size:var(--fs-xs);color:var(--color-text-secondary);">(-) CMV Estimado (38%)</span>
              <strong style="display:block;font-size:1.2rem;color:#E57373;margin-top:2px;">- ${formatPrice(metrics.cmvTotal)}</strong>
            </div>

            <div style="background:var(--color-bg-deep);padding:var(--space-3);border-radius:var(--radius-md);border-left:4px solid var(--color-accent);">
              <span style="font-size:var(--fs-xs);color:var(--color-text-secondary);">(=) Lucro Bruto Estimado</span>
              <strong style="display:block;font-size:1.2rem;color:var(--color-accent);margin-top:2px;">${formatPrice(metrics.grossProfit)}</strong>
            </div>

            <div style="background:var(--color-bg-deep);padding:var(--space-3);border-radius:var(--radius-md);border-left:4px solid #64B5F6;">
              <span style="font-size:var(--fs-xs);color:var(--color-text-secondary);">Margem de Lucro %</span>
              <strong style="display:block;font-size:1.2rem;color:#64B5F6;margin-top:2px;">${metrics.netProfitMargin.toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        <!-- KPIs Executivos de Crescimento (Growth & LTV) -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:var(--space-4);">
          <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-4);">
            <span style="font-size:var(--fs-xs);color:var(--color-text-secondary);text-transform:uppercase;font-weight:600;">Ticket Médio (AOV)</span>
            <h3 style="font-size:1.5rem;color:var(--color-cream);margin-top:4px;">${formatPrice(metrics.averageOrderValue)}</h3>
            <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;">Valor médio por pedido realizado</p>
          </div>

          <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-4);">
            <span style="font-size:var(--fs-xs);color:var(--color-text-secondary);text-transform:uppercase;font-weight:600;">LTV (Valor por Cliente)</span>
            <h3 style="font-size:1.5rem;color:#81C784;margin-top:4px;">${formatPrice(metrics.ltv)}</h3>
            <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;">Receita média gerada por cliente cadastrado</p>
          </div>

          <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-4);">
            <span style="font-size:var(--fs-xs);color:var(--color-text-secondary);text-transform:uppercase;font-weight:600;">Taxa de Recompra</span>
            <h3 style="font-size:1.5rem;color:#64B5F6;margin-top:4px;">${metrics.retentionRate.toFixed(1)}%</h3>
            <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;">${metrics.recurringCustomers} cliente(s) fizeram mais de 1 pedido</p>
          </div>

          <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-4);">
            <span style="font-size:var(--fs-xs);color:var(--color-text-secondary);text-transform:uppercase;font-weight:600;">Faturamento em Risco</span>
            <h3 style="font-size:1.5rem;color:#E57373;margin-top:4px;">${formatPrice(metrics.abandonedRevenueAtRisk)}</h3>
            <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;">${metrics.abandonedCartsCount} carrinho(s) abandonado(s) a recuperar</p>
          </div>
        </div>

        <!-- Curva ABC de Produtos (Engenharia de Cardápio) -->
        <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--space-5);">
          <h3 style="color:var(--color-cream);font-size:var(--fs-lg);margin-bottom:var(--space-3);"><i class="ph ph-trophy" style="color:var(--color-accent);"></i> Curva ABC - Ranking de Rentabilidade dos Produtos</h3>
          ${metrics.abcCurve.length === 0 ? '<p style="color:var(--color-text-muted);font-size:0.85rem;">Sem dados de vendas suficientes ainda.</p>' : `
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${metrics.abcCurve.map((p, idx) => {
                const badgeColor = p.categoryClass === 'A' ? '#81C784' : p.categoryClass === 'B' ? '#64B5F6' : '#E57373';
                return `
                  <div style="display:flex;align-items:center;justify-content:space-between;background:var(--color-bg-deep);padding:10px 14px;border-radius:8px;font-size:var(--fs-sm);">
                    <div style="display:flex;align-items:center;gap:12px;">
                      <span style="background:${badgeColor};color:#110D09;font-weight:700;font-size:0.75rem;padding:2px 8px;border-radius:12px;">Classe ${p.categoryClass}</span>
                      <strong style="color:var(--color-cream);">${idx + 1}. ${escapeHTML(p.name)}</strong>
                      <span style="color:var(--color-text-secondary);font-size:0.75rem;">(${p.qty} un. vendidas)</span>
                    </div>
                    <div style="text-align:right;">
                      <strong style="color:var(--color-accent);">${formatPrice(p.revenue)}</strong>
                      <span style="font-size:0.75rem;color:var(--color-text-muted);display:block;">${p.share.toFixed(1)}% da receita</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Heatmap / Distribuição de Vendas por Horário -->
        <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--space-5);">
          <h3 style="color:var(--color-cream);font-size:var(--fs-lg);margin-bottom:var(--space-3);"><i class="ph ph-clock-counter-clockwise" style="color:var(--color-accent);"></i> Horários de Pico (Distribuição das 00h às 23h)</h3>
          <div style="display:flex;align-items:flex-end;gap:4px;height:120px;padding-top:20px;border-bottom:1px solid var(--color-border);">
            ${metrics.hourlyDistribution.map((count, hr) => {
              const heightPct = (count / hourlyMax) * 100;
              return `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end;" title="${hr}h: ${count} pedido(s)">
                  <span style="font-size:9px;color:var(--color-text-muted);">${count > 0 ? count : ''}</span>
                  <div style="width:100%;height:${Math.max(4, heightPct)}%;background:${count > 0 ? 'var(--color-accent)' : 'rgba(212,165,116,0.1)'};border-radius:3px 3px 0 0;"></div>
                  <span style="font-size:9px;color:var(--color-text-secondary);">${hr}h</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  } else if (activeTab === 'marketing') {
    contentHTML = `
      <div class="admin-marketing-dashboard" style="display:flex;flex-direction:column;gap:var(--space-6);">
        
        <!-- Recuperador Ativo de Carrinho Abandonado via WhatsApp -->
        <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--space-5);">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:var(--space-3);">
            <i class="ph ph-whatsapp-logo" style="font-size:1.8rem;color:#25D366;"></i>
            <div>
              <h3 style="color:var(--color-cream);font-size:var(--fs-lg);margin:0;">Disparador de Recuperação de Vendas no WhatsApp</h3>
              <p style="font-size:var(--fs-xs);color:var(--color-text-secondary);margin:0;">Envie mensagens personalizadas com 1 clique para converter visitantes indecisos</p>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            ${visitors.filter(v => v.cartItemsCount > 0 && !v.converted).length === 0 ? `
              <p style="color:var(--color-text-muted);font-size:0.85rem;">Nenhum carrinho pendente de recuperação no momento.</p>
            ` : visitors.filter(v => v.cartItemsCount > 0 && !v.converted).map(v => {
              const waText = `Olá! Notamos que você separou ${v.cartItemsCount} delicioso(s) item(ns) na Quitandas Farm House! 🍲😋 Gostaria de concluir seu pedido para entrega rápida? Acesse agora: https://quitandasfarmhouse.com.br/#/checkout`;
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;background:var(--color-bg-deep);padding:12px 16px;border-radius:10px;flex-wrap:wrap;gap:10px;">
                  <div>
                    <strong style="color:var(--color-cream);">${escapeHTML(v.device)}</strong>
                    <span style="font-size:0.75rem;color:var(--color-text-secondary);display:block;">${v.cartItemsCount} item(ns) na sacola • Total: ${formatPrice(v.cartTotal || 0)}</span>
                  </div>
                  <a href="https://wa.me/?text=${encodeURIComponent(waText)}" target="_blank" class="btn btn--primary btn--sm" style="background:#25D366;border-color:#25D366;color:#110D09;gap:6px;">
                    <i class="ph ph-paper-plane-tilt"></i> Enviar Oferta WhatsApp
                  </a>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Gestão de Cupons Ativos -->
        <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--space-5);">
          <h3 style="color:var(--color-cream);font-size:var(--fs-lg);margin-bottom:var(--space-3);"><i class="ph ph-ticket" style="color:var(--color-accent);"></i> Cupons Promocionais Ativos</h3>
          
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:var(--space-3);">
            ${COUPONS.map(c => `
              <div style="background:var(--color-bg-deep);border:1px dashed var(--color-accent);border-radius:10px;padding:12px 16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="color:var(--color-accent);font-size:1.1rem;">${c.code}</strong>
                  <span style="font-size:0.75rem;background:rgba(200,133,76,0.15);color:var(--color-accent);padding:2px 8px;border-radius:12px;">${c.label}</span>
                </div>
                <p style="font-size:0.75rem;color:var(--color-text-secondary);margin-top:4px;">Tipo: ${c.type === 'percent' ? `${c.value}% OFF` : `R$ ${c.value} OFF`}</p>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  } else if (activeTab === 'customers') {
    if (customers.length === 0) {
      contentHTML = `
        <div class="admin-empty">
          <i class="ph ph-users admin-empty__icon"></i>
          <p class="admin-empty__text">Nenhum cliente cadastrado ainda</p>
          <p style="color:var(--color-text-muted);font-size:0.85rem;margin-top:4px;">Assim que os clientes se cadastrarem ou realizarem pedidos, eles aparecerão aqui com acesso direto ao WhatsApp.</p>
        </div>
      `;
    } else {
      contentHTML = `
        <div class="admin-customers-list" style="display:flex;flex-direction:column;gap:var(--space-3);">
          ${customers.map(c => {
            const nameEsc = escapeHTML(c.name || 'Cliente');
            const phoneEsc = escapeHTML(c.phone || 'Sem telefone');
            const emailEsc = escapeHTML(c.email || '');
            const addrEsc = escapeHTML(c.address || 'Endereço não informado');
            const refEsc = escapeHTML(c.reference || '');
            const methodEsc = escapeHTML(c.loginMethod || 'Cadastro');
            const totalSpent = c.totalSpent || 0;
            const ordersCount = c.ordersCount || 0;
            const cleanPhone = (c.phone || '').replace(/\D/g, '');
            const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

            return `
              <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-4);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-3);">
                  <div style="display:flex;align-items:center;gap:var(--space-3);">
                    <div style="width:42px;height:42px;border-radius:50%;background:var(--color-accent-soft);color:var(--color-accent);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;">
                      ${nameEsc.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style="font-size:var(--fs-md);font-weight:600;color:var(--color-cream);margin:0;">${nameEsc}</h3>
                      <span style="font-size:0.75rem;color:var(--color-text-secondary);background:rgba(212,165,116,0.1);padding:2px 8px;border-radius:12px;margin-top:2px;display:inline-block;">${methodEsc}</span>
                    </div>
                  </div>
                  
                  <div style="text-align:right;">
                    <span style="font-size:var(--fs-xs);color:var(--color-text-muted);display:block;">${ordersCount} pedido(s)</span>
                    <strong style="color:var(--color-accent);font-size:var(--fs-md);">${formatPrice(totalSpent)}</strong>
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:var(--space-2);font-size:var(--fs-sm);color:var(--color-text-secondary);background:var(--color-bg-deep);padding:var(--space-3);border-radius:var(--radius-md);">
                  <div>
                    <i class="ph ph-whatsapp-logo" style="color:#25D366;"></i> <strong>WhatsApp:</strong> 
                    ${waLink ? `<a href="${waLink}" target="_blank" style="color:#81C784;text-decoration:underline;">${phoneEsc}</a>` : phoneEsc}
                  </div>
                  ${emailEsc ? `<div><i class="ph ph-envelope"></i> <strong>E-mail:</strong> ${emailEsc}</div>` : ''}
                  <div><i class="ph ph-map-pin"></i> <strong>Endereço:</strong> ${addrEsc} ${refEsc ? `(Ref: ${refEsc})` : ''}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  } else if (activeTab === 'visitors') {
    if (visitors.length === 0) {
      contentHTML = `
        <div class="admin-empty">
          <i class="ph ph-eye admin-empty__icon"></i>
          <p class="admin-empty__text">Nenhum visitante registrado ainda</p>
          <p style="color:var(--color-text-muted);font-size:0.85rem;margin-top:4px;">Assim que as pessoas acessarem o site sem cadastro, as sessões e produtos de interesse aparecerão aqui em tempo real.</p>
        </div>
      `;
    } else {
      contentHTML = `
        <div class="admin-visitors-list" style="display:flex;flex-direction:column;gap:var(--space-3);">
          ${visitors.map(v => {
            const deviceEsc = escapeHTML(v.device || 'Dispositivo Web');
            const pageViews = v.pageViews || 1;
            const lastActiveDate = v.lastActive ? new Date(v.lastActive).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Agora';
            const itemsViewed = (v.itemsViewed || []).map(i => escapeHTML(i)).join(', ');
            
            let statusBadge = `<span style="background:rgba(168,144,128,0.15);color:var(--color-text-secondary);padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;"><i class="ph ph-eye"></i> Navegando sem Cadastro</span>`;
            if (v.converted) {
              statusBadge = `<span style="background:rgba(129,199,132,0.2);color:#81C784;padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;"><i class="ph ph-check-circle"></i> Converteu em Pedido (${escapeHTML(v.userIdentified || 'Cliente')})</span>`;
            } else if (v.cartItemsCount > 0) {
              statusBadge = `<span style="background:rgba(229,115,115,0.2);color:#E57373;padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;"><i class="ph ph-shopping-bag"></i> Carrinho Abandonado (${v.cartItemsCount} item(ns))</span>`;
            }

            return `
              <div class="admin-card" style="background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-4);">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-2);">
                  <div style="display:flex;align-items:center;gap:var(--space-2);">
                    <i class="ph ${v.device.includes('Smartphone') ? 'ph-device-mobile' : 'ph-desktop'}" style="font-size:1.4rem;color:var(--color-accent);"></i>
                    <strong style="color:var(--color-cream);font-size:var(--fs-sm);">${deviceEsc}</strong>
                  </div>
                  <div>${statusBadge}</div>
                </div>

                <div style="font-size:var(--fs-xs);color:var(--color-text-secondary);display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-2);">
                  <span><i class="ph ph-clock"></i> Último acesso: <strong>${lastActiveDate}</strong></span>
                  <span><i class="ph ph-browsers"></i> Páginas vistas: <strong>${pageViews}</strong></span>
                  ${itemsViewed ? `<span style="width:100%;margin-top:2px;"><i class="ph ph-cube"></i> Produtos de interesse: <strong style="color:var(--color-cream-soft);">${itemsViewed}</strong></span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  return `
    <div class="admin-screen">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Painel Gestor</h1>
          <p class="admin-subtitle">${STORE_CONFIG.name} • Lima Duarte</p>
        </div>
        <button class="btn btn--ghost btn--sm" id="btn-admin-logout">Sair</button>
      </div>

      <!-- Store Control -->
      <div class="store-control">
        <div class="store-control__info">
          <span class="store-control__label">Status da Loja</span>
          <span class="store-control__status">${isOpen ? 'Aberta para pedidos' : 'Fechada'}</span>
        </div>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
          <button class="btn btn--secondary btn--sm" id="btn-ping-supabase" title="Manter Supabase Ativo 24/7"><i class="ph ph-lightning" style="color:var(--color-accent);"></i> Ping Supabase</button>
          <button class="btn btn--secondary btn--sm" id="btn-test-sound" title="Testar Som da Campainha"><i class="ph ph-speaker-high"></i> Testar Som</button>
          <div class="toggle-switch ${isOpen ? 'active' : ''}" id="store-toggle"></div>
        </div>
      </div>

      <!-- Stats -->
      <div class="admin-stats">
        <div class="admin-stat-card">
          <div class="admin-stat__value">${todayOrders}</div>
          <div class="admin-stat__label">Pedidos Hoje</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat__value">${customers.length}</div>
          <div class="admin-stat__label">Clientes Cadastrados</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat__value">${visitors.length}</div>
          <div class="admin-stat__label">Visitantes no Site</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat__value">${abandonedCartsCount}</div>
          <div class="admin-stat__label">Carrinhos em Aberto</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button class="admin-tab ${activeTab === 'orders' ? 'active' : ''}" data-admin-tab="orders"><i class="ph ph-receipt"></i> Pedidos (${totalOrders})</button>
        <button class="admin-tab ${activeTab === 'analytics' ? 'active' : ''}" data-admin-tab="analytics"><i class="ph ph-chart-line-up"></i> Financeiro & DRE</button>
        <button class="admin-tab ${activeTab === 'marketing' ? 'active' : ''}" data-admin-tab="marketing"><i class="ph ph-megaphone"></i> Marketing & Cupons</button>
        <button class="admin-tab ${activeTab === 'customers' ? 'active' : ''}" data-admin-tab="customers"><i class="ph ph-users"></i> Clientes (${customers.length})</button>
        <button class="admin-tab ${activeTab === 'visitors' ? 'active' : ''}" data-admin-tab="visitors"><i class="ph ph-eye"></i> Visitantes (${visitors.length})</button>
        <button class="admin-tab ${activeTab === 'products' ? 'active' : ''}" data-admin-tab="products"><i class="ph ph-bowl-food"></i> Cardápio (${allProducts.length})</button>
      </div>

      ${contentHTML}

      <button class="btn btn--ghost" id="btn-back-home" style="width:100%;margin-top:var(--space-6);">
        ← Voltar ao Cardápio
      </button>
    </div>
  `;
}

function renderAdminOrderCard(order) {
  const statusObj = ORDER_STATUSES.find(s => s.id === order.status);
  const statusIdx = ORDER_STATUSES.findIndex(s => s.id === order.status);
  const nextStatus = statusIdx < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[statusIdx + 1] : null;
  const badgeClass = `admin-order__status-badge--${order.status}`;

  const itemsList = order.items.map(i =>
    `<li>${i.quantity}x ${i.name}${i.selectedSize ? ` (${i.selectedSize.name})` : ''}</li>`
  ).join('');

  // WhatsApp message
  const whatsappMsg = encodeURIComponent(
    `Olá! Seu pedido ${order.code} da Quitandas Farm House ${
      order.status === 'preparing' ? 'está sendo preparado!' :
      order.status === 'delivery' ? 'saiu para entrega!' :
      order.status === 'done' ? 'foi entregue! Obrigado pela preferência!' :
      'foi recebido!'
    }`
  );
  const whatsappLink = `https://wa.me/55${order.customer?.phone?.replace(/\D/g, '') || ''}?text=${whatsappMsg}`;

  return `
    <div class="admin-order-card">
      <div class="admin-order__header">
        <span class="admin-order__code">${order.code}</span>
        <span class="admin-order__status-badge ${badgeClass}">
          ${statusObj?.icon ? `<i class="ph ${statusObj.icon}"></i>` : ''} ${statusObj?.label || order.status}
        </span>
      </div>
      <p class="admin-order__customer"><i class="ph ph-user"></i> ${escapeHTML(order.customer?.name || 'Cliente')}</p>
      <p class="admin-order__address"><i class="ph ph-map-pin"></i> ${escapeHTML(order.address || 'Retirada no Balcão')}</p>
      <p class="admin-order__time">⏰ ${formatDate(order.createdAt)}</p>
      <ul class="admin-order__items">${itemsList}</ul>
      <div class="admin-order__footer">
        <span class="admin-order__total">${formatPrice(order.total)}</span>
        <div class="admin-order__actions">
          ${order.customer?.phone ? `
            <a href="${whatsappLink}" target="_blank" rel="noopener" class="admin-btn-whatsapp" title="Enviar WhatsApp">
              <i class="ph ph-whatsapp-logo"></i>
            </a>
            <button class="admin-btn-advance btn-next-status" data-code="${order.code}">
              Avançar Status →
            </button>
          ` : `<span style="font-size:var(--fs-sm);color:var(--color-status-done-txt);">Concluído</span>`}
        </div>
      </div>
    </div>
  `;
}

// ── IntersectionObserver for scroll animations ──

export function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.anim-fade-in-up, .anim-scale-in, .anim-slide-right').forEach(el => {
    observer.observe(el);
  });
}
