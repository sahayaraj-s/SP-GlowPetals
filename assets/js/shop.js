/**
 * SP GlowPetals — Shop Page JS
 * Handles: Filter, Sort, Search, Grid/List view, Pagination
 */

'use strict';

const ShopPage = (() => {
  let allProducts = [];
  let filteredProducts = [];
  let selectedCategories = [];
  let priceMin = 0;
  let priceMax = 100000;
  let sortBy = 'latest';
  let viewMode = 'grid';
  let searchQuery = '';

  function formatP(p) {
    return '₹' + Number(p).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  /* ---- Load ---- */
  function load() {
    allProducts = DB.getProducts();
    // URL params
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat');
    const qParam = params.get('q');
    if (catParam) {
      selectedCategories = [catParam];
      document.querySelectorAll('.filter-option').forEach(opt => {
        if (opt.dataset.value === catParam) opt.classList.add('checked');
      });
    }
    if (qParam) {
      searchQuery = qParam;
      const shopSearch = document.getElementById('shop-search');
      if (shopSearch) shopSearch.value = qParam;
    }

    renderCategoryFilters();
    updatePriceDisplay();
    applyFilters();
  }

  /* ---- Category Filters ---- */
  function renderCategoryFilters() {
    const container = document.getElementById('category-filter-options');
    if (!container) return;
    const categories = DB.getCategories();
    container.innerHTML = categories.map(cat => {
      const count = allProducts.filter(p => p.category === cat.name).length;
      const isChecked = selectedCategories.includes(cat.name);
      return `
        <label class="filter-option ${isChecked ? 'checked' : ''}" data-value="${cat.name}">
          <div class="filter-checkbox">${isChecked ? '✓' : ''}</div>
          <span class="filter-option-label">${cat.name}</span>
          <span class="filter-count">${count}</span>
        </label>`;
    }).join('');

    container.querySelectorAll('.filter-option').forEach(opt => {
      opt.addEventListener('click', () => toggleCategory(opt.dataset.value, opt));
    });
  }

  function toggleCategory(cat, el) {
    el.classList.toggle('checked');
    const checkbox = el.querySelector('.filter-checkbox');
    if (el.classList.contains('checked')) {
      selectedCategories.push(cat);
      checkbox.innerHTML = '✓';
    } else {
      selectedCategories = selectedCategories.filter(c => c !== cat);
      checkbox.innerHTML = '';
    }
    applyFilters();
  }

  /* ---- Price Range ---- */
  function updatePriceDisplay() {
    const display = document.getElementById('price-display');
    if (display) display.textContent = `${formatP(priceMin)} – ${formatP(priceMax)}`;
  }

  function initPriceRange() {
    const minRange = document.getElementById('price-min-range');
    const maxRange = document.getElementById('price-max-range');
    const fill = document.getElementById('price-range-fill');

    if (!minRange || !maxRange) return;

    function updateFill() {
      const min = parseInt(minRange.value);
      const max = parseInt(maxRange.value);
      const minPct = (min / parseInt(minRange.max)) * 100;
      const maxPct = (max / parseInt(maxRange.max)) * 100;
      if (fill) { fill.style.left = minPct + '%'; fill.style.right = (100 - maxPct) + '%'; }
      updatePriceDisplay();
    }

    minRange.addEventListener('input', () => {
      priceMin = parseInt(minRange.value);
      if (priceMin >= priceMax) { priceMin = priceMax - 100; minRange.value = priceMin; }
      updateFill(); applyFilters();
    });
    maxRange.addEventListener('input', () => {
      priceMax = parseInt(maxRange.value);
      if (priceMax <= priceMin) { priceMax = priceMin + 100; maxRange.value = priceMax; }
      updateFill(); applyFilters();
    });
    updateFill();
  }

  /* ---- Apply Filters & Sort ---- */
  function applyFilters() {
    filteredProducts = allProducts.filter(p => {
      const price = DB.getDiscountedPrice(p);
      const inCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const inPrice = price >= priceMin && price <= priceMax;
      const inSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return inCategory && inPrice && inSearch;
    });

    // Sort
    switch (sortBy) {
      case 'price-asc': filteredProducts.sort((a, b) => DB.getDiscountedPrice(a) - DB.getDiscountedPrice(b)); break;
      case 'price-desc': filteredProducts.sort((a, b) => DB.getDiscountedPrice(b) - DB.getDiscountedPrice(a)); break;
      case 'name-asc': filteredProducts.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': filteredProducts.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'latest': default: filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }
    renderProducts();
    updateResultsCount();
  }

  /* ---- Render Products ---- */
  function renderProducts() {
    const grid = document.getElementById('shop-products-grid');
    if (!grid) return;

    if (filteredProducts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search query.</p>
          <button onclick="ShopPage.reset()" class="btn btn-primary btn-sm">Clear Filters</button>
        </div>`;
      return;
    }

    if (viewMode === 'list') {
      grid.style.gridTemplateColumns = '1fr';
      grid.innerHTML = filteredProducts.map(p => buildProductListItem(p)).join('');
    } else {
      grid.style.gridTemplateColumns = '';
      grid.innerHTML = filteredProducts.map(p => buildProductCard(p, true)).join('');
    }
    ScrollReveal.init();
  }

function buildProductCard(product, showActions = true) {

  const price = DB.getDiscountedPrice(product);

  const isWished = DB.isWishlisted(product.id);

  return `
  
  <div class="product-card reveal">

      <div class="product-image-wrap">

          <a href="product-detail.html?id=${product.id}">

              <img 
                src="${product.images?.[0] || '../assets/images/placeholder.png'}" 
                alt="${product.name}"
                class="product-image"
              >

          </a>

          <div class="product-badges">

              ${product.trending ? `<span class="badge badge-trending">TRENDING</span>` : ''}

              ${product.featured ? `<span class="badge badge-featured">FEATURED</span>` : ''}

              ${product.discount > 0 ? `<span class="badge badge-sale">${product.discount}% OFF</span>` : ''}

          </div>

      </div>

      <div class="product-content">

          <div class="product-category">
              ${product.category || ''}
          </div>

          <h3 class="product-name">
              ${product.name}
          </h3>

          <div class="product-price">

              <span class="price-current">
                  ₹${price}
              </span>

              ${
                product.discount > 0
                ? `<span class="price-original">₹${product.price}</span>`
                : ''
              }

          </div>

          ${
            showActions
            ? `
            <button 
              class="btn btn-primary btn-sm"
              onclick="handleAddToCart('${product.id}')"
            >
              Add to Cart
            </button>
            `
            : ''
          }

      </div>

  </div>

  `;
}

  /* ---- Update Count ---- */
  function updateResultsCount() {
    const el = document.getElementById('results-count');
    if (el) el.innerHTML = `Showing <span>${filteredProducts.length}</span> of ${allProducts.length} products`;
  }

  /* ---- Reset ---- */
  function reset() {
    selectedCategories = [];
    priceMin = 0;
    priceMax = 100000;
    sortBy = 'latest';
    searchQuery = '';
    const shopSearch = document.getElementById('shop-search');
    if (shopSearch) shopSearch.value = '';
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'latest';
    document.querySelectorAll('.filter-option.checked').forEach(el => {
      el.classList.remove('checked');
      el.querySelector('.filter-checkbox').innerHTML = '';
    });
    applyFilters();
  }

  /* ---- Init Controls ---- */
  function initControls() {
    // Sort
    const sortSelect = document.getElementById('sort-select');
    sortSelect?.addEventListener('change', () => { sortBy = sortSelect.value; applyFilters(); });

    // Search
    const shopSearch = document.getElementById('shop-search');
    shopSearch?.addEventListener('input', () => {
      searchQuery = shopSearch.value.trim();
      applyFilters();
    });

    // View toggle
    document.getElementById('view-grid')?.addEventListener('click', () => {
      viewMode = 'grid';
      document.getElementById('view-grid')?.classList.add('active');
      document.getElementById('view-list')?.classList.remove('active');
      renderProducts();
    });
    document.getElementById('view-list')?.addEventListener('click', () => {
      viewMode = 'list';
      document.getElementById('view-list')?.classList.add('active');
      document.getElementById('view-grid')?.classList.remove('active');
      renderProducts();
    });

    // Filter reset
    document.getElementById('filter-reset')?.addEventListener('click', reset);

    // Mobile filter toggle
    document.getElementById('filter-toggle')?.addEventListener('click', () => {
      const sidebar = document.getElementById('filter-sidebar');
      sidebar?.classList.toggle('mobile-open');
    });
  }

  return { load, applyFilters, reset, init() { load(); initPriceRange(); initControls(); } };
})();

document.addEventListener('DOMContentLoaded', () => ShopPage.init());
