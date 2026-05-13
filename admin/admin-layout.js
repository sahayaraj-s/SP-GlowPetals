/**
 * SP GlowPetals — Admin Shared Layout
 * Injects sidebar, topbar for all admin pages
 */

'use strict';

function injectAdminLayout(pageTitle, activeNavItem) {
  const navItems = [
    { href: 'dashboard.html', icon: '📊', label: 'Dashboard', id: 'dashboard' },
    { href: 'products.html', icon: '📦', label: 'Products', id: 'products' },
    { href: 'banners.html', icon: '🖼️', label: 'Banners', id: 'banners' },
    { href: 'categories.html', icon: '🗂️', label: 'Categories', id: 'categories' },
    { href: 'orders.html', icon: '🛒', label: 'Orders', id: 'orders' },
    { href: 'messages.html', icon: '💬', label: 'Messages', id: 'messages' },
    { href: 'settings.html', icon: '⚙️', label: 'Settings', id: 'settings' },
  ];

  const sidebarHTML = `
    <aside class="admin-sidebar" id="admin-sidebar">
      <div class="admin-sidebar-logo">
        <a class="admin-logo-brand" href="dashboard.html">SP GlowPetals</a>
        <span class="admin-logo-sub">Admin Panel</span>
      </div>

      <nav class="admin-nav">
        <div class="admin-nav-section-title">Main Menu</div>
        ${navItems.slice(0,5).map(item => `
          <a href="${item.href}" class="admin-nav-item ${activeNavItem === item.id ? 'active' : ''}">
            <span class="admin-nav-icon">${item.icon}</span>
            ${item.label}
          </a>`).join('')}
        <div class="admin-nav-section-title">Settings</div>
        ${navItems.slice(5).map(item => `
          <a href="${item.href}" class="admin-nav-item ${activeNavItem === item.id ? 'active' : ''}">
            <span class="admin-nav-icon">${item.icon}</span>
            ${item.label}
          </a>`).join('')}
      </nav>

      <div class="admin-sidebar-footer">
        <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md)">
          <div class="admin-avatar">A</div>
          <div>
            <div style="font-size:.85rem;font-weight:600;color:rgba(255,255,255,.8)" id="admin-sidebar-user">Admin</div>
            <div style="font-size:.72rem;color:rgba(255,255,255,.4)">Administrator</div>
          </div>
        </div>
        <a href="../index.html" style="display:flex;align-items:center;gap:8px;font-size:.8rem;color:rgba(255,255,255,.4);margin-bottom:10px;text-decoration:none;transition:color .2s" onmouseover="this.style.color='rgba(255,255,255,.7)'" onmouseout="this.style.color='rgba(255,255,255,.4)'">
          🏪 View Store
        </a>
        <button class="admin-logout" style="display:flex;align-items:center;gap:8px;font-size:.8rem;color:rgba(255,255,255,.4);background:none;border:none;cursor:pointer;transition:color .2s;padding:0" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='rgba(255,255,255,.4)'">
          🚪 Logout
        </button>
      </div>
    </aside>`;

  const topbarHTML = `
    <div class="admin-topbar">
      <div class="admin-topbar-left">
        <button id="admin-mobile-toggle" style="display:none;background:none;border:none;cursor:pointer;font-size:1.3rem;color:var(--text-secondary);padding:4px" onclick="document.getElementById('admin-sidebar').classList.toggle('mobile-open')">☰</button>
        <div class="admin-page-title">${pageTitle}</div>
      </div>
      <div class="admin-topbar-right">
        <div style="font-size:.78rem;color:var(--text-muted)" id="admin-date"></div>
        <div class="admin-user">
          <span id="admin-username">Admin</span>
          <div class="admin-avatar">A</div>
        </div>
        <!-- Theme -->
        <div class="theme-switcher">
          <button class="theme-btn" id="theme-btn">🎨</button>
          <div class="theme-dropdown" id="theme-dropdown">
            <div class="theme-option" data-theme="light">☀️ Light</div>
            <div class="theme-option" data-theme="dark">🌙 Dark</div>
            <div class="theme-option" data-theme="premium">✨ Premium</div>
          </div>
        </div>
        <button class="admin-logout btn btn-secondary btn-sm">Logout</button>
      </div>
    </div>`;

  // Inject into placeholders
  const sidebarEl = document.getElementById('admin-sidebar-placeholder');
  if (sidebarEl) sidebarEl.outerHTML = sidebarHTML;

  const topbarEl = document.getElementById('admin-topbar-placeholder');
  if (topbarEl) topbarEl.outerHTML = topbarHTML;

  // Set username
  setTimeout(() => {
    const user = typeof Auth !== 'undefined' ? Auth.getUser() : 'Admin';
    document.querySelectorAll('#admin-username, #admin-sidebar-user').forEach(el => {
      if (el) el.textContent = user;
    });
    document.getElementById('admin-date') && (document.getElementById('admin-date').textContent =
      new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' }));
  }, 50);

  // Mobile toggle visibility
  const mobileToggle = document.getElementById('admin-mobile-toggle');
  if (mobileToggle) {
    mobileToggle.style.display = window.innerWidth <= 900 ? 'block' : 'none';
    window.addEventListener('resize', () => {
      mobileToggle.style.display = window.innerWidth <= 900 ? 'block' : 'none';
    });
  }

  // Overlay for mobile sidebar
  const overlay = document.createElement('div');
  overlay.id = 'admin-sidebar-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:calc(var(--z-sticky) - 1);display:none';
  overlay.addEventListener('click', () => {
    document.getElementById('admin-sidebar')?.classList.remove('mobile-open');
    overlay.style.display = 'none';
  });
  document.body.appendChild(overlay);
  document.getElementById('admin-mobile-toggle')?.addEventListener('click', () => {
    overlay.style.display = 'block';
  });
}
