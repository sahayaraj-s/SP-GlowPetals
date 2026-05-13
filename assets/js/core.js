/**
 * SP GlowPetals — Core JavaScript
 * Handles: Theme, LocalStorage, Toast, Scroll Reveal, Back-to-top
 */

'use strict';

/* ============================================================
   THEME MANAGER
   ============================================================ */
const ThemeManager = (() => {
  const THEMES = ['light', 'dark', 'premium'];
  const KEY = 'spgp_theme';

  function getTheme() {
    return localStorage.getItem(KEY) || 'light';
  }

  function apply(theme) {
    if (!THEMES.includes(theme)) theme = 'light';
    document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
    localStorage.setItem(KEY, theme);
    document.querySelectorAll('.theme-option').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === theme);
    });
  }

  function init() {
    apply(getTheme());

    // Theme toggle dropdown
    const btn = document.getElementById('theme-btn');
    const dropdown = document.getElementById('theme-dropdown');
    if (btn && dropdown) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
      document.addEventListener('click', () => dropdown.classList.remove('open'));
      document.querySelectorAll('.theme-option').forEach(el => {
        el.addEventListener('click', () => {
          apply(el.dataset.theme);
          dropdown.classList.remove('open');
        });
      });
    }
  }

  return { init, apply, getTheme };
})();

/* ============================================================
   LOCAL STORAGE DATA LAYER
   ============================================================ */
const DB = (() => {
  const PREFIX = 'spgp_';

  function get(key) {
    try {
      const val = localStorage.getItem(PREFIX + key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch { return false; }
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  // ---- Products ----
  function getProducts() { return get('products') || []; }
  function setProducts(products) { return set('products', products); }
  function addProduct(product) {
    const products = getProducts();
    product.id = Date.now().toString();
    product.createdAt = new Date().toISOString();
    products.unshift(product);
    setProducts(products);
    return product;
  }
  function updateProduct(id, updates) {
    const products = getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() };
    setProducts(products);
    return products[idx];
  }
  function deleteProduct(id) {
    const products = getProducts().filter(p => p.id !== id);
    setProducts(products);
  }
  function getProduct(id) {
    return getProducts().find(p => p.id === id) || null;
  }

  // ---- Categories ----
  function getCategories() {
    return get('categories') || [
      { id: '1', name: 'Gift Candles', slug: 'candles', description: 'Luxury scented candles' },
      { id: '2', name: 'Flowers', slug: 'flowers', description: 'Fresh & preserved flowers' },
      { id: '3', name: 'Gift Items', slug: 'gifts', description: 'Curated gift sets' },
      { id: '4', name: 'Surprise Boxes', slug: 'surprise-boxes', description: 'Mystery gift boxes' },
      { id: '5', name: 'Romantic Gifts', slug: 'romantic', description: 'Gifts for loved ones' },
      { id: '6', name: 'Personalized', slug: 'personalized', description: 'Custom engraved gifts' },
      { id: '7', name: 'Decorative', slug: 'decorative', description: 'Home décor pieces' }
    ];
  }
  function setCategories(cats) { return set('categories', cats); }
  function addCategory(cat) {
    const cats = getCategories();
    cat.id = Date.now().toString();
    cats.push(cat);
    setCategories(cats);
    return cat;
  }
  function deleteCategory(id) {
    setCategories(getCategories().filter(c => c.id !== id));
  }

  // ---- Banners ----
  function getBanners() { return get('banners') || []; }
  function setBanners(banners) { return set('banners', banners); }
  function addBanner(banner) {
    const banners = getBanners();
    banner.id = Date.now().toString();
    banners.push(banner);
    setBanners(banners);
    return banner;
  }
  function updateBanner(id, updates) {
    const banners = getBanners();
    const idx = banners.findIndex(b => b.id === id);
    if (idx === -1) return false;
    banners[idx] = { ...banners[idx], ...updates };
    setBanners(banners);
    return banners[idx];
  }
  function deleteBanner(id) {
    setBanners(getBanners().filter(b => b.id !== id));
  }

  // ---- Cart ----
  function getCart() { return get('cart') || []; }
  function setCart(cart) { return set('cart', cart); }
  function addToCart(product, qty = 1) {
    const cart = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, product.stock || 99);
    } else {
      cart.push({ ...product, qty });
    }
    setCart(cart);
    updateCartBadge();
    return cart;
  }
  function updateCartQty(id, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    if (qty < 1) { removeFromCart(id); return; }
    item.qty = qty;
    setCart(cart);
    updateCartBadge();
  }
  function removeFromCart(id) {
    setCart(getCart().filter(i => i.id !== id));
    updateCartBadge();
  }
  function clearCart() { setCart([]); updateCartBadge(); }
  function getCartTotal() {
    return getCart().reduce((sum, i) => sum + (getDiscountedPrice(i) * i.qty), 0);
  }
  function getCartCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  // ---- Wishlist ----
  function getWishlist() { return get('wishlist') || []; }
  function setWishlist(wl) { return set('wishlist', wl); }
  function toggleWishlist(product) {
    const wl = getWishlist();
    const idx = wl.findIndex(i => i.id === product.id);
    if (idx === -1) {
      wl.push(product);
      setWishlist(wl);
      updateWishlistBadge();
      return true; // added
    } else {
      wl.splice(idx, 1);
      setWishlist(wl);
      updateWishlistBadge();
      return false; // removed
    }
  }
  function isWishlisted(id) {
    return getWishlist().some(i => i.id === id);
  }

  // ---- Orders ----
  function getOrders() { return get('orders') || []; }
function addOrder(order) {

  const orders = getOrders();

  const newOrder = {

    id: 'ORD-' + Date.now(),

    date: new Date().toISOString(),

    status: 'Pending',

    items: order.items || [],

    subtotal: order.subtotal || 0,

    shipping: order.shipping || 0,

    total: order.total || 0,

    paymentMethod: order.paymentMethod || 'whatsapp',

    address: {

      name: order.address?.name || '',

      phone: order.address?.phone || '',

      email: order.address?.email || '',

      line1: order.address?.line1 || '',

      city: order.address?.city || '',

      state: order.address?.state || '',

      pincode: order.address?.pincode || ''

    }

  };

  orders.unshift(newOrder);

  set('orders', orders);

  return newOrder;

}
  function updateOrderStatus(id, status) {
    const orders = getOrders();
    const o = orders.find(o => o.id === id);
    if (o) { o.status = status; set('orders', orders); }
  }

  // ---- Helpers ----
  function getDiscountedPrice(product) {
    if (product.discount > 0) {
      return product.price - (product.price * product.discount / 100);
    }
    return product.price;
  }

  function updateCartBadge() {
    const count = getCartCount();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
  function updateWishlistBadge() {
    const count = getWishlist().length;
    document.querySelectorAll('.wishlist-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function initBadges() {
    updateCartBadge();
    updateWishlistBadge();
  }

  return {
    get, set, remove,
    getProducts, setProducts, addProduct, updateProduct, deleteProduct, getProduct,
    getCategories, setCategories, addCategory, deleteCategory,
    getBanners, setBanners, addBanner, updateBanner, deleteBanner,
    getCart, setCart, addToCart, updateCartQty, removeFromCart, clearCart, getCartTotal, getCartCount,
    getWishlist, setWishlist, toggleWishlist, isWishlisted,
    getOrders, addOrder, updateOrderStatus,
    getDiscountedPrice, initBadges
  };
})();

/* ============================================================
   TOAST NOTIFICATION SYSTEM
   ============================================================ */
const Toast = (() => {
  function getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  function show(message, type = 'info', duration = 3500) {
    const container = getContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${ICONS[type] || 'ℹ️'}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return {
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    info: (msg, dur) => show(msg, 'info', dur),
    warning: (msg, dur) => show(msg, 'warning', dur)
  };
})();

/* ============================================================
   MODAL SYSTEM
   ============================================================ */
const Modal = (() => {
  function open(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close(id) {
    const overlay = id ? document.getElementById(id) : document.querySelector('.modal-overlay.active');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  function init() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) close();
      if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) close(overlay.id);
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }
  return { open, close, init };
})();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const ScrollReveal = (() => {
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  }
  return { init };
})();

/* ============================================================
   NAVBAR
   ============================================================ */
const Navbar = (() => {
  function init() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Scroll behavior
    function onScroll() {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
        navbar.classList.remove('transparent');
      } else {
        navbar.classList.remove('scrolled');
        navbar.classList.add('transparent');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Active link
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href && path.includes(href) && href !== '/') {
        link.classList.add('active');
      } else if ((path === '/' || path.endsWith('index.html')) && href === '../index.html') {
        link.classList.add('active');
      }
    });

    // Hamburger
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
      });
    }

    // Search overlay
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-overlay-input');
    if (searchBtn && searchOverlay) {
      searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput?.focus(), 100);
      });
      searchClose?.addEventListener('click', () => searchOverlay.classList.remove('active'));
      searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) searchOverlay.classList.remove('active');
      });
      searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = searchInput.value.trim();
          if (q) window.location.href = getPagePath('search') + '?q=' + encodeURIComponent(q);
        }
      });
    }

    // Cart toggle
    const cartBtn = document.getElementById('cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-drawer-overlay');
    const cartClose = document.getElementById('cart-drawer-close');
    if (cartBtn && cartDrawer) {
      cartBtn.addEventListener('click', () => {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        CartDrawer.render();
      });
      [cartOverlay, cartClose].forEach(el => {
        el?.addEventListener('click', closeCart);
      });
    }
    function closeCart() {
      cartDrawer?.classList.remove('open');
      cartOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  return { init };
})();

/* ============================================================
   CART DRAWER
   ============================================================ */
const CartDrawer = (() => {
  function formatPrice(p) { return '₹' + p.toLocaleString('en-IN', { maximumFractionDigits: 0 }); }

  function render() {
    const body = document.getElementById('cart-drawer-body');
    const footer = document.getElementById('cart-drawer-footer');
    if (!body) return;
    const cart = DB.getCart();
    if (cart.length === 0) {
      body.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Start adding beautiful gifts to your cart!</p>
          <a href="${getPagePath('shop')}" class="btn btn-primary btn-sm">Explore Shop</a>
        </div>`;
      if (footer) footer.innerHTML = '';
      return;
    }

    body.innerHTML = cart.map(item => {
      const price = DB.getDiscountedPrice(item);
      return `
        <div class="cart-drawer-item" data-id="${item.id}">
          <img src="${item.images?.[0] || ''}" alt="${item.name}" class="cart-drawer-img" onerror="this.style.display='none'">
          <div class="cart-drawer-details">
            <div class="cart-drawer-name">${item.name}</div>
            <div class="cart-drawer-price">${formatPrice(price)}</div>
            <div class="cart-drawer-qty-row">
              <div class="qty-control">
                <button class="qty-btn" onclick="CartDrawer.changeQty('${item.id}', ${item.qty - 1})">−</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" onclick="CartDrawer.changeQty('${item.id}', ${item.qty + 1})">+</button>
              </div>
              <button class="cart-drawer-remove" onclick="CartDrawer.remove('${item.id}')">Remove</button>
            </div>
          </div>
        </div>`;
    }).join('');

    const total = DB.getCartTotal();
    const count = DB.getCartCount();
    if (footer) {
      footer.innerHTML = `
        <div class="cart-total-row">
          <span>Subtotal (${count} items)</span>
          <span class="price">${formatPrice(total)}</span>
        </div>
        <a href="${getPagePath('cart')}" class="btn btn-secondary" style="width:100%;justify-content:center;margin-bottom:10px">View Cart</a>
        <a href="${getPagePath('checkout')}" class="btn btn-primary" style="width:100%;justify-content:center">Checkout</a>`;
    }
  }

  function changeQty(id, qty) {
    DB.updateCartQty(id, qty);
    render();
  }
  function remove(id) {
    DB.removeFromCart(id);
    render();
    Toast.info('Removed from cart');
  }

  return { render, changeQty, remove };
})();

/* ============================================================
   BACK TO TOP + WHATSAPP FLOAT
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      let start = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { start = target; clearInterval(timer); }
        el.textContent = Math.floor(start).toLocaleString() + suffix;
      }, 25);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

/* ============================================================
   PRODUCT CARD BUILDER (Shared helper)
   ============================================================ */
function buildProductCard(product, shopPage = false) {
  const price = DB.getDiscountedPrice(product);
  const isWished = DB.isWishlisted(product.id);
  const formatP = p => '₹' + p.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const rating = product.ratings || 0;
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="star${i < Math.round(rating) ? '' : ' star-empty'}">★</span>`
  ).join('');

  const imageEl = product.images?.[0]
    ? `<img src="${product.images[0]}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.style.display='none'">`
    : `<div class="product-img" style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:3rem">🎁</div>`;

  const href = shopPage
    ? `../pages/product-detail.html?id=${product.id}`
    : `pages/product-detail.html?id=${product.id}`;

  return `
    <div class="product-card reveal" data-product-id="${product.id}">
      <div class="product-img-wrap">
        <a href="${href}">${imageEl}</a>
        <div class="product-badges">
          ${product.isTrending ? `<span class="badge badge-accent">Trending</span>` : ''}
          ${product.isFeatured ? `<span class="badge badge-gold">Featured</span>` : ''}
          ${product.discount > 0 ? `<span class="badge badge-success">${product.discount}% OFF</span>` : ''}
          ${product.stock === 0 ? `<span class="badge badge-danger">Sold Out</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="product-action-btn wishlist-btn ${isWished ? 'wishlist-active' : ''}"
            onclick="handleWishlist('${product.id}')" title="Wishlist">
            ${isWished ? '❤️' : '🤍'}
          </button>
          <a href="${href}" class="product-action-btn" title="Quick View">👁️</a>
        </div>
        <div class="product-quick-view" onclick="window.location.href='${href}'">Quick View</div>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category || 'Gift'}</div>
        <a href="${href}"><div class="product-name">${product.name}</div></a>
        <div class="product-rating">
          <div class="stars">${stars}</div>
          <span class="product-rating-count">(${product.reviewCount || 0})</span>
        </div>
        <div class="product-footer">
          <div class="price-wrap">
            <span class="price-current">${formatP(price)}</span>
            ${product.discount > 0 ? `<span class="price-original">${formatP(product.price)}</span>` : ''}
          </div>
          ${product.stock > 0
            ? `<button class="product-add-btn" onclick="handleAddToCart('${product.id}')">Add to Cart</button>`
            : `<span class="badge badge-danger">Out of Stock</span>`
          }
        </div>
      </div>
    </div>`;
}

/* ============================================================
   SHARED PRODUCT ACTIONS
   ============================================================ */
function handleAddToCart(productId) {
  const product = DB.getProduct(productId);
  if (!product) return;
  if (product.stock === 0) { Toast.error('Product is out of stock'); return; }
  DB.addToCart(product);
  Toast.success('Added to cart! 🛒');
}

function handleWishlist(productId) {
  const product = DB.getProduct(productId);
  if (!product) return;
  const added = DB.toggleWishlist(product);
  Toast.success(added ? '❤️ Added to wishlist!' : 'Removed from wishlist');
  // Update all wishlist buttons for this product
  document.querySelectorAll(`[data-product-id="${productId}"] .wishlist-btn`).forEach(btn => {
    btn.classList.toggle('wishlist-active', added);
    btn.innerHTML = added ? '❤️' : '🤍';
  });
}

/* ============================================================
   WHATSAPP ORDER MESSAGE
   ============================================================ */
function openWhatsApp(product, qty = 1) {
  const price = DB.getDiscountedPrice(product);
  const total = price * qty;
  const formatP = p => '₹' + p.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const message = encodeURIComponent(
    `Hello SP GlowPetals! 🌸\n\nI'm interested in purchasing:\n\n` +
    `📦 *Product:* ${product.name}\n` +
    `🔢 *Quantity:* ${qty}\n` +
    `💰 *Price:* ${formatP(price)} each\n` +
    `💳 *Total:* ${formatP(total)}\n\n` +
    `Please confirm availability and assist me with the order.\n\nThank you!`
  );
  window.open(`https://wa.me/919384845814?text=${message}`, '_blank');
}

/* ============================================================
   PATH HELPER (handles root vs subdirectory)
   ============================================================ */
function getPagePath(page) {
  const isRoot = !window.location.pathname.includes('/pages/') && !window.location.pathname.includes('/admin/');
  const prefix = isRoot ? 'pages/' : '';
  const paths = {
    home: isRoot ? 'index.html' : '../index.html',
    shop: prefix + 'shop.html',
    product: prefix + 'product-detail.html',
    cart: prefix + 'cart.html',
    wishlist: prefix + 'wishlist.html',
    checkout: prefix + 'checkout.html',
    search: prefix + 'search.html',
    about: prefix + 'about.html',
    contact: prefix + 'contact.html',
    categories: prefix + 'categories.html',
  };
  return paths[page] || '#';
}

/* ============================================================
   CART DRAWER ITEM STYLES (injected dynamically)
   ============================================================ */
(function injectCartStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .cart-drawer-item {
      display: flex; gap: 14px; padding: 14px 0;
      border-bottom: 1px solid var(--border);
    }
    .cart-drawer-img {
      width: 72px; height: 72px; border-radius: var(--radius-md);
      object-fit: cover; flex-shrink: 0; background: var(--bg-secondary);
    }
    .cart-drawer-details { flex: 1; min-width: 0; }
    .cart-drawer-name { font-weight: 600; font-size: .88rem; margin-bottom: 4px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cart-drawer-price { color: var(--primary); font-weight: 700; font-size: .9rem; margin-bottom: 8px; }
    .cart-drawer-qty-row { display: flex; align-items: center; gap: 12px; }
    .cart-drawer-remove { font-size: .75rem; color: var(--text-muted); cursor: pointer;
      background: none; border: none; text-decoration: underline; }
    .cart-drawer-remove:hover { color: #ef4444; }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   INIT ALL ON DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  Modal.init();
  Navbar.init();
  ScrollReveal.init();
  initBackToTop();
  initCounters();
  DB.initBadges();

  // Page loader
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 800);
  }
});
