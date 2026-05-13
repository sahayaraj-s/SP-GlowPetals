/**
 * SP GlowPetals — Product Detail, Cart, Wishlist, Checkout, Search JS
 */

'use strict';

/* ============================================================
   PRODUCT DETAIL PAGE
   ============================================================ */
const ProductDetailPage = (() => {
  let product = null;
  let selectedQty = 1;
  let selectedImg = 0;

  function formatP(p) { return '₹' + Number(p).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }

  function load() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { window.location.href = 'shop.html'; return; }
    product = DB.getProduct(id);
    if (!product) { window.location.href = '404.html'; return; }
    render();
    renderRelated();
  }

  function render() {
    document.title = `${product.name} — SP GlowPetals`;

    // Breadcrumb
    const bc = document.getElementById('breadcrumb');
    if (bc) bc.innerHTML = `
      <a href="../index.html">Home</a><span class="breadcrumb-sep">›</span>
      <a href="shop.html">Shop</a><span class="breadcrumb-sep">›</span>
      <a href="shop.html?cat=${encodeURIComponent(product.category)}">${product.category}</a>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">${product.name}</span>`;

    // Gallery
    renderGallery();

    // Info
    const price = DB.getDiscountedPrice(product);
    const rating = product.ratings || 0;
    const stars = Array.from({ length: 5 }, (_, i) =>
      `<span class="star${i < Math.round(rating) ? '' : ' star-empty'}">★</span>`).join('');

    setEl('product-category', product.category);
    setEl('product-name', product.name);
    setEl('product-description', product.description || '');
    setEl('product-sku', product.sku || 'N/A');
    setEl('product-stock-text', product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock');

    const priceWrap = document.getElementById('product-price-wrap');
    if (priceWrap) {
      priceWrap.innerHTML = `
        <div class="price-wrap">
          <span class="price-current" style="font-size:1.8rem">${formatP(price)}</span>
          ${product.discount > 0 ? `<span class="price-original">${formatP(product.price)}</span>
          <span class="price-discount">${product.discount}% OFF</span>` : ''}
        </div>
        ${product.discount > 0 ? `<div style="margin-top:8px;font-size:.82rem;color:#22c55e;font-weight:600">
          You save ${formatP(product.price - price)}!</div>` : ''}`;
    }

    const ratingEl = document.getElementById('product-rating-display');
    if (ratingEl) ratingEl.innerHTML = `
      <div class="stars">${stars}</div>
      <span style="color:var(--text-muted);font-size:.82rem">${rating} (${product.reviewCount || 0} reviews)</span>`;

    // Tags
    const tagsEl = document.getElementById('product-tags');
    if (tagsEl && product.tags?.length) {
      tagsEl.innerHTML = product.tags.map(t =>
        `<span class="badge badge-primary" style="cursor:pointer" onclick="window.location.href='shop.html?q=${encodeURIComponent(t)}'">${t}</span>`
      ).join('');
    }

    // Stock indicator
    const stockEl = document.getElementById('product-stock-indicator');
    if (stockEl) {
      stockEl.textContent = product.stock > 0 ? '● In Stock' : '● Out of Stock';
      stockEl.style.color = product.stock > 0 ? '#22c55e' : '#ef4444';
    }

    // Add to cart / Buy buttons
    const addBtn = document.getElementById('product-add-cart');
    const buyBtn = document.getElementById('product-buy-whatsapp');
    const wishBtn = document.getElementById('product-wishlist');

    if (product.stock === 0) {
      addBtn && (addBtn.disabled = true, addBtn.textContent = 'Out of Stock', addBtn.style.opacity = '0.5');
      buyBtn && (buyBtn.style.display = 'none');
    }

    addBtn?.addEventListener('click', () => {
      DB.addToCart(product, selectedQty);
      Toast.success('Added to cart! 🛒');
    });

    buyBtn?.addEventListener('click', () => openWhatsApp(product, selectedQty));

    wishBtn && (() => {
      const isWished = DB.isWishlisted(product.id);
      wishBtn.innerHTML = isWished ? '❤️ Wishlisted' : '🤍 Wishlist';
      wishBtn.addEventListener('click', () => {
        const added = DB.toggleWishlist(product);
        wishBtn.innerHTML = added ? '❤️ Wishlisted' : '🤍 Wishlist';
        Toast.success(added ? 'Added to wishlist!' : 'Removed from wishlist');
      });
    })();

    // Qty
    initQtyControl();

    // Tabs
    initTabs();

    // Share
    document.getElementById('share-btn')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: product.name, url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        Toast.info('Link copied to clipboard!');
      }
    });
  }

  function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function renderGallery() {
    const imgs = product.images?.length ? product.images : [];
    const mainImg = document.getElementById('gallery-main-img');
    const thumbsWrap = document.getElementById('gallery-thumbs');

    if (mainImg) {
      if (imgs[0]) {
        mainImg.src = imgs[0];
        mainImg.alt = product.name;
        mainImg.onerror = () => { mainImg.style.display = 'none'; };
      } else {
        mainImg.style.display = 'none';
        mainImg.parentElement.innerHTML = `<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:6rem;color:var(--text-muted)">🎁</div>`;
      }
      // Zoom effect
      mainImg.addEventListener('mousemove', (e) => {
        const rect = mainImg.parentElement.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        mainImg.style.transformOrigin = `${x}% ${y}%`;
      });
      mainImg.addEventListener('mouseenter', () => { mainImg.style.transform = 'scale(1.6)'; mainImg.style.cursor = 'zoom-in'; });
      mainImg.addEventListener('mouseleave', () => { mainImg.style.transform = 'scale(1)'; });
    }

    if (thumbsWrap && imgs.length > 1) {
      thumbsWrap.innerHTML = imgs.map((src, i) => `
        <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="ProductDetailPage.selectImg(${i})">
          <img src="${src}" alt="View ${i + 1}" onerror="this.parentElement.style.display='none'">
        </div>`).join('');
    }
  }

  function selectImg(idx) {
    selectedImg = idx;
    const mainImg = document.getElementById('gallery-main-img');
    if (mainImg && product.images?.[idx]) mainImg.src = product.images[idx];
    document.querySelectorAll('.gallery-thumb').forEach((t, i) =>
      t.classList.toggle('active', i === idx));
  }

  function initQtyControl() {
    const minusBtn = document.getElementById('qty-minus');
    const plusBtn = document.getElementById('qty-plus');
    const qtyDisplay = document.getElementById('qty-display');

    function update() { if (qtyDisplay) qtyDisplay.textContent = selectedQty; }
    minusBtn?.addEventListener('click', () => { if (selectedQty > 1) { selectedQty--; update(); } });
    plusBtn?.addEventListener('click', () => {
      if (selectedQty < (product.stock || 99)) { selectedQty++; update(); }
      else Toast.warning('Max available stock reached');
    });
  }

  function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const content = document.getElementById('tab-' + tab.dataset.tab);
        if (content) content.classList.add('active');
      });
    });
  }

  function renderRelated() {
    const grid = document.getElementById('related-products');
    if (!grid) return;
    const related = DB.getProducts()
      .filter(p => p.id !== product.id && p.category === product.category && p.stock > 0)
      .slice(0, 4);
    if (!related.length) { grid.closest('section')?.remove(); return; }
    grid.innerHTML = related.map(p => buildProductCard(p, true)).join('');
    ScrollReveal.init();
  }

  return { load, selectImg };
})();

/* ============================================================
   CART PAGE
   ============================================================ */
const CartPage = (() => {
  function formatP(p) { return '₹' + Number(p).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }

  function render() {
    const cart = DB.getCart();
    const itemsContainer = document.getElementById('cart-items');
    const summaryContainer = document.getElementById('order-summary');
    if (!itemsContainer) return;

    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <a href="shop.html" class="btn btn-primary">Start Shopping</a>
        </div>`;
      if (summaryContainer) summaryContainer.style.display = 'none';
      return;
    }

    itemsContainer.innerHTML = cart.map(item => {
      const price = DB.getDiscountedPrice(item);
      return `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.images?.[0] || ''}" alt="${item.name}" class="cart-item-img" onerror="this.src='';this.style.background='var(--bg-secondary)'">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-variant">${item.category}</div>
            <div class="cart-item-price">${formatP(price)} each</div>
            <div class="qty-control" style="margin-top:10px">
              <button class="qty-btn" onclick="CartPage.changeQty('${item.id}', ${item.qty - 1})">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" onclick="CartPage.changeQty('${item.id}', ${item.qty + 1})">+</button>
            </div>
          </div>
          <div class="cart-item-actions-col">
            <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--primary)">${formatP(price * item.qty)}</div>
            <button class="cart-item-remove" onclick="CartPage.remove('${item.id}')">Remove</button>
            <button class="cart-item-remove" onclick="CartPage.moveToWishlist('${item.id}')" style="color:var(--primary)">Move to Wishlist</button>
          </div>
        </div>`;
    }).join('');

    renderSummary();
  }

  function renderSummary() {
    const cart = DB.getCart();
    const subtotal = DB.getCartTotal();
    const shipping = subtotal >= 499 ? 0 : 50;
    const discount = Number(document.getElementById('applied-discount')?.dataset.amount || 0);
    const total = subtotal + shipping - discount;

    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const discountEl = document.getElementById('summary-discount');
    const totalEl = document.getElementById('summary-total');
    const itemCountEl = document.getElementById('summary-items');

    if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : '₹' + shipping;
    if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    if (itemCountEl) itemCountEl.textContent = DB.getCartCount() + ' items';
    if (discountEl) {
      discountEl.parentElement.style.display = discount > 0 ? 'flex' : 'none';
      discountEl.textContent = '−₹' + discount;
    }

    const freeShippingMsg = document.getElementById('free-shipping-msg');
    if (freeShippingMsg) {
      if (shipping > 0) {
        const remaining = 499 - subtotal;
        freeShippingMsg.textContent = `Add ₹${remaining} more for FREE shipping!`;
        freeShippingMsg.style.display = 'block';
      } else {
        freeShippingMsg.textContent = '🎉 You qualify for FREE shipping!';
        freeShippingMsg.style.display = 'block';
      }
    }
  }

  function changeQty(id, qty) {
    if (qty < 1) { remove(id); return; }
    DB.updateCartQty(id, qty);
    render();
  }

  function remove(id) {
    DB.removeFromCart(id);
    render();
    Toast.info('Item removed from cart');
  }

  function moveToWishlist(id) {
    const product = DB.getProduct(id);
    if (product) { DB.toggleWishlist(product); Toast.success('Moved to wishlist!'); }
    remove(id);
  }

  function applyCoupon() {
    const input = document.getElementById('coupon-input');
    const code = input?.value.trim().toUpperCase();
    const coupons = { 'GLOW10': 10, 'PETALS20': 20, 'FIRST15': 15, 'WELCOME50': 50 };

    if (!code) { Toast.error('Enter a coupon code'); return; }
    const pct = coupons[code];
    if (!pct) { Toast.error('Invalid coupon code'); return; }

    const subtotal = DB.getCartTotal();
    const discountAmt = Math.floor(subtotal * pct / 100);
    const discountEl = document.getElementById('applied-discount');
    if (discountEl) { discountEl.dataset.amount = discountAmt; }
    Toast.success(`Coupon applied! You saved ₹${discountAmt}`);
    renderSummary();
    if (input) input.disabled = true;
    document.getElementById('coupon-btn') && (document.getElementById('coupon-btn').textContent = 'Applied ✓');
  }

  function init() {
    render();
    document.getElementById('coupon-btn')?.addEventListener('click', applyCoupon);
    document.getElementById('clear-cart')?.addEventListener('click', () => {
      if (confirm('Clear all items from cart?')) { DB.clearCart(); render(); Toast.info('Cart cleared'); }
    });
  }

  return { init, render, changeQty, remove, moveToWishlist };
})();

/* ============================================================
   WISHLIST PAGE
   ============================================================ */
const WishlistPage = (() => {
  function render() {
    const grid = document.getElementById('wishlist-grid');
    if (!grid) return;
    const wishlist = DB.getWishlist();
    if (!wishlist.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">🤍</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love for later.</p>
          <a href="shop.html" class="btn btn-primary">Explore Shop</a>
        </div>`;
      return;
    }
    grid.innerHTML = wishlist.map(p => `
      <div class="product-card reveal" data-product-id="${p.id}">
        <div class="product-img-wrap">
          <a href="product-detail.html?id=${p.id}">
            ${p.images?.[0] ? `<img src="${p.images[0]}" class="product-img" onerror="this.style.display='none'">` : '<div class="product-img" style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem">🎁</div>'}
          </a>
          <div class="product-actions" style="opacity:1;transform:none">
            <button class="product-action-btn wishlist-active" onclick="WishlistPage.remove('${p.id}')" title="Remove">❤️</button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-category">${p.category}</div>
          <a href="product-detail.html?id=${p.id}"><div class="product-name">${p.name}</div></a>
          <div class="product-footer" style="margin-top:var(--space-md)">
            <span class="price-current">₹${DB.getDiscountedPrice(p).toLocaleString('en-IN',{maximumFractionDigits:0})}</span>
            <button class="product-add-btn" onclick="WishlistPage.addToCart('${p.id}')">Add to Cart</button>
          </div>
        </div>
      </div>`).join('');
    ScrollReveal.init();
  }

  function remove(id) {
    const p = DB.getWishlist().find(x => x.id === id);
    if (p) DB.toggleWishlist(p);
    render();
    Toast.info('Removed from wishlist');
  }

  function addToCart(id) {
    const p = DB.getProduct(id);
    if (!p) return;
    DB.addToCart(p);
    Toast.success('Added to cart!');
  }

  function clearAll() {
    DB.setWishlist([]);
    DB.initBadges();
    render();
    Toast.info('Wishlist cleared');
  }

  return { render, remove, addToCart, init() { render(); document.getElementById('clear-wishlist')?.addEventListener('click', clearAll); } };
})();

/* ============================================================
   CHECKOUT PAGE
   ============================================================ */
const CheckoutPage = (() => {
  let step = 1;

  function formatP(p) { return '₹' + Number(p).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }

  function renderOrderSummary() {
    const container = document.getElementById('checkout-order-items');
    if (!container) return;
    const cart = DB.getCart();
    if (!cart.length) { window.location.href = 'cart.html'; return; }

    container.innerHTML = cart.map(item => {
      const price = DB.getDiscountedPrice(item);
      return `
        <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
          <div style="width:56px;height:56px;border-radius:var(--radius-sm);overflow:hidden;background:var(--bg-secondary);flex-shrink:0">
            ${item.images?.[0] ? `<img src="${item.images[0]}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : '<div style="height:100%;display:flex;align-items:center;justify-content:center">🎁</div>'}
          </div>
          <div style="flex:1">
            <div style="font-size:.88rem;font-weight:600">${item.name}</div>
            <div style="font-size:.78rem;color:var(--text-muted)">Qty: ${item.qty}</div>
          </div>
          <div style="font-weight:700;color:var(--primary);font-size:.9rem">${formatP(price * item.qty)}</div>
        </div>`;
    }).join('');

    const subtotal = DB.getCartTotal();
    const shipping = subtotal >= 499 ? 0 : 50;
    document.getElementById('checkout-subtotal').textContent = formatP(subtotal);
    document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'FREE' : formatP(shipping);
    document.getElementById('checkout-total').textContent = formatP(subtotal + shipping);
  }

  function goToStep(n) {
    step = n;
    document.querySelectorAll('.checkout-step').forEach((el, i) => {
      el.classList.toggle('active', i + 1 === n);
      el.classList.toggle('done', i + 1 < n);
    });
    document.querySelectorAll('.checkout-section[data-step]').forEach(sec => {
      sec.style.display = sec.dataset.step == n ? 'block' : 'none';
    });
  }

  function validateStep1() {
    const fields = ['first-name', 'last-name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    let valid = true;
    fields.forEach(f => {
      const el = document.getElementById(f);
      const err = document.getElementById(f + '-err');
      if (!el?.value.trim()) {
        valid = false;
        if (err) err.textContent = 'This field is required';
        el?.style.setProperty('border-color', '#ef4444');
      } else {
        if (err) err.textContent = '';
        el?.style.setProperty('border-color', '');
      }
    });
    if (!valid) Toast.error('Please fill all required fields');
    return valid;
  }

  function placeOrder() {
    const cart = DB.getCart();
    const subtotal = DB.getCartTotal();
    const shipping = subtotal >= 499 ? 0 : 50;
    const order = {
      items: cart,
      subtotal, shipping, total: subtotal + shipping,
      address: {
        name: `${document.getElementById('first-name')?.value} ${document.getElementById('last-name')?.value}`,
        phone: document.getElementById('phone')?.value,
        email: document.getElementById('email')?.value,
        line1: document.getElementById('address')?.value,
        city: document.getElementById('city')?.value,
        state: document.getElementById('state')?.value,
        pincode: document.getElementById('pincode')?.value
      },
      paymentMethod: document.querySelector('.payment-option.selected')?.dataset.method || 'cod'
    };
    const savedOrder = DB.addOrder(order);
    DB.clearCart();

    // Show confirmation
    document.getElementById('checkout-form')?.remove();
    const confirm = document.getElementById('order-confirmation');
    if (confirm) {
      confirm.style.display = 'block';
      const orderId = document.getElementById('confirm-order-id');
      if (orderId) orderId.textContent = savedOrder.id;
    }
    Toast.success('🎉 Order placed successfully!');

    // WhatsApp notification
    const message = encodeURIComponent(
      `🛍️ *New Order Placed!*\n\nOrder ID: ${savedOrder.id}\n` +
      `Name: ${order.address.name}\nPhone: ${order.address.phone}\n` +
      `Items: ${cart.length}\nTotal: ₹${order.total.toLocaleString()}\n\nPlease confirm!`
    );
    setTimeout(() => {
      window.open(`https://wa.me/919384845814?text=${message}`, '_blank');
    }, 1500);
  }

  function initPaymentOptions() {
    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });
  }

  function init() {
    renderOrderSummary();
    initPaymentOptions();

    document.getElementById('step1-next')?.addEventListener('click', () => {
      if (validateStep1()) goToStep(2);
    });
    document.getElementById('step2-next')?.addEventListener('click', () => {
      goToStep(3);
    });
    document.getElementById('step2-back')?.addEventListener('click', () => goToStep(1));
    document.getElementById('step3-back')?.addEventListener('click', () => goToStep(2));
    document.getElementById('place-order')?.addEventListener('click', () => {
      placeOrder();
    });
  }

  return { init };
})();

/* ============================================================
   SEARCH RESULTS PAGE
   ============================================================ */
const SearchPage = (() => {
  function render() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const queryEl = document.getElementById('search-query-display');
    if (queryEl) queryEl.textContent = `"${query}"`;

    const searchInput = document.getElementById('search-input-main');
    if (searchInput) searchInput.value = query;

    if (!query) {
      showEmpty('Enter a search term to find products');
      return;
    }

    const q = query.toLowerCase();
    const results = DB.getProducts().filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );

    const grid = document.getElementById('search-results-grid');
    const count = document.getElementById('search-results-count');
    if (count) count.innerHTML = `Found <span>${results.length}</span> result${results.length !== 1 ? 's' : ''} for "${query}"`;

    if (!results.length) {
      showEmpty(`No results found for "${query}". Try a different keyword.`);
      return;
    }

    if (grid) {
      grid.innerHTML = results.map(p => buildProductCard(p, true)).join('');
      ScrollReveal.init();
    }
  }

  function showEmpty(msg) {
    const grid = document.getElementById('search-results-grid');
    if (grid) grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">🔍</div>
      <h3>No Results</h3>
      <p>${msg}</p>
      <a href="shop.html" class="btn btn-primary btn-sm">Browse All Products</a>
    </div>`;
  }

  function init() {
    render();
    document.getElementById('search-form-main')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('search-input-main')?.value.trim();
      if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    });
  }

  return { init };
})();

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value.trim();
    const email = document.getElementById('contact-email')?.value.trim();
    const subject = document.getElementById('contact-subject')?.value.trim();
    const message = document.getElementById('contact-message')?.value.trim();
    const errors = [];

    if (!name) errors.push('Name is required');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
    if (!subject) errors.push('Subject is required');
    if (!message || message.length < 10) errors.push('Message must be at least 10 characters');

    if (errors.length) { Toast.error(errors[0]); return; }

    // Save to local storage
    const contacts = DB.get('contact_messages') || [];
    contacts.push({ name, email, subject, message, date: new Date().toISOString() });
    DB.set('contact_messages', contacts);

    Toast.success('Message sent! We\'ll reply within 24 hours. 💌');
    form.reset();
  });
}

/* ============================================================
   AUTO-INIT BY PAGE
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('product-detail')) ProductDetailPage.load();
  if (path.includes('cart')) CartPage.init();
  if (path.includes('wishlist')) WishlistPage.init();
  if (path.includes('checkout')) CheckoutPage.init();
  if (path.includes('search')) SearchPage.init();
  if (path.includes('contact')) initContactForm();
});
