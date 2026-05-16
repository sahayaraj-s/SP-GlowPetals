// SP GlowPetals — Admin Shared Components
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
        <img src="../assets/images/logo.png" alt="SP GlowPetals" onerror="this.style.display='none'" style="height:38px;">
        <div>
          <div class="sidebar-brand-text">GlowPetals</div>
          <div class="sidebar-brand-sub">Admin Panel</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <div class="sidebar-label">Main</div>
          <a href="dashboard.html" class="sidebar-item ${activePage==='dashboard'?'active':''}"><i class="fa fa-home"></i> Dashboard</a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">Catalog</div>
          <a href="products.html" class="sidebar-item ${activePage==='products'?'active':''}"><i class="fa fa-box"></i> Products</a>
          <a href="categories.html" class="sidebar-item ${activePage==='categories'?'active':''}"><i class="fa fa-tags"></i> Categories</a>
          <a href="banners.html" class="sidebar-item ${activePage==='banners'?'active':''}"><i class="fa fa-image"></i> Banners</a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">Sales</div>
          <a href="orders.html" class="sidebar-item ${activePage==='orders'?'active':''}"><i class="fa fa-shopping-bag"></i> Orders</a>
          <a href="customers.html" class="sidebar-item ${activePage==='customers'?'active':''}"><i class="fa fa-users"></i> Customers</a>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-label">Store</div>
          <a href="../index.html" target="_blank" class="sidebar-item"><i class="fa fa-external-link-alt"></i> View Store</a>
        </div>
      </nav>
      <div class="sidebar-footer">
        <button class="sidebar-logout" id="logoutBtn"><i class="fa fa-sign-out-alt"></i> Logout</button>
      </div>
    </aside>
    <main class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <button class="sidebar-toggle" id="sidebarToggle"><i class="fa fa-bars"></i></button>
          <div class="topbar-title" id="topbarTitle">${pageTitle}</div>
        </div>
        <div class="topbar-right">
          <div style="text-align:right;">
            <div class="topbar-name">Admin</div>
            <div class="topbar-role">SP GlowPetals</div>
          </div>
          <div class="topbar-avatar">A</div>
        </div>
      </header>
      <div class="admin-content" id="adminContent"></div>
    </main>
  </div>
  <div class="toast-container" id="toastContainer"></div>`;

  // Sidebar toggle
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  toggle?.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); });
  overlay?.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('open'); });
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await adminLogout(); location.href = 'login.html';
  });
}

export function adminToast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span class="toast-text">${msg}</span>`;
  c.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}

export function openModal(id) { document.getElementById(id)?.classList.add('open'); }
export function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

export function confirmDelete(msg = 'Are you sure you want to delete this item?') {
  return window.confirm(msg);
}
