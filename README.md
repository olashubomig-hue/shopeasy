# ShopEasy — Premium Vanilla eCommerce Web Application

**ShopEasy** is an award-style, responsive multi-page eCommerce website built with pure **HTML5, Vanilla CSS, and JavaScript**, plus **Three.js** (loaded from cdnjs) for a tactile, glossy 3D clay-and-glass hero scene.

The design features a warm cream and sage palette, editorial Fraunces & DM Sans typography, a preloader, a sliding cart drawer, instant full-screen search, live filtering with grid/list layouts, simulated authentication, and Paystack payment integration.

---

## 📁 Exact Filenames to Drop in `/images`

The application includes an automatic **Picsum Seed Fallback mechanism** via a global capture-phase error listener. If any local image is absent, a placeholder is immediately loaded so the interface never breaks.

To supply your own high-resolution photography, drop the following **lowercase** filenames directly into the `images/` directory:

### Hero Banners (Promo Slider)
- `hero1.jpg` — Audio & electronics showcase (recommended 1920×800)
- `hero2.jpg` — Streetwear & apparel lookbook (recommended 1920×800)
- `hero3.jpg` — Artisanal home living banner (recommended 1920×800)

### Category Showcase Tiles
- `cat-electronics.jpg` — Electronics & Sound department tile (recommended 800×600)
- `cat-fashion.jpg` — Fashion & Apparel department tile (recommended 800×600)
- `cat-home.jpg` — Home & Living department tile (recommended 800×600)

### Product Catalog Photos (14 Items)
- `headphones.jpg` (+ optional `headphones-2.jpg`, `headphones-3.jpg`)
- `watch.jpg` (+ optional `watch-2.jpg`, `watch-3.jpg`)
- `speaker.jpg` (+ optional `speaker-2.jpg`, `speaker-3.jpg`)
- `mouse.jpg` (+ optional `mouse-2.jpg`, `mouse-3.jpg`)
- `webcam.jpg` (+ optional `webcam-2.jpg`, `webcam-3.jpg`)
- `sneakers.jpg` (+ optional `sneakers-2.jpg`, `sneakers-3.jpg`)
- `backpack.jpg` (+ optional `backpack-2.jpg`, `backpack-3.jpg`)
- `sunglasses.jpg` (+ optional `sunglasses-2.jpg`, `sunglasses-3.jpg`)
- `chronograph.jpg` (+ optional `chronograph-2.jpg`, `chronograph-3.jpg`)
- `duffel.jpg` (+ optional `duffel-2.jpg`, `duffel-3.jpg`)
- `lamp.jpg` (+ optional `lamp-2.jpg`, `lamp-3.jpg`)
- `mugs.jpg` (+ optional `mugs-2.jpg`, `mugs-3.jpg`)
- `candle.jpg` (+ optional `candle-2.jpg`, `candle-3.jpg`)
- `pillow.jpg` (+ optional `pillow-2.jpg`, `pillow-3.jpg`)

---

## 🔑 How to Add Your Paystack Test Key

1. Log in to your [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer).
2. Retrieve your **Test Public Key** (`pk_test_...`).
3. Open `js/checkout.js`.
4. Replace the constant at the top:
   ```javascript
   const PAYSTACK_PUBLIC_KEY = "pk_test_PASTE_YOUR_TEST_KEY_HERE";
   ```
   with:
   ```javascript
   const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
   ```
5. Save the file. When shoppers select **"Pay online with Paystack"**, the official modal will launch with amount converted to Kobo in Nigerian Naira (`NGN`).
   > *Note: While the key remains the placeholder, shoppers can still test the complete end-to-end checkout flow seamlessly by selecting **"Pay on delivery"**.*

---

## 🚀 Running the Project

Open the folder with VS Code / Antigravity IDE and launch **Live Server** (default port `5500`):

```bash
# Or run with Node npx
npx -y serve -l 5500 .

# Or run with Python
python -m http.server 5500
```
Navigate to: `http://localhost:5500`

---

## 🎨 Color Palette & Architecture

- **Cream Background**: `#faf3dd`
- **Sage Green (Primary)**: `#4a7c59`
- **Deep Forest (Headings & Dark Text)**: `#1f3a2b`
- **Soft Mint (Badges & Tints)**: `#b8d8be`
- **Warm Sand (Panels & Cards)**: `#f1e6c4`
- **Terracotta (Main Call to Action & Highlights)**: `#c8553d`
- **Mustard (Stars & Accents)**: `#e0a458`
- **Surface White**: `#fffdf5`
- **Dark Mode**: Background `#13241a`, Surfaces `#1b3226`, Text `#f3ecd2`

---

## 📜 Script Order on Every Page

Strictly loaded in this exact sequence:
1. `js/data.js`
2. `js/storage.js`
3. `js/auth.js`
4. `js/cart.js`
5. `js/wishlist.js`
6. `js/ui.js`
7. Then the specific page script (`js/home.js`, `js/shop.js`, `js/product.js`, `js/cart-page.js`, `js/checkout.js`, or `js/profile.js`)

**External scripts:**
- `Three.js` (pinned `r128` from cdnjs) loaded **only on `index.html`** before `js/three-scene.js`.
- `Paystack inline.js` loaded **only on `checkout.html`**.

---

## ⚠️ Known Limitations
- Authentication is client-side simulated using `localStorage` for demo and offline usability; in production, replace `js/auth.js` with server-side sessions or JWT.
- Images fallback automatically to Picsum photos if local assets are not present in `/images`.
