// SP GlowPetals — Components & Utilities
// Handles: Navbar, Footer, Cart, Wishlist, Toast, Search, WhatsApp

// ============ CART ============
export const Cart = {
  get: () => JSON.parse(localStorage.getItem('gp_cart') || '[]'),
  save: (items) => { localStorage.setItem('gp_cart', JSON.stringify(items)); Cart.updateBadge(); },
  add: (product, qty = 1) => {
    const items = Cart.get();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) { items[idx].qty += qty; } else { items.push({ ...product, qty }); }
    Cart.save(items);
    showToast(`"${product.name}" added to cart! 🛒`, 'success');
  },
  remove: (id) => { Cart.save(Cart.get().filter(i => i.id !== id)); },
  update: (id, qty) => { const items = Cart.get(); const idx = items.findIndex(i => i.id === id); if (idx > -1) { items[idx].qty = qty; } Cart.save(items); },
  clear: () => { localStorage.removeItem('gp_cart'); Cart.updateBadge(); },
  total: () => Cart.get().reduce((s, i) => s + i.price * i.qty, 0),
  count: () => Cart.get().reduce((s, i) => s + i.qty, 0),
  updateBadge: () => { const b = document.querySelectorAll('.cart-badge'); b.forEach(el => { el.textContent = Cart.count(); el.style.display = Cart.count() > 0 ? 'flex' : 'none'; }); }
};

// ============ WISHLIST ============
export const Wishlist = {
  get: () => JSON.parse(localStorage.getItem('gp_wishlist') || '[]'),
  save: (items) => { localStorage.setItem('gp_wishlist', JSON.stringify(items)); Wishlist.updateBadge(); },
  toggle: (product) => {
    const items = Wishlist.get();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) { items.splice(idx, 1); showToast('Removed from wishlist', 'info'); }
    else { items.push(product); showToast(`"${product.name}" added to wishlist! ❤️`, 'success'); }
    Wishlist.save(items);
    return idx === -1;
  },
  has: (id) => Wishlist.get().some(i => i.id === id),
  count: () => Wishlist.get().length,
  updateBadge: () => { const b = document.querySelectorAll('.wishlist-badge'); b.forEach(el => { el.textContent = Wishlist.count(); el.style.display = Wishlist.count() > 0 ? 'flex' : 'none'; }); }
};

// ============ TOAST ============
export function showToast(msg, type = 'info', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-text">${msg}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, duration);
}

// ============ RENDER NAVBAR ============
export function renderNavbar(activePage = '') {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.innerHTML = `
  <div class="marquee-strip">
    <div class="marquee-inner" id="marqueeInner">
      ${Array(8).fill(`
        <span class="marquee-item">Free Delivery on orders above ₹599</span>
        <span class="marquee-item">Fast Delivery Available</span>
        <span class="marquee-item">Personalised Gifts & Hampers</span>
        <span class="marquee-item">Premium Gift Wrapping</span>
      `).join('')}
    </div>
  </div>
  <nav class="navbar" id="mainNav">
    <div class="navbar-inner">
      <a href="/index.html" class="navbar-brand">
        <img src="/assets/images/logo.png" alt="SP GlowPetals" onerror="this.style.display='none'">
      </a>
      <div class="navbar-nav">
        <a href="/index.html" class="${activePage==='home'?'active':''}">Home</a>
        <a href="/pages/shop.html" class="${activePage==='shop'?'active':''}">Shop</a>
        <div class="nav-dropdown">
          <a href="/pages/categories.html" class="${activePage==='categories'?'active':''}">Categories ▾</a>
          <div class="dropdown-menu" id="navCategories">
            <a href="/pages/shop.html?cat=candles">🕯️ Gift Candles</a>
            <a href="/pages/shop.html?cat=flowers">🌹 Flowers</a>
            <a href="/pages/shop.html?cat=surprise-boxes">🎁 Surprise Boxes</a>
            <a href="/pages/shop.html?cat=romantic">💕 Romantic Gifts</a>
            <a href="/pages/shop.html?cat=personalized">✨ Personalized Gifts</a>
            <a href="/pages/shop.html?cat=teddy">🧸 Teddy Bears</a>
            <a href="/pages/shop.html?cat=chocolates">🍫 Chocolates</a>
            <a href="/pages/shop.html?cat=hampers">🎀 Hampers</a>
            <a href="/pages/shop.html?cat=premium">👑 Premium Gifts</a>
          </div>
        </div>
        <a href="/pages/about.html" class="${activePage==='about'?'active':''}">About</a>
        <a href="/pages/contact.html" class="${activePage==='contact'?'active':''}">Contact</a>
      </div>
      <div class="navbar-actions">
        <button class="nav-icon" id="searchToggle" title="Search" aria-label="Search">
          <i>🔍</i>
        </button>
        <a href="/pages/wishlist.html" class="nav-icon" title="Wishlist" aria-label="Wishlist">
          <i>❤️</i>
          <span class="nav-badge wishlist-badge" style="display:none">0</span>
        </a>
        <a href="/pages/cart.html" class="nav-icon" title="Cart" aria-label="Cart">
          <i>🛒</i>
          <span class="nav-badge cart-badge" style="display:none">0</span>
        </a>
        <button class="hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>
  <div class="mobile-nav" id="mobileNav">
    <a href="/index.html" class="${activePage==='home'?'active':''}"><span>🏠</span> Home</a>
    <a href="/pages/shop.html" class="${activePage==='shop'?'active':''}"><span>🛍️</span> Shop</a>
    <a href="/pages/categories.html" class="${activePage==='categories'?'active':''}"><span>📂</span> Categories</a>
    <a href="/pages/shop.html?cat=candles"><span>🕯️</span> Gift Candles</a>
    <a href="/pages/shop.html?cat=flowers"><span>🌹</span> Flowers</a>
    <a href="/pages/shop.html?cat=surprise-boxes"><span>🎁</span> Surprise Boxes</a>
    <a href="/pages/shop.html?cat=romantic"><span>💕</span> Romantic Gifts</a>
    <a href="/pages/shop.html?cat=personalized"><span>✨</span> Personalized Gifts</a>
    <a href="/pages/shop.html?cat=teddy"><span>🧸</span> Teddy Bears</a>
    <a href="/pages/shop.html?cat=chocolates"><span>🍫</span> Chocolates</a>
    <a href="/pages/shop.html?cat=hampers"><span>🎀</span> Hampers</a>
    <a href="/pages/about.html" class="${activePage==='about'?'active':''}"><span>ℹ️</span> About</a>
    <a href="/pages/contact.html" class="${activePage==='contact'?'active':''}"><span>📞</span> Contact</a>
    <a href="/pages/wishlist.html"><span>❤️</span> Wishlist</a>
    <a href="/pages/cart.html"><span>🛒</span> Cart</a>
  </div>`;
  // Hamburger toggle
  const ham = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  ham?.addEventListener('click', () => { ham.classList.toggle('active'); mobileNav.classList.toggle('open'); });
  // Sticky navbar
  const mainNav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => { mainNav?.classList.toggle('scrolled', window.scrollY > 20); });
  // Update badges
  Cart.updateBadge(); Wishlist.updateBadge();
}

// ============ RENDER FOOTER ============
export function renderFooter() {
  const el = document.getElementById('footer');
  if (!el) return;
  el.innerHTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/assets/images/logo.png" alt="SP GlowPetals" onerror="this.style.display='none'">
          <p>Bringing joy and love through premium gifts, candles, and flowers. Every gift tells a beautiful story.</p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Instagram">📸</a>
            <a href="#" class="social-link" aria-label="Facebook">👥</a>
            <a href="https://wa.me/919384845814" class="social-link" aria-label="WhatsApp">💬</a>
            <a href="mailto:spgpsupport@gmail.com" class="social-link" aria-label="Email">✉️</a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Quick Links</h4>
          <div class="footer-links">
            <a href="/index.html">Home</a>
            <a href="/pages/shop.html">Shop All</a>
            <a href="/pages/categories.html">Categories</a>
            <a href="/pages/about.html">About Us</a>
            <a href="/pages/contact.html">Contact</a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Categories</h4>
          <div class="footer-links">
            <a href="/pages/shop.html?cat=candles">🕯️ Gift Candles</a>
            <a href="/pages/shop.html?cat=flowers">🌹 Flowers</a>
            <a href="/pages/shop.html?cat=surprise-boxes">🎁 Surprise Boxes</a>
            <a href="/pages/shop.html?cat=romantic">💕 Romantic Gifts</a>
            <a href="/pages/shop.html?cat=hampers">🎀 Hampers</a>
            <a href="/pages/shop.html?cat=premium">👑 Premium Gifts</a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Contact Us</h4>
          <div class="footer-contact">
            <div class="contact-item"><i>📍</i><span>Dindigul, Tamil Nadu, India</span></div>
            <div class="contact-item"><i>📞</i><span><a href="tel:+919384845814" style="color:inherit">+91 93848 45814</a></span></div>
            <div class="contact-item"><i>✉️</i><span><a href="mailto:spgpsupport@gmail.com" style="color:inherit">spgpsupport@gmail.com</a></span></div>
            <div class="contact-item"><i>🕐</i><span>All Days</span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© ${new Date().getFullYear()} <span>SP GlowPetals</span>. All rights reserved. Made with ❤️ in Chennai.</p>
      </div>
    </div>
  </footer>`;
}

// ============ SEARCH OVERLAY ============
export function renderSearch(products = []) {
  let overlay = document.getElementById('searchOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'searchOverlay';
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <button class="search-close" id="searchClose">✕</button>
      <div class="search-box">
        <div class="search-input-wrap">
          <input type="text" id="searchInput" placeholder="Search gifts, candles, flowers…" autocomplete="off">
          <button id="searchSubmit">🔍</button>
        </div>
        <div class="search-results" id="searchResults"></div>
      </div>`;
    document.body.appendChild(overlay);
  }
  const toggle = (open) => overlay.classList.toggle('open', open);
  document.getElementById('searchToggle')?.addEventListener('click', () => toggle(true));
  document.getElementById('searchClose')?.addEventListener('click', () => toggle(false));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) toggle(false); });
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  input?.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = ''; return; }
    const filtered = products.filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)).slice(0, 6);
    if (!filtered.length) { results.innerHTML = `<div style="color:rgba(255,255,255,0.6);text-align:center;padding:20px;">No results for "${q}"</div>`; return; }
    results.innerHTML = filtered.map(p => `
      <div class="search-result-item" onclick="location.href='/pages/product-detail.html?id=${p.id}'">
        <img class="search-result-img" src="${p.image || p.images?.[0] || '/assets/images/placeholder.jpg'}" alt="${p.name}" onerror="this.src='/assets/images/placeholder.jpg'">
        <div>
          <div class="search-result-name">${p.name}</div>
          <div class="search-result-price">₹${p.price?.toLocaleString('en-IN')}</div>
        </div>
      </div>`).join('');
  });
  document.getElementById('searchSubmit')?.addEventListener('click', () => { const q = input?.value.trim(); if (q) location.href = `/pages/search.html?q=${encodeURIComponent(q)}`; });
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const q = input.value.trim(); if (q) location.href = `/pages/search.html?q=${encodeURIComponent(q)}`; } });
}

// ============ WHATSAPP BUTTON ============
export function renderWhatsApp() {
  const el = document.createElement('div');
  el.innerHTML = `
    <a href="https://wa.me/919384845814?text=Hi%20SP%20GlowPetals!%20I%20need%20help%20with%20a%20gift." target="_blank" class="whatsapp-float" title="Chat on WhatsApp">
      <div class="whatsapp-pulse"></div>
      <span style="font-size:1.6rem">💬</span>
    </a>`;
  document.body.appendChild(el.firstElementChild);
}

// ============ PRODUCT CARD ============
export function productCardHTML(p) {
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const wishlisted = Wishlist.has(p.id);
  const img = p.image || p.images?.[0] || '/assets/images/placeholder.jpg';
  return `
  <div class="product-card" data-id="${p.id}">
    <div class="product-img-wrap">
      <a href="/pages/product-detail.html?id=${p.id}">
        <img src="${img}" alt="${p.name}" loading="lazy" onerror="this.src='/assets/images/placeholder.jpg'">
      </a>
      <div class="product-badges">
        ${discount > 0 ? `<span class="badge badge-sale">${discount}% OFF</span>` : ''}
        ${p.featured ? `<span class="badge badge-featured">Featured</span>` : ''}
        ${p.trending ? `<span class="badge badge-trending">Trending</span>` : ''}
        ${p.isNew ? `<span class="badge badge-new">New</span>` : ''}
      </div>
      <div class="product-actions">
        <button class="product-action-btn wishlist-btn ${wishlisted ? 'wishlisted' : ''}" data-id="${p.id}" title="Wishlist">❤️</button>
        <a href="/pages/product-detail.html?id=${p.id}" class="product-action-btn" title="Quick View">👁️</a>
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">${p.category || ''}</div>
      <a href="/pages/product-detail.html?id=${p.id}" class="product-name">${p.name}</a>
      <div class="product-rating">
        <span class="stars">${'★'.repeat(Math.round(p.rating || 4))}${'☆'.repeat(5 - Math.round(p.rating || 4))}</span>
        <span class="rating-count">(${p.reviews || 0})</span>
      </div>
      <div class="product-price">
        <span class="price-current">₹${p.price?.toLocaleString('en-IN')}</span>
        ${p.originalPrice ? `<span class="price-original">₹${p.originalPrice?.toLocaleString('en-IN')}</span>` : ''}
        ${discount > 0 ? `<span class="price-discount">Save ${discount}%</span>` : ''}
      </div>
      <button class="product-cart-btn" data-id="${p.id}">🛒 Add to Cart</button>
    </div>
  </div>`;
}

// ============ BIND CARD EVENTS ============
export function bindProductCardEvents(container, products) {
  container.querySelectorAll('.product-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const p = products.find(x => x.id === id);
      if (p) { Cart.add(p); btn.textContent = '✅ Added!'; setTimeout(() => btn.innerHTML = '🛒 Add to Cart', 1500); }
    });
  });
  container.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const p = products.find(x => x.id === id);
      if (p) { const added = Wishlist.toggle(p); btn.classList.toggle('wishlisted', added); }
    });
  });
}

// ============ LOADER ============
export function showLoader() {
  const el = document.getElementById('loader');
  if (el) el.style.display = 'flex';
}
export function hideLoader() {
  const el = document.getElementById('loader');
  if (el) { el.style.opacity = '0'; el.style.transition = 'opacity 0.4s'; setTimeout(() => el.style.display = 'none', 400); }
}

// ============ WHATSAPP ORDER ============
export function whatsappOrder(items, customer = {}) {
  const lines = items.map(i => `• ${i.name} x${i.qty} = ₹${(i.price * i.qty).toLocaleString('en-IN')}`).join('\n');
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const msg = `Hello SP GlowPetals! 🌸\n\n*New Order:*\n${lines}\n\n*Total: ₹${total.toLocaleString('en-IN')}*\n\n*Customer:*\nName: ${customer.name || ''}\nPhone: ${customer.phone || ''}\nAddress: ${customer.address || ''}\n\nPlease confirm my order. Thank you!`;
  window.open(`https://wa.me/919384845814?text=${encodeURIComponent(msg)}`, '_blank');
}

// ============ FORMAT CURRENCY ============
export const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// ============ DEBOUNCE ============
export const debounce = (fn, delay = 300) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); }; };
