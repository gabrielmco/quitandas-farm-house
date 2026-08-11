/* ============================================
   QUITANDAS FARM HOUSE - STATE MANAGER
   localStorage-based reactive store
   ============================================ */

import { PRODUCTS, ADDONS } from './data.js';

const KEYS = {
  CART: 'qfh_cart',
  USER: 'qfh_user',
  ORDERS: 'qfh_orders',
  ADMIN: 'qfh_admin',
  STORE_OPEN: 'qfh_store_open',
  PRODUCTS_STATE: 'qfh_products_state',
  VISITORS: 'qfh_visitors',
  CUSTOMERS: 'qfh_customers',
  TARGET_GOAL: 'qfh_target_goal',
};

class Store {
  constructor() {
    this.listeners = new Map();
  }

  // ── Generic get/set ──

  _get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    this._emit(key, value);
  }

  // ── Event System ──

  on(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => this.listeners.get(key).delete(callback);
  }

  _emit(key, value) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(cb => cb(value));
    }
  }

  // ── Cart ──

  getCart() {
    return this._get(KEYS.CART, []);
  }

  setCart(cart) {
    this._set(KEYS.CART, cart);
  }

  addToCart(item) {
    const cart = this.getCart();
    
    const canonicalProduct = PRODUCTS.find(p => p.id === item.id);
    if (!canonicalProduct) return cart;
    
    let verifiedSize = null;
    if (canonicalProduct.hasSize && item.selectedSize) {
      verifiedSize = canonicalProduct.sizes.find(s => s.id === item.selectedSize.id);
    }
    
    let verifiedAddons = [];
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      item.selectedAddons.forEach(addonInput => {
        const match = ADDONS.find(a => a.id === addonInput.id);
        if (match) verifiedAddons.push(match);
      });
    }

    const safeItem = {
      id: canonicalProduct.id,
      name: canonicalProduct.name,
      image: canonicalProduct.image,
      price: canonicalProduct.price,
      hasSize: canonicalProduct.hasSize,
      selectedSize: verifiedSize,
      selectedAddons: verifiedAddons,
      observations: item.observations ? String(item.observations).substring(0, 500) : '',
      quantity: Math.max(1, parseInt(item.quantity) || 1)
    };

    const key = this._cartItemKey(safeItem);
    const existing = cart.find(i => this._cartItemKey(i) === key);
    if (existing) {
      existing.quantity += safeItem.quantity;
    } else {
      cart.push({ ...safeItem, cartKey: key });
    }
    this.setCart(cart);
    return cart;
  }

  removeFromCart(cartKey) {
    const cart = this.getCart().filter(i => i.cartKey !== cartKey);
    this.setCart(cart);
    return cart;
  }

  updateCartItemQty(cartKey, qty) {
    const cart = this.getCart();
    const item = cart.find(i => i.cartKey === cartKey);
    if (item) {
      item.quantity = Math.max(1, qty);
    }
    this.setCart(cart);
    return cart;
  }

  clearCart() {
    this.setCart([]);
  }

  getCartCount() {
    return this.getCart().reduce((sum, i) => sum + i.quantity, 0);
  }

  getCartSubtotal() {
    return this.getCart().reduce((sum, item) => {
      let itemPrice = item.selectedSize ? item.selectedSize.price : item.price;
      const addonsPrice = (item.selectedAddons || []).reduce((s, a) => s + a.price, 0);
      return sum + (itemPrice + addonsPrice) * item.quantity;
    }, 0);
  }

  _cartItemKey(item) {
    if (item.cartKey) return item.cartKey;
    const sizeKey = item.selectedSize ? item.selectedSize.id : 'default';
    const addonsKey = (item.selectedAddons || []).map(a => a.id).sort().join(',');
    return `${item.id}_${sizeKey}_${addonsKey}`;
  }

  // ── User ──

  getUser() {
    return this._get(KEYS.USER, null);
  }

  setUser(user) {
    this._set(KEYS.USER, user);
  }

  logout() {
    localStorage.removeItem(KEYS.USER);
    this._emit(KEYS.USER, null);
  }

  isLoggedIn() {
    return !!this.getUser();
  }

  // ── Orders ──

  getOrders() {
    return this._get(KEYS.ORDERS, []);
  }

  getOrderByCode(code) {
    return this.getOrders().find(o => o.code === code);
  }

  getUserOrders(userId) {
    return this.getOrders().filter(o => o.userId === userId);
  }

  addOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    this._set(KEYS.ORDERS, orders);
    return order;
  }

  updateOrderStatus(code, status) {
    const orders = this.getOrders();
    const order = orders.find(o => o.code === code);
    if (order) {
      order.status = status;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status,
        timestamp: new Date().toISOString()
      });
      this._set(KEYS.ORDERS, orders);
    }
    return order;
  }

  generateOrderCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '#';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ── Admin ──

  getAdmin() {
    return this._get(KEYS.ADMIN, null);
  }

  setAdmin(admin) {
    this._set(KEYS.ADMIN, admin);
  }

  isAdminLoggedIn() {
    return !!this.getAdmin();
  }

  logoutAdmin() {
    localStorage.removeItem(KEYS.ADMIN);
    this._emit(KEYS.ADMIN, null);
  }

  // ── Store Status ──

  isStoreOpen() {
    const manual = this._get(KEYS.STORE_OPEN, null);
    if (manual !== null) return manual;
    // Auto-check by schedule
    return this._isWithinSchedule();
  }

  setStoreOpen(isOpen) {
    this._set(KEYS.STORE_OPEN, isOpen);
  }

  _isWithinSchedule() {
    const now = new Date();
    const day = now.getDay(); // 0=Dom, 1=Seg, ..., 5=Sex, 6=Sáb
    const hour = now.getHours();
    // Horário padrão: Segunda a Sexta, 17h às 22h
    const days = [1, 2, 3, 4, 5];
    const open = 17;
    const close = 22;
    return days.includes(day) && hour >= open && hour < close;
  }

  // ── Products Availability ──

  getProductsState() {
    return this._get(KEYS.PRODUCTS_STATE, {});
  }

  setProductAvailability(productId, available) {
    const state = this.getProductsState();
    state[productId] = available;
    this._set(KEYS.PRODUCTS_STATE, state);
  }

  isProductAvailable(product) {
    const state = this.getProductsState();
    if (state[product.id] !== undefined) {
      return state[product.id];
    }
    return product.available;
  }

  // ── Visitors Tracking (Visitantes sem Cadastro) ──

  getVisitorSessionId() {
    let sid = sessionStorage.getItem('qfh_sid');
    if (!sid) {
      sid = 'v_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('qfh_sid', sid);
    }
    return sid;
  }

  getVisitors() {
    return this._get(KEYS.VISITORS, []);
  }

  trackVisitorAction(actionType = 'page_view', data = {}) {
    try {
      const sid = this.getVisitorSessionId();
      const visitors = this.getVisitors();
      let session = visitors.find(v => v.sessionId === sid);

      const ua = navigator.userAgent;
      const isMobile = /Mobi|Android|iPhone/i.test(ua);
      const deviceType = isMobile ? 'Smartphone Mobile' : 'Desktop / PC';
      const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Navegador Web';

      const now = new Date().toISOString();

      if (!session) {
        session = {
          sessionId: sid,
          device: `${deviceType} (${browser})`,
          firstVisit: now,
          lastActive: now,
          pageViews: 1,
          itemsViewed: [],
          cartItemsCount: 0,
          cartTotal: 0,
          converted: false,
          userIdentified: null
        };
        visitors.unshift(session);
      } else {
        session.lastActive = now;
        if (actionType === 'page_view') {
          session.pageViews = (session.pageViews || 0) + 1;
        }
      }

      if (actionType === 'view_product' && data.productName) {
        session.itemsViewed = session.itemsViewed || [];
        if (!session.itemsViewed.includes(data.productName)) {
          session.itemsViewed.push(data.productName);
        }
      }

      if (actionType === 'update_cart') {
        session.cartItemsCount = data.cartCount || 0;
        session.cartTotal = data.cartTotal || 0;
      }

      if (actionType === 'order_placed') {
        session.converted = true;
        if (data.customerName) {
          session.userIdentified = data.customerName;
        }
      }

      // Limita histórico aos últimos 150 acessos
      const trimmed = visitors.slice(0, 150);
      this._set(KEYS.VISITORS, trimmed);
    } catch (e) {
      // Ignora silenciosamente se o acesso ao localStorage for bloqueado
    }
  }

  // ── Registered Customers (Clientes Cadastrados) ──

  getCustomers() {
    const storedCustomers = this._get(KEYS.CUSTOMERS, []);
    const orders = this.getOrders();
    const currentUser = this.getUser();

    const customerMap = new Map();

    // 1. Popula cadastros salvos
    storedCustomers.forEach(c => {
      const key = c.id || c.phone || c.name;
      customerMap.set(key, {
        ...c,
        ordersCount: 0,
        totalSpent: 0,
      });
    });

    // 2. Popula usuário logado atual
    if (currentUser) {
      const key = currentUser.id || currentUser.phone || currentUser.name;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: currentUser.id,
          name: currentUser.name || 'Cliente Sem Nome',
          phone: currentUser.phone || '',
          email: currentUser.email || '',
          address: currentUser.address || '',
          reference: currentUser.reference || '',
          loginMethod: currentUser.loginMethod || (currentUser.isGuest ? 'Modo Rápido' : 'Manual'),
          createdAt: new Date().toISOString(),
          ordersCount: 0,
          totalSpent: 0
        });
      }
    }

    // 3. Agrega histórico de pedidos nos perfis
    orders.forEach(order => {
      const key = order.userId || order.customer?.phone || order.customer?.name || 'anonymous';
      let c = customerMap.get(key);
      if (!c) {
        c = {
          id: order.userId || 'cust_' + Date.now(),
          name: order.customer?.name || 'Cliente Checkout',
          phone: order.customer?.phone || '',
          email: order.customer?.email || '',
          address: order.address || '',
          reference: order.reference || '',
          loginMethod: order.deliveryType === 'pickup' ? 'Retirada Balcão' : 'Pedido Delivery',
          createdAt: order.createdAt,
          ordersCount: 0,
          totalSpent: 0
        };
        customerMap.set(key, c);
      }
      c.ordersCount = (c.ordersCount || 0) + 1;
      c.totalSpent = (c.totalSpent || 0) + (order.total || 0);
      c.lastOrderAt = order.createdAt;
    });

    return Array.from(customerMap.values());
  }

  registerCustomer(userData) {
    if (!userData) return;
    const customers = this._get(KEYS.CUSTOMERS, []);
    const existingIdx = customers.findIndex(c => (userData.id && c.id === userData.id) || (userData.phone && c.phone === userData.phone));

    const customerObj = {
      id: userData.id || 'cust_' + Date.now(),
      name: userData.name || 'Cliente',
      phone: userData.phone || '',
      email: userData.email || '',
      address: userData.address || '',
      reference: userData.reference || '',
      loginMethod: userData.loginMethod || (userData.isGuest ? 'Modo Rápido' : 'Manual'),
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      customers[existingIdx] = { ...customers[existingIdx], ...customerObj };
    } else {
      customers.unshift(customerObj);
    }
    this._set(KEYS.CUSTOMERS, customers);
  }

  // ── Financial & Business Intelligence Engine (DRE & KPIs) ──

  getTargetGoal() {
    return this._get(KEYS.TARGET_GOAL, 15000.00);
  }

  setTargetGoal(goal) {
    this._set(KEYS.TARGET_GOAL, Math.max(100, parseFloat(goal) || 15000.00));
  }

  getFinancialMetrics() {
    const orders = this.getOrders();
    const customers = this.getCustomers();
    const visitors = this.getVisitors();
    const targetGoal = this.getTargetGoal();

    const totalOrdersCount = orders.length;
    const grossRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const subtotalRevenue = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const deliveryFeesTotal = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    // CMV Estimado artesanal (38% da receita dos produtos)
    const cmvRate = 0.38;
    const cmvTotal = subtotalRevenue * cmvRate;
    const grossProfit = grossRevenue - cmvTotal;
    const netProfitMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

    const averageOrderValue = totalOrdersCount > 0 ? grossRevenue / totalOrdersCount : 0;

    // LTV (Lifetime Value)
    const totalCustomersCount = customers.length || 1;
    const ltv = grossRevenue / totalCustomersCount;

    // Taxa de Recompra (Retention Rate)
    const recurringCustomers = customers.filter(c => c.ordersCount > 1).length;
    const retentionRate = totalCustomersCount > 0 ? (recurringCustomers / totalCustomersCount) * 100 : 0;

    // Taxa de Conversão de Funil
    const totalVisitorsCount = Math.max(visitors.length, totalOrdersCount, 1);
    const conversionRate = (totalOrdersCount / totalVisitorsCount) * 100;

    // Carrinhos Abandonados & Faturamento em Risco
    const abandonedSessions = visitors.filter(v => v.cartItemsCount > 0 && !v.converted);
    const abandonedCartsCount = abandonedSessions.length;
    const abandonedRevenueAtRisk = abandonedSessions.reduce((sum, v) => sum + (v.cartTotal || 0), 0);

    // Meta Mensal
    const goalProgressPercent = Math.min(100, (grossRevenue / targetGoal) * 100);

    // Curva ABC de Produtos
    const productSalesMap = new Map();
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const pName = item.name;
        const pTotal = (item.price || 0) * (item.quantity || 1);
        const current = productSalesMap.get(pName) || { name: pName, revenue: 0, qty: 0 };
        current.revenue += pTotal;
        current.qty += (item.quantity || 1);
        productSalesMap.set(pName, current);
      });
    });

    const sortedProducts = Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue);
    let accumRevenue = 0;
    const abcCurve = sortedProducts.map(p => {
      accumRevenue += p.revenue;
      const accumPercent = grossRevenue > 0 ? (accumRevenue / grossRevenue) * 100 : 0;
      let categoryClass = 'A';
      if (accumPercent > 90) categoryClass = 'C';
      else if (accumPercent > 70) categoryClass = 'B';
      return { ...p, categoryClass, share: grossRevenue > 0 ? (p.revenue / grossRevenue) * 100 : 0 };
    });

    // Heatmap de Vendas por Horário (0h às 23h)
    const hourlyDistribution = Array(24).fill(0);
    orders.forEach(o => {
      if (o.createdAt) {
        const hour = new Date(o.createdAt).getHours();
        hourlyDistribution[hour] += 1;
      }
    });

    return {
      grossRevenue,
      subtotalRevenue,
      deliveryFeesTotal,
      cmvTotal,
      grossProfit,
      netProfitMargin,
      totalOrdersCount,
      averageOrderValue,
      ltv,
      retentionRate,
      recurringCustomers,
      conversionRate,
      abandonedCartsCount,
      abandonedRevenueAtRisk,
      targetGoal,
      goalProgressPercent,
      abcCurve,
      hourlyDistribution
    };
  }

  // ── CSV Export Tools ──

  exportFinancialReportCSV() {
    const orders = this.getOrders();
    if (orders.length === 0) return false;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Codigo;Data;Cliente;Telefone;Tipo;Entrega;Pagamento;Subtotal;TaxaEntrega;Total;Status\n';

    orders.forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString('pt-BR');
      const row = [
        o.code || '',
        dateStr,
        `"${(o.customer?.name || '').replace(/"/g, '""')}"`,
        `"${o.customer?.phone || ''}"`,
        o.deliveryType === 'pickup' ? 'Retirada' : 'Delivery',
        `"${(o.address || '').replace(/"/g, '""')}"`,
        `"${o.paymentLabel || ''}"`,
        (o.subtotal || 0).toFixed(2).replace('.', ','),
        (o.deliveryFee || 0).toFixed(2).replace('.', ','),
        (o.total || 0).toFixed(2).replace('.', ','),
        o.status || ''
      ].join(';');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Financeiro_Quitandas_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  exportCustomersCSV() {
    const customers = this.getCustomers();
    if (customers.length === 0) return false;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Nome;Telefone;Email;Endereco;Referencia;Metodo;Pedidos;TotalGasto;DataCadastro\n';

    customers.forEach(c => {
      const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '';
      const row = [
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${c.phone || ''}"`,
        `"${c.email || ''}"`,
        `"${(c.address || '').replace(/"/g, '""')}"`,
        `"${(c.reference || '').replace(/"/g, '""')}"`,
        c.loginMethod || '',
        c.ordersCount || 0,
        (c.totalSpent || 0).toFixed(2).replace('.', ','),
        dateStr
      ].join(';');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Base_Clientes_Quitandas_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
}

// Singleton
export const store = new Store();
export { KEYS };
