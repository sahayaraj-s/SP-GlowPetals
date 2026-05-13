/**
 * SP GlowPetals — Home Page JS
 * Handles: Hero slider, featured products, categories, offers, testimonials, newsletter
 */

'use strict';

/* ---- Hero Slider ---- */
const HeroSlider = (() => {
  let current = 0;
  let timer;
  const DELAY = 5000;

  function init() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    if (!slides.length) return;

    function goTo(idx) {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() { timer = setInterval(next, DELAY); }
    function stopAuto() { clearInterval(timer); }

    // Dots
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
    });

    // Arrows
    document.getElementById('hero-prev')?.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
    document.getElementById('hero-next')?.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

    startAuto();
  }
  return { init };
})();

/* ---- Render Banners from DB ---- */
function renderHeroBanners() {
  const slider = document.getElementById('hero-slider');
  const dotsContainer = document.getElementById('hero-dots');
  if (!slider) return;

  const banners = DB.getBanners().filter(b => b.active !== false);

  // If no banners in DB, show placeholder slides
  if (banners.length === 0) {
    const placeholders = [
      { title: 'Gift Love,<br><em>Gift Memories</em>', sub: 'Handcrafted candles, flowers & personalized gifts for every occasion.', img: 'assets/images/banner1.png', tag: 'New Collection' },
      { title: 'Surprise<br><em>Someone Special</em>', sub: 'Curated surprise boxes filled with warmth and joy.', img: 'assets/images/banner2.png', tag: 'Surprise Boxes' },
      { title: 'Romantic<br><em>Gifting Redefined</em>', sub: 'Express love with our exclusive romantic gift collections.', img: 'assets/images/banner3.png', tag: 'Romantic Gifts' }
    ];
    slider.innerHTML = placeholders.map((b, i) => `
      <div class="hero-slide ${i === 0 ? 'active' : ''}">
        <img src="${b.img}" alt="${b.title}" class="hero-slide-img" onerror="this.style.display='none'">
        <div class="hero-slide-overlay"></div>
        <div class="hero-content">
          <div class="hero-tag">${b.tag}</div>
          <h1 class="hero-title">${b.title}</h1>
          <p class="hero-sub">${b.sub}</p>
          <div class="hero-actions">
            <a href="pages/shop.html" class="btn btn-gold btn-lg">Shop Now</a>
            <a href="pages/categories.html" class="btn btn-ghost btn-lg">Explore</a>
          </div>
        </div>
      </div>`).join('');

    if (dotsContainer) {
      dotsContainer.innerHTML = placeholders.map((_, i) =>
        `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></button>`
      ).join('');
    }
    return;
  }

  slider.innerHTML = banners.map((b, i) => `
    <div class="hero-slide ${i === 0 ? 'active' : ''}">
      <img src="${b.image}" alt="${b.title}" class="hero-slide-img" onerror="this.style.display='none'">
      <div class="hero-slide-overlay"></div>
      <div class="hero-content">
        ${b.tag ? `<div class="hero-tag">${b.tag}</div>` : ''}
        <h1 class="hero-title">${b.title}</h1>
        ${b.subtitle ? `<p class="hero-sub">${b.subtitle}</p>` : ''}
        <div class="hero-actions">
          <a href="${b.btnUrl || 'pages/shop.html'}" class="btn btn-gold btn-lg">${b.btnText || 'Shop Now'}</a>
          <a href="pages/categories.html" class="btn btn-ghost btn-lg">Explore</a>
        </div>
      </div>
    </div>`).join('');

  if (dotsContainer) {
    dotsContainer.innerHTML = banners.map((_, i) =>
      `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></button>`
    ).join('');
  }
}

/* ---- Render Featured Categories ---- */
function renderCategories() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;
  const cats = DB.getCategories();
  if (!cats.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📦</div><p>No categories yet. Add them from admin.</p></div>`;
    return;
  }
  grid.innerHTML = cats.slice(0, 7).map((cat, i) => {
    const products = DB.getProducts().filter(p => p.category === cat.name);
    return `
      <div class="category-card reveal reveal-delay-${(i % 4) + 1}">
        <img src="${cat.image || `assets/images/cat-${cat.slug || i + 1}.png`}" alt="${cat.name}" class="category-img" onerror="this.style.display='none'">
        <div class="category-overlay"></div>
        <div class="category-info">
          <div class="category-name">${cat.name}</div>
          <div class="category-count">${products.length} Items</div>
        </div>
        ${i === 0 ? '<div class="category-badge-placeholder">Popular</div>' : ''}
        <a href="pages/shop.html?cat=${encodeURIComponent(cat.name)}" class="stretched-link"></a>
      </div>`;
  }).join('');

  // Make whole card clickable
  grid.querySelectorAll('.category-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        const link = card.querySelector('.stretched-link');
        if (link) window.location.href = link.href;
      }
    });
  });
}

/* ---- Render Trending Products ---- */
function renderTrendingProducts() {
  const grid = document.getElementById('trending-products');
  if (!grid) return;
  const trending = DB.getProducts().filter(p => p.isTrending && p.stock > 0).slice(0, 8);
  if (!trending.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">🎁</div>
      <h3>No trending products yet</h3>
      <p>Add products from the admin panel to display them here.</p>
    </div>`;
    return;
  }
  grid.innerHTML = trending.map(p => buildProductCard(p)).join('');
  ScrollReveal.init();
}

/* ---- Render Featured Products ---- */
function renderFeaturedProducts() {
  const grid = document.getElementById('featured-products');
  if (!grid) return;
  const featured = DB.getProducts().filter(p => p.isFeatured && p.stock > 0).slice(0, 4);
  if (!featured.length) { grid.style.display = 'none'; return; }
  grid.innerHTML = featured.map(p => buildProductCard(p)).join('');
  ScrollReveal.init();
}

/* ---- Render Testimonials ---- */
function renderTestimonials() {

  const testimonials = [
    {
      name: 'Priya S.',
      role: 'Regular Customer',
      text: 'The candle gift set was absolutely beautiful! Perfect for my anniversary gift.',
      rating: 5
    },
    {
      name: 'Rahul M.',
      role: 'Gift Buyer',
      text: 'Ordered a surprise box for my wife birthday. Amazing quality and packaging.',
      rating: 5
    },
    {
      name: 'Ananya K.',
      role: 'Corporate Client',
      text: 'Personalized gifts were excellent and delivery was very fast.',
      rating: 5
    }
  ];

  const track = document.getElementById('testimonials-track');

  if (!track) return;

  track.innerHTML = testimonials.map((t, i) => `
    <div class="testimonial-card">
      <div class="testimonial-quote">"</div>

      <p class="testimonial-text">
        ${t.text}
      </p>

      <div class="testimonial-author">

        <div class="testimonial-avatar">
          ${t.name.charAt(0)}
        </div>

        <div>
          <div class="testimonial-name">${t.name}</div>

          <div class="testimonial-role">
            ${t.role}
          </div>

          <div class="stars">
            ★★★★★
          </div>
        </div>

      </div>
    </div>
  `).join('');

}

/* ---- Newsletter ---- */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.error('Please enter a valid email address');
      return;
    }
    // Store subscriber
    const subs = DB.get('subscribers') || [];
    if (!subs.includes(email)) {
      subs.push(email);
      DB.set('subscribers', subs);
      Toast.success('🎉 You\'re subscribed! Welcome to GlowPetals family.');
      input.value = '';
    } else {
      Toast.info('You\'re already subscribed!');
    }
  });
}

/* ---- Init Home Page ---- */
document.addEventListener('DOMContentLoaded', () => {
  renderHeroBanners();
  HeroSlider.init();
  renderCategories();
  renderTrendingProducts();
  renderFeaturedProducts();
  renderTestimonials();
  initNewsletter();
});
