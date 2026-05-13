import {

  db,

  storage,

  collection,

  addDoc,

  getDocs,

  ref,

  uploadBytes,

  getDownloadURL

} from './firebase.js';

'use strict';

const adminMenuToggle = document.getElementById('admin-menu-toggle');
const adminSidebar = document.querySelector('.admin-sidebar');

if (adminMenuToggle && adminSidebar) {
  adminMenuToggle.addEventListener('click', () => {
    adminSidebar.classList.toggle('mobile-open');
  });
}


/**
 * SP GlowPetals — Admin Auth & Dashboard JS
 * Authentication is handled via encoded config, not plain text.
 */




/* ============================================================
   AUTH CONFIG (encoded — do not store plain credentials in HTML)
   ============================================================ */
const _authCfg = (() => {
  // Encoded: admin / GlowPetals@2025 — change via admin settings
  const _d = atob('eyJ1IjoiYWRtaW4iLCJwIjoiR2xvd1BldGFscyMyMDI1In0=');
  return JSON.parse(_d);
})();

/* ============================================================
   AUTH MANAGER
   ============================================================ */
const Auth = (() => {
  const SESSION_KEY = 'spgp_admin_session';
  const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

  function login(username, password) {
    if (username === _authCfg.u && password === _authCfg.p) {
      const session = { username, loginAt: Date.now(), expiresAt: Date.now() + SESSION_DURATION };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
  }

  function isLoggedIn() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if (!session) return false;
      if (Date.now() > session.expiresAt) { sessionStorage.removeItem(SESSION_KEY); return false; }
      return true;
    } catch { return false; }
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  function getUser() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      return session?.username || 'Admin';
    } catch { return 'Admin'; }
  }

  return { login, logout, isLoggedIn, requireAuth, getUser };
})();

/* ============================================================
   LOGIN PAGE
   ============================================================ */
function initLoginPage() {
  if (Auth.isLoggedIn()) { window.location.href = 'dashboard.html'; return; }

  const form = document.getElementById('admin-login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const btn = form.querySelector('button[type="submit"]');

    if (!username || !password) { showLoginError('Please enter credentials'); return; }

    btn.textContent = 'Signing in…';
    btn.disabled = true;

    setTimeout(() => {
      if (Auth.login(username, password)) {
        Toast.success('Welcome back! Redirecting…');
        setTimeout(() => window.location.href = 'dashboard.html', 800);
      } else {
        showLoginError('Invalid username or password');
        btn.textContent = 'Sign In';
        btn.disabled = false;
      }
    }, 600);
  });

  function showLoginError(msg) {
    const el = document.getElementById('login-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
    Toast.error(msg);
  }

  // Password toggle
  document.getElementById('toggle-password')?.addEventListener('click', () => {
    const input = document.getElementById('login-password');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  });
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
const AdminDashboard = (() => {
  function formatP(p) { return '₹' + Number(p).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }

  function init() {
    if (!Auth.requireAuth()) return;
    updateTopbar();
    renderStats();
    renderRecentProducts();
    renderRecentOrders();
    initLogout();
  }

  function updateTopbar() {
    const userEl = document.getElementById('admin-username');
    if (userEl) userEl.textContent = Auth.getUser();
  }

  function renderStats() {
    const products = DB.getProducts();
    const orders = DB.getOrders();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const wishlist = DB.getWishlist();

    setEl('stat-products', products.length);
    setEl('stat-orders', orders.length);
    setEl('stat-revenue', formatP(totalRevenue));
    setEl('stat-categories', DB.getCategories().length);
  }

  function renderRecentProducts() {
    const tbody = document.getElementById('recent-products-tbody');
    if (!tbody) return;
    const products = DB.getProducts().slice(0, 8);
    if (!products.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">No products yet. <a href="products.html" style="color:var(--primary)">Add your first product</a></td></tr>`;
      return;
    }
    tbody.innerHTML = products.map(p => {
      const price = DB.getDiscountedPrice(p);
      const statusColor = p.stock > 10 ? '#22c55e' : p.stock > 0 ? '#f59e0b' : '#ef4444';
      const statusText = p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock';
      return `
        <tr>
          <td><img src="${p.images?.[0] || ''}" class="admin-table-img" onerror="this.style.display='none'"></td>
          <td><div class="table-name">${p.name}</div><div style="font-size:.75rem;color:var(--text-muted)">${p.sku || ''}</div></td>
          <td>${p.category}</td>
          <td>${formatP(price)}${p.discount > 0 ? `<br><span style="font-size:.72rem;color:#22c55e">${p.discount}% off</span>` : ''}</td>
          <td>${p.stock}</td>
          <td><span style="color:${statusColor};font-weight:600;font-size:.78rem">${statusText}</span></td>
          <td>
            <div class="table-actions">
              <button class="table-action-btn" onclick="window.location.href='products.html?edit=${p.id}'" title="Edit">✏️</button>
              <button class="table-action-btn delete" onclick="AdminProducts.deleteProduct('${p.id}')" title="Delete">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function renderRecentOrders() {
    const tbody = document.getElementById('recent-orders-tbody');
    if (!tbody) return;
    const orders = DB.getOrders().slice(0, 6);
    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted)">No orders yet</td></tr>`;
      return;
    }
    const statusColors = { Pending: '#f59e0b', Processing: '#3b82f6', Shipped: '#8b5cf6', Delivered: '#22c55e', Cancelled: '#ef4444' };
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><div class="table-name">${o.id}</div></td>
        <td>${o.address?.name || '—'}</td>
        <td>${o.items?.length || 0} items</td>
        <td>${formatP(o.total || 0)}</td>
        <td>
          <select onchange="DB.updateOrderStatus('${o.id}', this.value)" 
            style="padding:4px 10px;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--bg-secondary);color:${statusColors[o.status]||'var(--text-primary)'};font-size:.78rem;font-weight:600">
            ${['Pending','Processing','Shipped','Delivered','Cancelled'].map(s =>
              `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('');
  }

  function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function initLogout() {
    document.querySelectorAll('.admin-logout').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) Auth.logout();
      });
    });
  }

  return { init };
})();

/* ============================================================
   ADMIN PRODUCTS MANAGER
   ============================================================ */
const AdminProducts = (() => {
  let editingId = null;
  let imageList = [];

  function formatP(p) { return '₹' + Number(p).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }

  function init() {
    if (!Auth.requireAuth()) return;
    updateTopbar();
    loadCategoriesToForm();
    renderProductsTable();
    initForm();
    initSearch();
    checkEditMode();
    initLogout();
  }

  function updateTopbar() {
    const userEl = document.getElementById('admin-username');
    if (userEl) userEl.textContent = Auth.getUser();
  }

  function checkEditMode() {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) editProduct(editId);
  }

  function loadCategoriesToForm() {
    const select = document.getElementById('product-category');
    if (!select) return;
    const cats = DB.getCategories();
    select.innerHTML = `<option value="">Select Category</option>` +
      cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

  function renderProductsTable() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;
    const query = document.getElementById('products-search')?.value.toLowerCase() || '';
    let products = DB.getProducts();
    if (query) products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.category || '').toLowerCase().includes(query) ||
      (p.sku || '').toLowerCase().includes(query)
    );

    if (!products.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-muted)">No products found</td></tr>`;
      return;
    }
    tbody.innerHTML = products.map(p => {
      const price = DB.getDiscountedPrice(p);
      const stockColor = p.stock > 10 ? '#22c55e' : p.stock > 0 ? '#f59e0b' : '#ef4444';
      return `
        <tr>
          <td><img src="${p.images?.[0] || ''}" class="admin-table-img" onerror="this.style.background='var(--bg-secondary)'"></td>
          <td>
            <div class="table-name">${p.name}</div>
            <div style="font-size:.72rem;color:var(--text-muted)">${p.sku || ''}</div>
            ${p.isFeatured ? '<span class="badge badge-gold" style="font-size:.6rem">Featured</span>' : ''}
            ${p.isTrending ? '<span class="badge badge-accent" style="font-size:.6rem;margin-left:4px">Trending</span>' : ''}
          </td>
          <td>${p.category || '—'}</td>
          <td>${formatP(price)}${p.discount > 0 ? `<br><small style="color:#22c55e">−${p.discount}%</small>` : ''}</td>
          <td style="color:${stockColor};font-weight:700">${p.stock}</td>
          <td><div class="stars" style="font-size:.8rem">${'★'.repeat(Math.round(p.ratings||0))}${'☆'.repeat(5-Math.round(p.ratings||0))}</div></td>
          <td>${new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
          <td>
            <div class="table-actions">
              <button class="table-action-btn" onclick="AdminProducts.editProduct('${p.id}')" title="Edit">✏️</button>
              <button class="table-action-btn delete" onclick="AdminProducts.deleteProduct('${p.id}')" title="Delete">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function initSearch() {
    document.getElementById('products-search')?.addEventListener('input', renderProductsTable);
  }
function initForm() {

  // IMAGE UPLOAD
  document.getElementById('product-image')?.addEventListener('change', function () {

    const files = Array.from(this.files);

    if (!files.length) return;

    files.forEach(file => {

      const reader = new FileReader();

      reader.onload = function (e) {

        imageList.push(e.target.result);

        renderImageList();

      };

      reader.readAsDataURL(file);

    });

  });

    

// TOGGLE SWITCHES
setTimeout(() => {

  document.querySelectorAll('.toggle-switch').forEach(sw => {

    sw.onclick = function () {

      this.classList.toggle('on');

    };

  });

}, 100);

  // FORM SUBMIT
  document.getElementById('product-form')?.addEventListener('submit', (e) => {

    e.preventDefault();

    saveProduct();

  });

  // CANCEL EDIT
  document.getElementById('cancel-edit')
    ?.addEventListener('click', resetForm);
}

  function renderImageList() {

  const container = document.getElementById('image-list');

  if (!container) return;

  container.innerHTML = imageList.map((src, i) => `

    <div style="
      position:relative;
      width:90px;
      height:90px;
      border-radius:12px;
      overflow:hidden;
      border:1px solid var(--border);
    ">

      <img 
        src="${src}" 
        style="
          width:100%;
          height:100%;
          object-fit:cover;
        "
      >

      <button 
        onclick="AdminProducts.removeImage(${i})"
        style="
          position:absolute;
          top:4px;
          right:4px;
          width:22px;
          height:22px;
          border:none;
          border-radius:50%;
          background:#ef4444;
          color:#fff;
          cursor:pointer;
          font-size:12px;
        "
      >
        ✕
      </button>

    </div>

  `).join('');

}

  function removeImage(idx) {
    imageList.splice(idx, 1);
    renderImageList();
  }

  function getToggleValue(id) {
    return document.getElementById(id)?.classList.contains('on') || false;
  }

  async function saveProduct() {
    const name = document.getElementById('product-name-input')?.value.trim();
    const category = document.getElementById('product-category')?.value;
    const price = parseFloat(document.getElementById('product-price')?.value);
    const stock = parseInt(document.getElementById('product-stock')?.value);

    if (!name) { Toast.error('Product name is required'); return; }
    if (!category) { Toast.error('Please select a category'); return; }
    if (!price || price <= 0) { Toast.error('Enter a valid price'); return; }
    if (isNaN(stock) || stock < 0) { Toast.error('Enter a valid stock quantity'); return; }

    const productData = {
      name,
      category,
      price,
      stock,
      description: document.getElementById('product-description')?.value.trim() || '',
      discount: parseFloat(document.getElementById('product-discount')?.value) || 0,
      sku: document.getElementById('product-sku')?.value.trim() || '',
      tags: (document.getElementById('product-tags-input')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
      ratings: parseFloat(document.getElementById('product-ratings')?.value) || 0,
      reviewCount: parseInt(document.getElementById('product-reviews')?.value) || 0,
      images: imageList.slice(),
      isFeatured: getToggleValue('toggle-featured'),
      isTrending: getToggleValue('toggle-trending'),
    };

    if (editingId) {
      DB.updateProduct(editingId, productData);
      Toast.success('Product updated successfully!');
    } else {
     // IMAGE FILE
const fileInput = document.getElementById('product-image');

const file = fileInput.files[0];

let imageURL = '';


// UPLOAD IMAGE TO FIREBASE
if (file) {

  const imageRef = ref(

    storage,

    `products/${Date.now()}-${file.name}`

  );

  await uploadBytes(imageRef, file);

  imageURL = await getDownloadURL(imageRef);

}


// ADD IMAGE URL
productData.images = [imageURL];


// SAVE TO FIRESTORE
await addDoc(

  collection(db, "products"),

  productData

);


Toast.success('Product added successfully!');
      Toast.success('Product added successfully!');
    }

    resetForm();
    renderProductsTable();
  }

  function editProduct(id) {
    const p = DB.getProduct(id);
    if (!p) return;
    editingId = id;
    imageList = p.images?.slice() || [];

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal('product-name-input', p.name);
    setVal('product-description', p.description || '');
    setVal('product-price', p.price);
    setVal('product-discount', p.discount || 0);
    setVal('product-stock', p.stock);
    setVal('product-sku', p.sku || '');
    setVal('product-tags-input', (p.tags || []).join(', '));
    setVal('product-ratings', p.ratings || 0);
    setVal('product-reviews', p.reviewCount || 0);
    setVal('product-category', p.category);

    const setToggle = (id, val) => {
      const el = document.getElementById(id);
      if (el) { el.classList.toggle('on', !!val); }
    };
    setToggle('toggle-featured', p.isFeatured);
    setToggle('toggle-trending', p.isTrending);

    renderImageList();

    const formTitle = document.getElementById('form-title');
    if (formTitle) formTitle.textContent = 'Edit Product';
    document.getElementById('cancel-edit')?.style.setProperty('display', 'inline-flex');

    // Scroll to form
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  function deleteProduct(id) {
    if (!confirm('Delete this product permanently?')) return;
    DB.deleteProduct(id);
    renderProductsTable();
    Toast.success('Product deleted');
  }

  function resetForm() {
    editingId = null;
    imageList = [];
    document.getElementById('product-form')?.reset();
    document.querySelectorAll('.toggle-switch.on').forEach(sw => sw.classList.remove('on'));
    renderImageList();
    const formTitle = document.getElementById('form-title');
    if (formTitle) formTitle.textContent = 'Add New Product';
    document.getElementById('cancel-edit')?.style.setProperty('display', 'none');
  }

  function initLogout() {
    document.querySelectorAll('.admin-logout').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Logout?')) Auth.logout();
      });
    });
  }

  return { init, editProduct, deleteProduct, removeImage, resetForm };
})();

/* ============================================================
   ADMIN BANNERS MANAGER
   ============================================================ */
   let bannerImageData = '';
   let categoryImageData = '';
const AdminBanners = (() => {
  let editingId = null;

  function init() {
   
    if (!Auth.requireAuth()) return;
    renderBannersTable();
    initForm();
    document.getElementById('admin-username') && (document.getElementById('admin-username').textContent = Auth.getUser());
    document.querySelectorAll('.admin-logout').forEach(btn => {
      btn.addEventListener('click', () => { if (confirm('Logout?')) Auth.logout(); });
    });
  }

  function renderBannersTable() {
    const tbody = document.getElementById('banners-tbody');
    if (!tbody) return;
    const banners = DB.getBanners();
    if (!banners.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted)">No banners yet</td></tr>`;
      return;
    }
    tbody.innerHTML = banners.map(b => `
      <tr>
        <td><img src="${b.image}" class="admin-table-img" onerror="this.style.background='var(--bg-secondary)'"></td>
        <td><div class="table-name">${b.title}</div><div style="font-size:.75rem;color:var(--text-muted)">${b.subtitle || ''}</div></td>
        <td>${b.tag || '—'}</td>
        <td>${b.btnText || '—'}</td>
        <td>
          <div class="toggle-switch ${b.active !== false ? 'on' : ''}" onclick="AdminBanners.toggleActive('${b.id}')"></div>
        </td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn" onclick="AdminBanners.editBanner('${b.id}')">✏️</button>
            <button class="table-action-btn delete" onclick="AdminBanners.deleteBanner('${b.id}')">🗑️</button>
          </div>
        </td>
      </tr>`).join('');
  }
  

  function initForm() {
      // IMAGE UPLOAD
   document.getElementById('banner-image')?.addEventListener('change', function () {

   const file = this.files[0];

   if (!file) return;

   const reader = new FileReader();

   reader.onload = function (e) {

    bannerImageData = e.target.result;

   };

   reader.readAsDataURL(file);

   });
   
    document.getElementById('banner-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        title: document.getElementById('banner-title')?.value.trim(),
        subtitle: document.getElementById('banner-subtitle')?.value.trim(),
        tag: document.getElementById('banner-tag')?.value.trim(),
        image: bannerImageData,
        btnText: document.getElementById('banner-btn-text')?.value.trim(),
        btnUrl: document.getElementById('banner-btn-url')?.value.trim(),
        active: true
      };
      if (!data.title) {
  Toast.error('Banner title is required');
  return;
}

if (!bannerImageData) {
  Toast.error('Please upload a banner image');
  return;
}
      if (editingId) { DB.updateBanner(editingId, data); Toast.success('Banner updated!'); }
      else { DB.addBanner(data); Toast.success('Banner added!'); }
      resetForm();
      renderBannersTable();
    });
    document.getElementById('cancel-banner-edit')?.addEventListener('click', resetForm);
  }

  function editBanner(id) {
    const b = DB.getBanners().find(x => x.id === id);
    if (!b) return;
    editingId = id;
    const sv = (eid, val) => { const el = document.getElementById(eid); if (el) el.value = val || ''; };
    sv('banner-title', b.title); sv('banner-subtitle', b.subtitle); sv('banner-tag', b.tag);
    sv('banner-image', b.image); sv('banner-btn-text', b.btnText); sv('banner-btn-url', b.btnUrl);
    document.getElementById('banner-form-title') && (document.getElementById('banner-form-title').textContent = 'Edit Banner');
    document.getElementById('cancel-banner-edit')?.style.setProperty('display', 'inline-flex');
    document.getElementById('banner-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  function deleteBanner(id) {
    if (!confirm('Delete this banner?')) return;
    DB.deleteBanner(id);
    renderBannersTable();
    Toast.success('Banner deleted');
  }

  function toggleActive(id) {
    const b = DB.getBanners().find(x => x.id === id);
    if (b) { DB.updateBanner(id, { active: !b.active }); renderBannersTable(); }
  }

  function resetForm() {
    editingId = null;
    document.getElementById('banner-form')?.reset();
    document.getElementById('banner-form-title') && (document.getElementById('banner-form-title').textContent = 'Add New Banner');
    document.getElementById('cancel-banner-edit')?.style.setProperty('display', 'none');
  }

  return { init, editBanner, deleteBanner, toggleActive };
})();

/* ============================================================
   ADMIN CATEGORIES MANAGER
   ============================================================ */
const AdminCategories = (() => {
  let editingId = null;

  function init() {
    if (!Auth.requireAuth()) return;
    renderCategoriesTable();
    initForm();
    document.getElementById('admin-username') && (document.getElementById('admin-username').textContent = Auth.getUser());
    document.querySelectorAll('.admin-logout').forEach(btn => {
      btn.addEventListener('click', () => { if (confirm('Logout?')) Auth.logout(); });
    });
  }

  function renderCategoriesTable() {
    const tbody = document.getElementById('categories-tbody');
    if (!tbody) return;
    const cats = DB.getCategories();
    tbody.innerHTML = cats.map(c => {
      const count = DB.getProducts().filter(p => p.category === c.name).length;
      return `
        <tr>
          <td><div class="table-name">${c.name}</div></td>
          <td><code style="font-size:.78rem;background:var(--bg-secondary);padding:2px 8px;border-radius:4px">${c.slug || ''}</code></td>
          <td>${c.description || '—'}</td>
          <td><span class="badge badge-primary">${count}</span></td>
          <td>
            <div class="table-actions">
              <button class="table-action-btn" onclick="AdminCategories.editCat('${c.id}')">✏️</button>
              <button class="table-action-btn delete" onclick="AdminCategories.deleteCat('${c.id}')">🗑️</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }
 

  function initForm() {
   // IMAGE UPLOAD
   document.getElementById('cat-image')?.addEventListener('change', function () {

   const file = this.files[0];

   if (!file) return;

   const reader = new FileReader();

   reader.onload = function (e) {

   categoryImageData = e.target.result;

   };

   reader.readAsDataURL(file);

   });
    document.getElementById('category-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cat-name')?.value.trim();
      if (!name) { Toast.error('Category name is required'); return; }
      const data = {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: document.getElementById('cat-description')?.value.trim() || '',
        image: categoryImageData
      };
      if (editingId) {
        const cats = DB.getCategories();
        const idx = cats.findIndex(c => c.id === editingId);
        if (idx > -1) { cats[idx] = { ...cats[idx], ...data }; DB.setCategories(cats); }
        Toast.success('Category updated!');
      } else {
        DB.addCategory(data);
        Toast.success('Category added!');
      }
      resetForm();
      renderCategoriesTable();
    });
    document.getElementById('cancel-cat-edit')?.addEventListener('click', resetForm);
  }

  function editCat(id) {
    const c = DB.getCategories().find(x => x.id === id);
    if (!c) return;
    editingId = id;
    document.getElementById('cat-name').value = c.name;
    document.getElementById('cat-description').value = c.description || '';
    document.getElementById('cat-image').value = c.image || '';
    document.getElementById('cat-form-title') && (document.getElementById('cat-form-title').textContent = 'Edit Category');
    document.getElementById('cancel-cat-edit')?.style.setProperty('display', 'inline-flex');
  }

  function deleteCat(id) {
    if (!confirm('Delete this category?')) return;
    DB.deleteCategory(id);
    renderCategoriesTable();
    Toast.success('Category deleted');
  }

  function resetForm() {
    editingId = null;
    document.getElementById('category-form')?.reset();
    document.getElementById('cat-form-title') && (document.getElementById('cat-form-title').textContent = 'Add Category');
    document.getElementById('cancel-cat-edit')?.style.setProperty('display', 'none');
  }

  return { init, editCat, deleteCat };
})();

 

/* ============================================================
   AUTO-INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.includes('login')) initLoginPage();
  else if (path.includes('dashboard')) AdminDashboard.init();
  else if (path.includes('products') && path.includes('admin')) AdminProducts.init();
  else if (path.includes('banners')) AdminBanners.init();
  else if (path.includes('categories') && path.includes('admin')) AdminCategories.init();
});
