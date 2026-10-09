# ATELIER NORD — Scandinavian Minimalist Fashion E-commerce

> **Atelier Nord** is a complete, contemporary fashion e-commerce web application inspired by Nordic minimalism and high-editorial fashion layouts. Built with modern React 19, Vite 6, React Router DOM, and clean CSS variables.

---

## 1. Technology Stack

- **Framework:** React 19 (JavaScript & JSX)
- **Build Tool:** Vite 6
- **Routing:** React Router DOM (v7) with HTML5 History API (strictly 5 routes + catch-all redirect to `/`)
- **State Management:** React Context API + `useReducer` for deterministic cart and order actions
- **Persistence:** Safe `localStorage` integration with JSON parsing fallbacks and corrupt data recovery (`atelier_nord_cart`, `atelier_nord_completed_order`)
- **Styling:** Vanilla CSS with custom design tokens (CSS variables), responsive typography, and mobile-first layout rules
- **Icons:** `lucide-react`
- **Typography:** Google Fonts (*Cormorant Garamond* editorial serif headers and *Inter* clean sans-serif body)

---

## 2. Quick Start & Development

### Prerequisites
- Node.js `v18+` (tested on Node `v24.12.0`)
- npm `v9+` (tested on npm `11.12.1`)

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Start the local Vite development server
npm run dev

# The development server runs by default on http://localhost:3000
```

### Production Build & Preview
```bash
# 3. Create an optimized production build
npm run build

# 4. Preview the production build locally
npm run preview
# Serves the compiled dist/ directory at http://localhost:4173
```

### Verification Scripts
```bash
# Verify all 36 local product and site image files
npm run verify:images

# Run unit tests asserting pricing calculation order and coupon allocation algorithms
npm run test:pricing
```

### Deploy to Vercel

The project is configured for Vercel with a React Router SPA rewrite in `vercel.json`.

#### Vercel Dashboard

1. Push the project to a GitHub repository.
2. Import the repository in Vercel.
3. Select **Vite** as the framework preset.
4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. Leave the root directory as `.` and deploy.

#### Vercel CLI

```bash
npm install
npm run build
npx vercel --prod
```

No environment variables are required by the current demo application.

---

## 3. Project Structure

```text
atelier-nord/
├── docs/
│   ├── CHALLENGES.md           # Engineering challenges, decisions, and mitigations
│   ├── IMAGE_CREDITS.md        # Full attribution table for all 36 Unsplash photographs
│   ├── IMPROVEMENTS.md         # Planned future roadmap
│   ├── REQUIREMENTS.md         # Scope and business requirements
│   ├── TEST_CASES.md           # QA test suite and validation matrices
│   └── TRACKING_PLAN.md        # Event schema documentation for subsequent analytics phase
├── public/
│   ├── images/
│   │   ├── products/            # Local product photography
│   │   ├── site/                # Local hero and category photography
│   │   └── placeholder.svg      # Brand ivory/taupe vector fallback placeholder
│   └── favicon.svg             # Minimalist AN monogram favicon
├── scripts/
│   ├── test-pricing.mjs        # Reference checks for pricing & coupon allocation
│   └── verify-images.mjs       # Remote image HTTP 200 verification script
├── src/
│   ├── components/
│   │   ├── cart/
│   │   │   ├── CartItem.jsx & CartItem.css
│   │   │   ├── CouponInput.jsx & CouponInput.css
│   │   │   └── FreeShippingMeter.jsx & FreeShippingMeter.css
│   │   ├── common/
│   │   │   ├── AnnouncementBar.jsx & AnnouncementBar.css
│   │   │   ├── FallbackImage.jsx
│   │   │   ├── Footer.jsx & Footer.css
│   │   │   ├── Header.jsx & Header.css
│   │   │   └── ScrollToTop.jsx
│   │   └── product/
│   │       ├── ProductCard.jsx & ProductCard.css
│   │       ├── ProductGrid.jsx & ProductGrid.css
│   │       └── QuantitySelector.jsx & QuantitySelector.css
│   ├── context/
│   │   ├── CartContext.jsx      # Provider exposing state, actions, and order completion
│   │   └── cartReducer.js      # Pure reducer handling all cart operations
│   ├── data/
│   │   ├── categories.js       # The 6 official categories + accessory subcategories
│   │   ├── coupons.js          # WELCOME10, NORD500, FREESHIP
│   │   ├── productImages.js    # Single source mapping 28 product IDs to remote 4:5 URLs
│   │   ├── products.js         # Single source of truth: 28 products with permanent IDs
│   │   └── siteImages.js       # Hero, editorial, and category tile remote URLs
│   ├── hooks/
│   │   └── useDocumentTitle.js # Centralized document.title updater
│   ├── pages/
│   │   ├── Cart.jsx & Cart.css
│   │   ├── Checkout.jsx & Checkout.css
│   │   ├── Home.jsx & Home.css
│   │   ├── ProductDetail.jsx & ProductDetail.css
│   │   └── Shop.jsx & Shop.css
│   ├── styles/
│   │   ├── global.css          # CSS reset, typography, and utility classes
│   │   └── variables.css       # Design tokens (colors, spacing, elevations, transitions)
│   ├── utils/
│   │   ├── formatPrice.js      # INR currency formatter (Intl.NumberFormat)
│   │   ├── itemMapper.js       # Line key generator and normalized item mapper
│   │   ├── orderGenerator.js   # ATN-YYYYMMDD-<6+ char suffix> generator & order builder
│   │   ├── pricing.js          # Exact calculation order & coupon allocation engine
│   │   └── storage.js          # Safe localStorage get/set/remove abstractions
│   ├── App.jsx                 # Exact 5 routes definition + catch-all redirect
│   └── main.jsx                # Application root entrypoint
├── vercel.json                 # Single host SPA rewrite configuration (/(.*) -> /index.html)
├── vite.config.js              # Vite server and React plugin config
├── .env.example                # Example environment file
├── .gitignore                  # Git ignore rules
├── package.json
└── README.md
```

---

## 4. Key Routes & Features

The application strictly implements **exactly 5 client-side routes** (unknown paths automatically redirect to `/`):

| Route | Page | Key Functionality & Experience |
|---|---|---|
| `/` | **Home** | Editorial hero showcase with two CTAs, 6 image-led category gateways, curated featured pieces, and studio bestsellers. |
| `/shop` | **Shop / Catalog** | Full 28-product catalog driven entirely by URL query parameters (`?category=`, `?sale=1`, `?q=`, `?sort=`). Supports multi-category filters, sale filter, search across names/subcategories, sorting (`Featured`, `Price: Low-High`, `Price: High-Low`, `Biggest Discount`, `Newest`), and graceful invalid-category recovery banner. |
| `/product/:id` | **Product Details** | High-resolution 4:5 photography with fallback handling, stock status badges (`In stock`, `Only N left`), interactive size and colour selectors, quantity stepper, accordion care notes, and related pieces. |
| `/cart` | **Shopping Bag** | Variant separation (independent lines per size/color), quantity increment/decrement, line removal, interactive free shipping progress bar towards the ₹2,999 threshold, shared `<CouponInput />`, auto-removal notice if subtotal drops below coupon minimum, and complete breakdown. |
| `/checkout` | **Checkout & Confirmation** | Multi-step journey on a single route: (1) Details (form validation with auto-focus on first invalid input); (2) Shipping Tier (Standard ₹99 / free vs Express ₹199); (3) Payment (Card, UPI, COD simulated); (4) Order Review with `<CouponInput />`; (5) Order Confirmation rendered directly on `/checkout` from saved order in `localStorage` (`ATN-YYYYMMDD-<suffix>`). Direct visits to `/checkout` with an empty cart and no saved order redirect to `/cart`; visits with a saved order show the confirmation, allowing full page refreshes. |

---

## 5. Pricing, Discount and Coupon Rules

All calculations are encapsulated in [`src/utils/pricing.js`](src/utils/pricing.js) and adhere strictly to Section 6.3 of the specification:

1. **Items Subtotal:** Sum of (`finalUnitPrice × quantity`)
2. **Coupon Discount:** Calculated from items subtotal, capped at items subtotal (0 for `FREESHIP`)
3. **Discounted Subtotal:** `itemsSubtotal − couponDiscount`
4. **Shipping Fee:** Free if `discountedSubtotal >= 2999` or when `FREESHIP` coupon is applied; otherwise ₹99 Standard or ₹199 Express.
5. **Tax (GST):** `Math.round(5% of discountedSubtotal)`
6. **Total Order Amount:** `discountedSubtotal + shipping + tax`

### Available Coupons (`src/data/coupons.js`)
- `WELCOME10`: 10% off (up to ₹500 discount), minimum subtotal ₹1,500.
- `NORD500`: Flat ₹500 off, minimum subtotal ₹4,000.
- `FREESHIP`: Waives standard delivery fee (₹99), minimum subtotal ₹0. (No effect on Express shipping).

### Coupon Allocation Across Items (`allocateCouponAcrossItems`)
Allocates order-level discounts proportionally across line items to prepare for analytics reconciliation (Section 6.4):
- Per-line share: `couponDiscount × lineTotal / itemsSubtotal` rounded to 2 decimal places.
- Rounding remainder is absorbed by the last line item, ensuring $\sum \text{paidUnitPrice} \times \text{quantity} = \text{discountedSubtotal}$.

---

## 6. Local Images Architecture & Mitigation Strategy

In strict adherence to PROJECT_TASK.md Section 5.4, all images are stored and served locally from the `public/images/` directory:
- **Local Directory Layout:**
  - Product images: `public/images/products/<product-id-lowercase>.jpg` (all 28 products)
  - Site & category images: `public/images/site/` (`hero.jpg`, `editorial.jpg`, and 6 category banners)
  - Vector fallback: `public/images/placeholder.svg`
- **Centralized Mapping:** [`src/data/productImages.js`](src/data/productImages.js) and [`src/data/siteImages.js`](src/data/siteImages.js) provide clean centralized mapping functions.
- **Aspect Ratio & Layout Stability:** Every image container enforces a fixed 4:5 ratio (`aspect-ratio: 4/5; object-fit: cover`) to eliminate Cumulative Layout Shift (CLS).
- **Graceful Fallback:** Every image uses `<FallbackImage />` with shimmer skeleton loading and an `onError` handler that replaces failed images with `public/images/placeholder.svg`.
- **Verification Script:** `npm run verify:images` runs [`scripts/verify-images.mjs`](scripts/verify-images.mjs) verifying that all 36 local images exist and are non-empty files in `public/images/`.
- See [`docs/CHALLENGES.md`](docs/CHALLENGES.md) and [`docs/IMAGE_CREDITS.md`](docs/IMAGE_CREDITS.md) for full rationale and photographer attributions.

---

## 7. Assumptions & Deliberate Decisions

1. **Fictional Brand:** Atelier Nord is an editorial design demo. No actual payment gateway or real financial transactions are executed.
2. **Demo Checkout:** Step 3 of checkout clearly indicates demo mode; customers select either "Credit / Debit Card (Simulated)", "UPI / NetBanking (Simulated)", or "Cash on Delivery", requiring no real sensitive credentials.
3. **5-Route Architecture:** Order confirmation is the final step of `/checkout`, rendering from `localStorage`, ensuring full page refreshes work smoothly without creating a 6th route.
4. **Phase A Scope:** In accordance with the project requirements, tracking code (GTM, dataLayer, GA4) is excluded in this phase and will be added cleanly in Phase B.