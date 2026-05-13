/**
 * SP GlowPetals — Shared HTML Components
 * Injects navbar, footer, floating buttons, modals into pages
 */

'use strict';

/* ---- Detect if in subdirectory ---- */
const isSubPage = window.location.pathname.includes('/pages/');
const isAdminPage = window.location.pathname.includes('/admin/');
const ROOT = isSubPage ? '../' : (isAdminPage ? '../' : '');

/* ============================================================
   INJECT NAVBAR
   ============================================================ */
function injectNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const links = [
    { href: `${ROOT}index.html`, label: 'Home' },
    { href: `${ROOT}pages/categories.html`, label: 'Categories' },
    { href: `${ROOT}pages/shop.html`, label: 'Shop' },
    { href: `${ROOT}pages/about.html`, label: 'About' },
    { href: `${ROOT}pages/contact.html`, label: 'Contact' },
  ];

  placeholder.outerHTML = `
  <nav id="navbar" class="transparent">
    <div class="container nav-inner">
      <!-- Brand -->
      <a href="${ROOT}index.html" class="nav-brand">
        <img src="${ROOT}assets/images/logo.png" alt="SP GlowPetals" class="nav-logo-img" onerror="this.style.display='none'">
        <div class="nav-brand-text">
          <span class="nav-brand-name">SP GlowPetals</span>
          <span class="nav-brand-tagline">Gifts with Love</span>
        </div>
      </a>

      <!-- Desktop Links -->
      <div class="nav-links">
        ${links.map(l => `<a href="${l.href}" class="nav-link">${l.label}</a>`).join('')}
      </div>

      <!-- Actions -->
      <div class="nav-actions">
        <!-- Search -->
        <button class="nav-icon-btn" id="search-btn" title="Search" aria-label="Search">🔍</button>

        <!-- Wishlist -->
        <a href="${ROOT}pages/wishlist.html" class="nav-icon-btn" style="position:relative" title="Wishlist">
          🤍
          <span class="nav-badge wishlist-badge" style="display:none">0</span>
        </a>

        <!-- Cart -->
        <button class="nav-icon-btn" id="cart-btn" style="position:relative" title="Cart">
          🛍️
          <span class="nav-badge cart-badge" style="display:none">0</span>
        </button>

        <!-- Theme -->
        <div class="theme-switcher">
          <button class="theme-btn" id="theme-btn" title="Switch Theme">🎨</button>
          <div class="theme-dropdown" id="theme-dropdown">
            <div class="theme-option" data-theme="light">☀️ Light</div>
            <div class="theme-option" data-theme="dark">🌙 Dark</div>
            <div class="theme-option" data-theme="premium">✨ Premium</div>
          </div>
        </div>

        <!-- Hamburger -->
        <div class="hamburger" id="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </nav>

  <!-- Mobile Menu -->
  <div class="mobile-menu" id="mobile-menu">
    <div class="mobile-links">
      ${links.map(l => `<a href="${l.href}" class="mobile-link">${l.label}</a>`).join('')}
    </div>
  </div>

  <!-- Search Overlay -->
  <div class="search-overlay" id="search-overlay">
    <div class="search-box">
      <div class="search-input-wrap">
        <span style="font-size:1.2rem">🔍</span>
        <input type="text" class="search-input" id="search-overlay-input" placeholder="Search for gifts, candles, flowers…" autocomplete="off">
        <button id="search-close" style="color:var(--text-muted);font-size:1.2rem;background:none;border:none;cursor:pointer">✕</button>
      </div>
      <div style="padding-top:var(--space-md);font-size:.8rem;color:var(--text-muted)">
        Popular: <a href="${ROOT}pages/shop.html?q=candles" style="color:var(--primary);margin-right:8px">Candles</a>
        <a href="${ROOT}pages/shop.html?q=flowers" style="color:var(--primary);margin-right:8px">Flowers</a>
        <a href="${ROOT}pages/shop.html?q=box" style="color:var(--primary)">Gift Boxes</a>
      </div>
    </div>
  </div>

  <!-- Cart Drawer -->
  <div id="cart-drawer-overlay" class="cart-drawer-overlay"></div>
  <div id="cart-drawer" class="cart-drawer">
    <div class="cart-drawer-header">
      <div class="cart-drawer-title">🛍️ My Cart</div>
      <button id="cart-drawer-close" class="modal-close">✕</button>
    </div>
    <div class="cart-drawer-body" id="cart-drawer-body"></div>
    <div class="cart-drawer-footer" id="cart-drawer-footer"></div>
  </div>`;
}

/* ============================================================
   INJECT FOOTER
   ============================================================ */
function injectFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  placeholder.outerHTML = `
  <footer id="footer">
    <div class="container">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="footer-logo-wrap">
            <img src="${ROOT}assets/images/ti.jpeg" alt="SP GlowPetals" class="footer-logo" onerror="this.style.display='none'">
            <span class="footer-brand-name">SP GlowPetals</span>
          </div>
          <p class="footer-desc">Crafting moments of joy with handpicked candles, flowers, and personalized gifts. Every gift tells a beautiful story.</p>
          <div class="footer-socials">
            <a href="https://wa.me/919384845814" class="social-btn" target="_blank" title="WhatsApp">📱</a>
            <a href="mailto:spgpsupport@gmail.com" class="social-btn" title="Email">📧</a>
            <a href="#" class="social-btn" title="Instagram">📸</a>
            <a href="#" class="social-btn" title="Facebook">👍</a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <div class="footer-col-title">Quick Links</div>
          <div class="footer-links">
            <a href="${ROOT}index.html" class="footer-link">Home</a>
            <a href="${ROOT}pages/shop.html" class="footer-link">Shop</a>
            <a href="${ROOT}pages/categories.html" class="footer-link">Categories</a>
            <a href="${ROOT}pages/about.html" class="footer-link">About Us</a>
            <a href="${ROOT}pages/contact.html" class="footer-link">Contact</a>
          </div>
        </div>

        <!-- Categories -->
        <div>
          <div class="footer-col-title">Categories</div>
          <div class="footer-links" id="footer-categories">
            <a href="${ROOT}pages/shop.html?cat=Gift+Candles" class="footer-link">Gift Candles</a>
            <a href="${ROOT}pages/shop.html?cat=Flowers" class="footer-link">Flowers</a>
            <a href="${ROOT}pages/shop.html?cat=Surprise+Boxes" class="footer-link">Surprise Boxes</a>
            <a href="${ROOT}pages/shop.html?cat=Romantic+Gifts" class="footer-link">Romantic Gifts</a>
            <a href="${ROOT}pages/shop.html?cat=Personalized" class="footer-link">Personalized</a>
          </div>
        </div>

        <!-- Contact -->
        <div>
          <div class="footer-col-title">Contact Us</div>
          <div class="footer-contact-item">
            <span class="footer-contact-icon">📱</span>
            <a href="https://wa.me/919384845814" style="color:rgba(253,250,246,0.5);transition:color .15s ease" onmouseover="this.style.color='var(--primary-light)'" onmouseout="this.style.color='rgba(253,250,246,0.5)'">+91 93848 45814</a>
          </div>
          <div class="footer-contact-item">
            <span class="footer-contact-icon">📧</span>
            <a href="mailto:spgpsupport@gmail.com" style="color:rgba(253,250,246,0.5);transition:color .15s ease" onmouseover="this.style.color='var(--primary-light)'" onmouseout="this.style.color='rgba(253,250,246,0.5)'">spgpsupport@gmail.com</a>
          </div>
          <div class="footer-contact-item">
            <span class="footer-contact-icon">⏰</span>
            <span>Sun–Sat: 9AM – 8PM</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-copy">© ${new Date().getFullYear()} SP GlowPetals. All rights reserved. Made with ❤️</div>
        <div class="footer-bottom-links">
          <a href="#" class="footer-bottom-link">Privacy Policy</a>
          <a href="#" class="footer-bottom-link">Terms of Service</a>
          <a href="#" class="footer-bottom-link">Refund Policy</a>
        </div>
      </div>
    </div>
  </footer>`;
}

/* ============================================================
   INJECT FLOATING BUTTONS + LOADER
   ============================================================ */
function injectFloatingElements() {
  // Page Loader
  if (!document.getElementById('page-loader')) {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
      <div class="loader-logo">SP GlowPetals</div>
      <div class="loader-bar"><div class="loader-progress"></div></div>`;
    document.body.prepend(loader);
  }

  // WhatsApp Float
  if (!document.getElementById('whatsapp-float')) {
    const wa = document.createElement('a');
    wa.id = 'whatsapp-float';
    wa.href = 'https://wa.me/919384845814';
    wa.target = '_blank';
    wa.title = 'Chat on WhatsApp';
    wa.innerHTML = '💬';
    document.body.appendChild(wa);
  }

  // Back to Top
  if (!document.getElementById('back-to-top')) {
    const btt = document.createElement('button');
    btt.id = 'back-to-top';
    btt.innerHTML = '↑';
    btt.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(btt);
  }

  // Toast container
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }
}

/* ============================================================
   AUTO-INJECT ON DOM READY
   ============================================================ */
/* ============================================================
   AUTO-INJECT + NAVBAR FUNCTIONS
============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  injectNavbar();

  if (!isAdminPage) {

    injectFooter();
    injectFloatingElements();

    // Hide loader
    const loader = document.getElementById('page-loader');

    if (loader) {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 800);
    }
  }

  /* =========================
     NAVBAR FUNCTIONS
  ========================= */

  // SEARCH OVERLAY
  const searchBtn = document.getElementById('search-btn');
  const searchOverlay = document.getElementById('search-overlay');
  const searchClose = document.getElementById('search-close');

  if (searchBtn && searchOverlay) {

    searchBtn.addEventListener('click', () => {

      searchOverlay.classList.add('active');

      setTimeout(() => {
        document.getElementById('search-overlay-input')?.focus();
      }, 100);

    });

  }

  if (searchClose && searchOverlay) {

    searchClose.addEventListener('click', () => {

      searchOverlay.classList.remove('active');

    });

  }

  // CART BUTTON
  const cartBtn = document.getElementById('cart-btn');

  if (cartBtn) {

    cartBtn.addEventListener('click', () => {

      window.location.href = ROOT + 'pages/cart.html';

    });

  }

  // THEME DROPDOWN
  const themeBtn = document.getElementById('theme-btn');
  const themeDropdown = document.getElementById('theme-dropdown');

  if (themeBtn && themeDropdown) {

    themeBtn.addEventListener('click', (e) => {

      e.stopPropagation();

      themeDropdown.classList.toggle('show');

    });

    // THEME OPTIONS
    document.querySelectorAll('.theme-option').forEach(option => {

      option.addEventListener('click', () => {

        const theme = option.dataset.theme;

        if (theme === 'light') {

          document.documentElement.removeAttribute('data-theme');

        } else {

          document.documentElement.setAttribute('data-theme', theme);

        }

        localStorage.setItem('sp-theme', theme);

        themeDropdown.classList.remove('show');

      });

    });

    // LOAD SAVED THEME
    const savedTheme = localStorage.getItem('sp-theme');

    if (savedTheme) {

      if (savedTheme === 'light') {

        document.documentElement.removeAttribute('data-theme');

      } else {

        document.documentElement.setAttribute('data-theme', savedTheme);

      }

    }

    // CLOSE DROPDOWN
    document.addEventListener('click', () => {

      themeDropdown.classList.remove('show');

    });

  }

  // MOBILE MENU
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {

    hamburger.addEventListener('click', () => {

      hamburger.classList.toggle('active');

      mobileMenu.classList.toggle('active');

    });

  }

});