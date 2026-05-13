# 🌸 SP GlowPetals — Premium Gift eCommerce Website

A complete, professional, multi-page eCommerce frontend for SP GlowPetals gifting brand.
Built with pure HTML5, CSS3, and Vanilla JavaScript — no frameworks, no backend required.

---

## 🗂️ Folder Structure

```
spglowpetals/
├── index.html                    ← Home Page
├── assets/
│   ├── css/
│   │   ├── variables.css         ← CSS Variables & Themes
│   │   ├── global.css            ← Base Styles, Utilities, Components
│   │   ├── navbar-footer.css     ← Navbar, Footer, Cart Drawer
│   │   ├── home.css              ← Home Page Styles
│   │   ├── shop.css              ← Shop, Product, Cart, Checkout Styles
│   │   └── admin.css             ← Admin Panel Styles
│   ├── js/
│   │   ├── core.js               ← Theme, DB, Toast, Modal, Scroll, Cart
│   │   ├── components.js         ← Navbar/Footer HTML injection
│   │   ├── home.js               ← Home Page Logic
│   │   ├── shop.js               ← Shop Filters, Sort, View Toggle
│   │   ├── pages.js              ← Product Detail, Cart, Wishlist, Checkout, Search
│   │   └── admin.js              ← Auth, Dashboard, Products, Banners, Categories
│   └── images/
│       ├── logo.png              ← Your logo here
│       ├── ti.png                ← Your favicon here
│       ├── banner1.png           ← Hero banners
│       ├── banner2.png
│       ├── banner3.png
│       ├── offer1.png            ← Offer section backgrounds
│       ├── offer2.png
│       ├── about1.png            ← About page image
│       ├── cat-1.png to cat-7.png ← Category images
│       ├── products/             ← Product images folder
│       └── README.txt            ← Image sizing guide
├── pages/
│   ├── shop.html                 ← Shop Page
│   ├── product-detail.html       ← Product Detail Page
│   ├── cart.html                 ← Cart Page
│   ├── wishlist.html             ← Wishlist Page
│   ├── checkout.html             ← Checkout Page
│   ├── search.html               ← Search Results Page
│   ├── categories.html           ← All Categories Page
│   ├── about.html                ← About Page
│   ├── contact.html              ← Contact Page
│   └── 404.html                  ← 404 Error Page
└── admin/
    ├── login.html                ← Admin Login
    ├── dashboard.html            ← Admin Dashboard
    ├── products.html             ← Product Management
    ├── banners.html              ← Banner Management
    ├── categories.html           ← Category Management
    ├── orders.html               ← Order Management
    ├── messages.html             ← Contact Messages
    ├── settings.html             ← Store Settings
    └── admin-layout.js           ← Shared Admin Sidebar/Topbar
```

---

## 🚀 Setup Instructions

### Step 1 — Download & Extract
Extract the project ZIP to any folder on your computer.

### Step 2 — Add Your Images
Open `assets/images/` and place your images:
- `logo.png` — your brand logo
- `ti.png` — browser tab icon
- `banner1.png`, `banner2.png`, `banner3.png` — hero slider images
- `offer1.png`, `offer2.png` — offer section backgrounds
- Product images go in `assets/images/products/`

See `assets/images/README.txt` for recommended sizes.

### Step 3 — Open in Browser
Simply open `index.html` in any modern browser.
No server required for basic browsing.

> 💡 For full functionality (localStorage), open via a local server:
> - VS Code: Install "Live Server" extension → Right-click index.html → Open with Live Server
> - Or run: `npx serve .` in the project folder

### Step 4 — Admin Panel Setup
1. Go to `admin/login.html`
2. Default credentials:
   - **Username:** `admin`
   - **Password:** `GlowPetals#2025`
3. Add your products, categories, and banners
4. Everything saves automatically to browser localStorage

---

## 🎨 Theme System

The site supports 3 themes switchable from the navbar:
- ☀️ **Light** — Warm, elegant default
- 🌙 **Dark** — Rich, dark luxury look
- ✨ **Premium** — Deep purple/gold premium feel

Theme preference is saved per browser.

---

## 🛍️ Features

### Customer Side
- ✅ Hero banner auto-slider (from Admin)
- ✅ Category browsing & filtering
- ✅ Product shop with filters (category, price, search)
- ✅ Sort by: Latest, Price, Name A-Z
- ✅ Grid/List view toggle
- ✅ Product detail with image gallery + zoom
- ✅ Add to Cart, Wishlist
- ✅ Cart drawer (slide-in)
- ✅ Full cart page with coupon codes
- ✅ Checkout with delivery form + payment selection
- ✅ WhatsApp Buy Now button
- ✅ Search results page
- ✅ Scroll reveal animations
- ✅ Toast notifications
- ✅ Mobile-first responsive design

### Admin Panel
- ✅ Secure session-based login
- ✅ Dashboard with live stats
- ✅ Add/Edit/Delete Products (full form with toggles)
- ✅ Add/Edit/Delete Banners (active/inactive toggle)
- ✅ Manage Categories
- ✅ View & Update Order Status
- ✅ Read Contact Messages
- ✅ Export/Import JSON backup
- ✅ Store Settings

---

## 💬 WhatsApp Integration

**Contact/Buy Number:** +91 93848 45814

When a customer clicks **Buy on WhatsApp**, a pre-formatted message is sent:
```
Hello SP GlowPetals! 🌸

I'm interested in purchasing:

📦 Product: [Product Name]
🔢 Quantity: [Qty]
💰 Price: ₹[Price] each
💳 Total: ₹[Total]

Please confirm availability and assist me with the order.
```

---

## 🎟️ Default Coupon Codes

| Code | Discount |
|------|----------|
| `GLOW10` | 10% off |
| `PETALS20` | 20% off |
| `FIRST15` | 15% off |
| `WELCOME50` | 50% off |

Edit codes in `assets/js/pages.js` → `CartPage.applyCoupon()`.

---

## 🔐 Security Note

Admin credentials are encoded (not plaintext) in `assets/js/admin.js`.
To change the default password:
1. Open `assets/js/admin.js`
2. Update the `_authCfg` encoded string
3. Or use `btoa(JSON.stringify({u:"admin",p:"YourNewPassword"}))` to generate a new encoded string

---

## 📱 Contact

- **WhatsApp:** +91 93848 45814
- **Email:** spgpsupport@gmail.com

---

## 📄 License

This project is for SP GlowPetals brand use. All rights reserved.
