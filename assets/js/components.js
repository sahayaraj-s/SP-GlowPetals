// SP GlowPetals — Components & Utilities
// Handles: Navbar, Footer, Cart, Wishlist, Toast, Search
// Icons: FontAwesome 6 (no emojis in UI chrome)

// ============ CART ============
export const Cart = {
  get: () => JSON.parse(localStorage.getItem('gp_cart') || '[]'),
  save: (items) => { localStorage.setItem('gp_cart', JSON.stringify(items)); Cart.updateBadge(); },
  add: (product, qty = 1) => {
    const items = Cart.get();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) { items[idx].qty += qty; } else { items.push({ ...product, qty }); }
    Cart.save(items);
    showToast(`"${product.name}" added to cart!`, 'success');
  },
  remove: (id) => { Cart.save(Cart.get().filter(i => i.id !== id)); },
  update: (id, qty) => {
    const items = Cart.get();
    const idx = items.findIndex(i => i.id === id);
    if (idx > -1) { items[idx].qty = qty; }
    Cart.save(items);
  },
  clear: () => { localStorage.removeItem('gp_cart'); Cart.updateBadge(); },
  total: () => Cart.get().reduce((s, i) => s + i.price * i.qty, 0),
  count: () => Cart.get().reduce((s, i) => s + i.qty, 0),
  updateBadge: () => {
    const count = Cart.count();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// ============ WISHLIST ============
export const Wishlist = {
  get: () => JSON.parse(localStorage.getItem('gp_wishlist') || '[]'),
  save: (items) => { localStorage.setItem('gp_wishlist', JSON.stringify(items)); Wishlist.updateBadge(); },
  toggle: (product) => {
    const items = Wishlist.get();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) { items.splice(idx, 1); showToast('Removed from wishlist', 'info'); }
    else { items.push(product); showToast(`"${product.name}" added to wishlist!`, 'success'); }
    Wishlist.save(items);
    return idx === -1;
  },
  has: (id) => Wishlist.get().some(i => i.id === id),
  count: () => Wishlist.get().length,
  updateBadge: () => {
    const count = Wishlist.count();
    document.querySelectorAll('.wishlist-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// ============ TOAST ============
export function showToast(msg, type = 'info', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const iconMap = {
    success: '<i class="fa-solid fa-circle-check"></i>',
    error:   '<i class="fa-solid fa-circle-xmark"></i>',
    info:    '<i class="fa-solid fa-circle-info"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation"></i>'
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${iconMap[type] || iconMap.info}</span><span class="toast-text">${msg}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, duration);
}

// ============ RENDER NAVBAR (dynamic categories from Firebase) ============
export async function renderNavbar(activePage = '') {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  // Load FontAwesome if not present
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
    document.head.appendChild(fa);
  }

  // Render shell immediately, populate categories async
  nav.innerHTML = `
  <div class="marquee-strip">
    <div class="marquee-inner" id="marqueeInner">
      ${Array(8).fill(`
        <span class="marquee-item"><i class="fa-solid fa-truck-fast"></i> Free Delivery above ₹599</span>
        <span class="marquee-item"><i class="fa-solid fa-bolt"></i> Fast Delivery Available</span>
        <span class="marquee-item"><i class="fa-solid fa-gift"></i> Personalised Gifts &amp; Hampers</span>
        <span class="marquee-item"><i class="fa-solid fa-star"></i> Premium Gift Wrapping</span>
      `).join('')}
    </div>
  </div>
  <nav class="navbar" id="mainNav">
    <div class="navbar-inner">
      <a href="/index.html" class="navbar-brand">
        <img src="/assets/images/logo.png" alt="SP GlowPetals" onerror="this.style.display='none'">
      </a>
      <div class="navbar-nav">
        <a href="/index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="/pages/shop.html" class="${activePage === 'shop' ? 'active' : ''}">Shop</a>
        <div class="nav-dropdown">
          <a href="/pages/categories.html" class="${activePage === 'categories' ? 'active' : ''}">
            Categories <i class="fa-solid fa-chevron-down" style="font-size:0.7em;"></i>
          </a>
          <div class="dropdown-menu" id="navCategories">
            <div style="padding:12px 16px;color:#aaa;font-size:0.85rem;">
              <i class="fa-solid fa-spinner fa-spin"></i> Loading…
            </div>
          </div>
        </div>
        <a href="/pages/about.html" class="${activePage === 'about' ? 'active' : ''}">About</a>
        <a href="/pages/contact.html" class="${activePage === 'contact' ? 'active' : ''}">Contact</a>
      </div>
      <div class="navbar-actions">
        <button class="nav-icon" id="searchToggle" title="Search" aria-label="Search">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
        <a href="/pages/wishlist.html" class="nav-icon" title="Wishlist" aria-label="Wishlist">
          <i class="fa-regular fa-heart"></i>
          <span class="nav-badge wishlist-badge" style="display:none">0</span>
        </a>
        <a href="/pages/cart.html" class="nav-icon" title="Cart" aria-label="Cart">
          <i class="fa-solid fa-bag-shopping"></i>
          <span class="nav-badge cart-badge" style="display:none">0</span>
        </a>
        <button class="hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>
  <div class="mobile-nav" id="mobileNav">
    <a href="/index.html" class="${activePage === 'home' ? 'active' : ''}">
      <i class="fa-solid fa-house"></i> Home
    </a>
    <a href="/pages/shop.html" class="${activePage === 'shop' ? 'active' : ''}">
      <i class="fa-solid fa-shop"></i> Shop
    </a>
    <a href="/pages/categories.html" class="${activePage === 'categories' ? 'active' : ''}">
      <i class="fa-solid fa-grid-2"></i> Categories
    </a>
    <div id="mobileCatLinks"></div>
    <a href="/pages/about.html" class="${activePage === 'about' ? 'active' : ''}">
      <i class="fa-solid fa-circle-info"></i> About
    </a>
    <a href="/pages/contact.html" class="${activePage === 'contact' ? 'active' : ''}">
      <i class="fa-solid fa-phone"></i> Contact
    </a>
    <a href="/pages/wishlist.html">
      <i class="fa-regular fa-heart"></i> Wishlist
    </a>
    <a href="/pages/cart.html">
      <i class="fa-solid fa-bag-shopping"></i> Cart
    </a>
  </div>`;

  // Hamburger toggle
  const ham = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  ham?.addEventListener('click', () => {
    ham.classList.toggle('active');
    mobileNav.classList.toggle('open');
  });

  // Sticky navbar
  const mainNav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    mainNav?.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Update badges
  Cart.updateBadge();
  Wishlist.updateBadge();

  // Load categories from Firebase dynamically
  _loadNavCategories();
}

// Load and render nav categories — called once on init, also exported for refresh
async function _loadNavCategories() {
  try {
    const { listenCategories } = await import('/assets/js/firebase.js');
    // Use real-time listener so deletions/additions reflect instantly
    listenCategories((cats) => {
      const active = cats.filter(c => c.active !== false);
      _renderNavCategoryLinks(active);
    });
  } catch (e) {
    console.warn('Could not load categories for navbar:', e);
    const dd = document.getElementById('navCategories');
    if (dd) dd.innerHTML = '<a href="/pages/categories.html" style="padding:12px 16px;display:block;">View All Categories</a>';
  }
}

function _renderNavCategoryLinks(cats) {
  const dd = document.getElementById('navCategories');
  const mobile = document.getElementById('mobileCatLinks');

  if (dd) {
    if (!cats.length) {
      dd.innerHTML = '<a href="/pages/categories.html" style="padding:12px 16px;display:block;color:var(--gray-600);">No categories yet</a>';
    } else {
      dd.innerHTML = cats.map(c =>
        `<a href="/pages/shop.html?cat=${encodeURIComponent(c.slug || c.id)}">
          <i class="fa-solid fa-tag" style="color:var(--pink);margin-right:8px;font-size:0.75em;"></i>${c.name}
        </a>`
      ).join('');
    }
  }

  if (mobile) {
    mobile.innerHTML = cats.map(c =>
      `<a href="/pages/shop.html?cat=${encodeURIComponent(c.slug || c.id)}" style="padding-left:32px;font-size:0.88rem;opacity:0.85;">
        <i class="fa-solid fa-angle-right" style="margin-right:6px;font-size:0.75em;"></i>${c.name}
      </a>`
    ).join('');
  }
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
            <a href="#" class="social-link" aria-label="Instagram">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="#" class="social-link" aria-label="Facebook">
              <i class="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://wa.me/919384845814" class="social-link" aria-label="WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
            <a href="mailto:spgpsupport@gmail.com" class="social-link" aria-label="Email">
              <i class="fa-solid fa-envelope"></i>
            </a>
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
          <div class="footer-links" id="footerCatLinks">
            <a href="/pages/categories.html">
              <i class="fa-solid fa-grid-2" style="margin-right:6px;font-size:0.78em;color:var(--pink);"></i>
              View All Categories
            </a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Contact Us</h4>
          <div class="footer-contact">
            <div class="contact-item">
              <i class="fa-solid fa-location-dot"></i>
              <span>Dindigul, Tamil Nadu, India</span>
            </div>
            <div class="contact-item">
              <i class="fa-solid fa-phone"></i>
              <span><a href="tel:+919384845814" style="color:inherit">+91 93848 45814</a></span>
            </div>
            <div class="contact-item">
              <i class="fa-solid fa-envelope"></i>
              <span><a href="mailto:spgpsupport@gmail.com" style="color:inherit">spgpsupport@gmail.com</a></span>
            </div>
            <div class="contact-item">
              <i class="fa-regular fa-clock"></i>
              <span>Open All Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© ${new Date().getFullYear()} <span>SP GlowPetals</span>. All rights reserved. Developed By Alvortix Tech Services.
        </p>
      </div>
    </div>
  </footer>`;

  // Load footer category links dynamically
  _loadFooterCategories();
}

async function _loadFooterCategories() {
  try {
    const { listenCategories } = await import('/assets/js/firebase.js');
    listenCategories((cats) => {
      const el = document.getElementById('footerCatLinks');
      if (!el) return;
      const active = cats.filter(c => c.active !== false).slice(0, 6);
      if (!active.length) return;
      el.innerHTML = active.map(c =>
        `<a href="/pages/shop.html?cat=${encodeURIComponent(c.slug || c.id)}">
          <i class="fa-solid fa-angle-right" style="margin-right:4px;font-size:0.75em;color:var(--pink);"></i>${c.name}
        </a>`
      ).join('');
    });
  } catch (e) {
    console.warn('Footer categories:', e);
  }
}

// ============ SEARCH OVERLAY ============
export function renderSearch(products = []) {
  let overlay = document.getElementById('searchOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'searchOverlay';
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <button class="search-close" id="searchClose">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="search-box">
        <div class="search-input-wrap">
          <input type="text" id="searchInput" placeholder="Search gifts, candles, flowers…" autocomplete="off">
          <button id="searchSubmit"><i class="fa-solid fa-magnifying-glass"></i></button>
        </div>
        <div class="search-results" id="searchResults"></div>
      </div>`;
    document.body.appendChild(overlay);
  }

  const toggle = (open) => overlay.classList.toggle('open', open);
  document.getElementById('searchToggle')?.addEventListener('click', () => toggle(true));
  document.getElementById('searchClose')?.addEventListener('click', () => toggle(false));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) toggle(false); });

  const input   = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  input?.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = ''; return; }
    const filtered = products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ).slice(0, 6);
    if (!filtered.length) {
      results.innerHTML = `<div style="color:rgba(255,255,255,0.6);text-align:center;padding:20px;">No results for "${q}"</div>`;
      return;
    }
    results.innerHTML = filtered.map(p => `
      <div class="search-result-item" onclick="location.href='/pages/product-detail.html?id=${p.id}'">
        <img class="search-result-img"
          src="${p.image || p.images?.[0] || '/assets/images/placeholder.jpg'}"
          alt="${p.name}"
          onerror="this.src='/assets/images/placeholder.jpg'">
        <div>
          <div class="search-result-name">${p.name}</div>
          <div class="search-result-price">₹${p.price?.toLocaleString('en-IN')}</div>
        </div>
      </div>`).join('');
  });

  const goSearch = () => {
    const q = input?.value.trim();
    if (q) location.href = `/pages/search.html?q=${encodeURIComponent(q)}`;
  };
  document.getElementById('searchSubmit')?.addEventListener('click', goSearch);
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') goSearch(); });
}

// ============ PRODUCT CARD ============
export function productCardHTML(p) {
  const discount  = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const wishlisted = Wishlist.has(p.id);
  const img = p.image || p.images?.[0] || '/assets/images/placeholder.jpg';
  return `
  <div class="product-card" data-id="${p.id}">
    <div class="product-img-wrap">
      <a href="/pages/product-detail.html?id=${p.id}">
        <img src="${img}" alt="${p.name}" loading="lazy" onerror="this.src='/assets/images/placeholder.jpg'">
      </a>
      <div class="product-badges">
        ${discount > 0  ? `<span class="badge badge-sale">${discount}% OFF</span>` : ''}
        ${p.featured    ? `<span class="badge badge-featured">Featured</span>` : ''}
        ${p.trending    ? `<span class="badge badge-trending">Trending</span>` : ''}
        ${p.isNew       ? `<span class="badge badge-new">New</span>` : ''}
      </div>
      <div class="product-actions">
        <button class="product-action-btn wishlist-btn ${wishlisted ? 'wishlisted' : ''}"
          data-id="${p.id}" title="Wishlist">
          <i class="fa-${wishlisted ? 'solid' : 'regular'} fa-heart"></i>
        </button>
        <a href="/pages/product-detail.html?id=${p.id}" class="product-action-btn" title="View Product">
          <i class="fa-regular fa-eye"></i>
        </a>
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
      <button class="product-cart-btn" data-id="${p.id}">
        <i class="fa-solid fa-bag-shopping"></i> Add to Cart
      </button>
    </div>
  </div>`;
}

// ============ BIND CARD EVENTS ============
export function bindProductCardEvents(container, products) {
  container.querySelectorAll('.product-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const p = products.find(x => x.id === id);
      if (p) {
        Cart.add(p);
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Add to Cart';
        }, 1500);
      }
    });
  });
  container.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const p = products.find(x => x.id === id);
      if (p) {
        const added = Wishlist.toggle(p);
        btn.classList.toggle('wishlisted', added);
        btn.innerHTML = `<i class="fa-${added ? 'solid' : 'regular'} fa-heart"></i>`;
      }
    });
  });
}

// ============ LOADER ============
export function showLoader() {
  const el = document.getElementById('loader');
  if (el) { el.style.opacity = '1'; el.style.display = 'flex'; }
}
export function hideLoader() {
  const el = document.getElementById('loader');
  if (el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.4s';
    setTimeout(() => el.style.display = 'none', 400);
  }
}

// ============ WHATSAPP ORDER ============
export function whatsappOrder(items, customer = {}) {
  const lines = items.map(i =>
    `• ${i.name} x${i.qty} = ₹${(i.price * i.qty).toLocaleString('en-IN')}`
  ).join('\n');
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const msg = `Hello SP GlowPetals! 🌸\n\n*New Order:*\n${lines}\n\n*Total: ₹${total.toLocaleString('en-IN')}*\n\n*Customer:*\nName: ${customer.name || ''}\nPhone: ${customer.phone || ''}\nAddress: ${customer.address || ''}\n\nPlease confirm my order. Thank you!`;
  window.open(`https://wa.me/919384845814?text=${encodeURIComponent(msg)}`, '_blank');
}

// ============ FORMAT CURRENCY ============
export const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// ============ DEBOUNCE ============
export const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
};
