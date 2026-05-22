// SP GlowPetals — Admin Shared Components
// All icons use FontAwesome 6 (no emoji)
import { adminLogout, onAuthChange } from '../assets/js/firebase.js';

export function requireAuth() {
  return new Promise((resolve, reject) => {
    onAuthChange(user => {
      if (user) resolve(user);
      else { location.href = 'login.html'; reject('Not authenticated'); }
    });
  });
}

export function renderAdminShell(activePage = 'dashboard', pageTitle = 'Dashboard') {
  document.body.innerHTML = `
  <div class="admin-wrapper">
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <aside class="admin-sidebar" id="adminSidebar">
      <div class="sidebar-brand">
        <img src="../assets/images/logo.png" alt="SP GlowPetals"
          onerror="this.style.display='none'" style="height:38px;">
        <div>
          <div class="sidebar-brand-text">GlowPetals</div>
          <div class="sidebar-brand-sub">Admin Panel</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <div class="sidebar-label">Main</div>
          <a href="dashboard.html" class="sidebar-item ${activePage === 'dashboard' ? 'active' : ''}">
            <i class="fa-solid fa-gauge-high"></i> Dashboard
          </a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">Catalog</div>
          <a href="products.html" class="sidebar-item ${activePage === 'products' ? 'active' : ''}">
            <i class="fa-solid fa-box-open"></i> Products
          </a>
          <a href="categories.html" class="sidebar-item ${activePage === 'categories' ? 'active' : ''}">
            <i class="fa-solid fa-layer-group"></i> Categories
          </a>
          <a href="banners.html" class="sidebar-item ${activePage === 'banners' ? 'active' : ''}">
            <i class="fa-solid fa-image"></i> Banners
          </a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">Sales</div>
          <a href="orders.html" class="sidebar-item ${activePage === 'orders' ? 'active' : ''}">
            <i class="fa-solid fa-bag-shopping"></i> Orders
          </a>
          <a href="customers.html" class="sidebar-item ${activePage === 'customers' ? 'active' : ''}">
            <i class="fa-solid fa-users"></i> Customers
          </a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">Store</div>
          <a href="../index.html" target="_blank" class="sidebar-item">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> View Store
          </a>
        </div>
      </nav>
      <div class="sidebar-footer">
        <button class="sidebar-logout" id="logoutBtn">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </div>
    </aside>
    <main class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <button class="sidebar-toggle" id="sidebarToggle">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div class="topbar-title" id="topbarTitle">${pageTitle}</div>
        </div>
        <div class="topbar-right">
          <div style="text-align:right;">
            <div class="topbar-name">Admin</div>
            <div class="topbar-role">SP GlowPetals</div>
          </div>
          <div class="topbar-avatar">
            <i class="fa-solid fa-user-shield" style="font-size:1rem;"></i>
          </div>
        </div>
      </header>
      <div class="admin-content" id="adminContent"></div>
    </main>
  </div>
  <div class="toast-container" id="toastContainer"></div>`;

  // Sidebar toggle
  const toggle  = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  toggle?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await adminLogout();
    location.href = 'login.html';
  });
}

// ── Toast ──────────────────────────────────────────────────────────
export function adminToast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const iconMap = {
    success: '<i class="fa-solid fa-circle-check"></i>',
    error:   '<i class="fa-solid fa-circle-xmark"></i>',
    info:    '<i class="fa-solid fa-circle-info"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
  };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${iconMap[type] || iconMap.info}</span><span class="toast-text">${msg}</span>`;
  c.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
}

// ── Modal helpers ──────────────────────────────────────────────────
export function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); el.style.display = 'flex'; }
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    // Small delay to allow CSS transition before hiding
    setTimeout(() => { if (!el.classList.contains('open')) el.style.display = ''; }, 300);
  }
}

// ── confirmDelete — now a proper modal instead of window.confirm ──
// NOTE: For categories, the new categories.html has its own modal.
// This utility is kept for other admin pages that still need it.
export function confirmDelete(msg = 'Delete this item permanently?') {
  // Fallback to native confirm (other admin pages like products/banners use this)
  return window.confirm(msg);
}
