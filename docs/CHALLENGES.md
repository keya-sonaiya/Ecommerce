# Project Challenges, Decisions & Mitigations

This document outlines key technical challenges, engineering decisions, and mitigations implemented for the **Atelier Nord** storefront.

---

## 1. Remote Image Architecture (Intentional Override of Section 5.4)

### Context & Decision
PROJECT_TASK.md Section 5.4 originally specified local assets stored under `public/images/products/`. By user instruction, an intentional architectural override was implemented to utilize high-resolution remote fashion imagery from Unsplash rather than bundling large image files into the Git repository.

### Identified Risks
1. **Link Rot & 404 Availability:** Third-party hosted images may become unavailable or alter routing parameters over time.
2. **Page Load Performance & Network Latency:** Remote CDNs introduce external DNS lookups and potential SSL handshake overhead.
3. **Third-Party Dependency:** If an external image CDN experiences degraded performance or rate limits, broken layout icons could impact user experience.

### Mitigations Implemented
1. **Single Source of Truth (`src/data/productImages.js` and `src/data/siteImages.js`):** All image URLs are defined in single lookup dictionaries. No component or data file hardcodes an image URL.
2. **Automated Verification Script (`scripts/verify-images.mjs`):** An npm script (`npm run verify:images`) tests HTTP `HEAD` status for every product and site asset, asserting HTTP 200 before building.
3. **Graceful Fallback (`/images/placeholder.svg` & `FallbackImage.jsx`):** Every `<img>` tag is wrapped in a fallback handler that catches `onError` events and smoothly substitutes the image with a brand-aligned SVG placeholder displaying the product name.
4. **Layout Shift Prevention (CLS Mitigation):** Fixed aspect ratios (4:5 for products, 16:9 for heroes) with `object-fit: cover` and `loading="lazy"` below the fold eliminate Cumulative Layout Shift.

---

## 2. 5-Page Route Scope Interpretation (Section 2.1)

### Context
Section 2.1 imposes a strict 5-route limit:
1. `/` (Home)
2. `/shop` (Catalog with query-driven category, sale filter, sort, and search)
3. `/product/:id` (Product Detail)
4. `/cart` (Shopping Bag)
5. `/checkout` (Multi-step checkout with inline confirmation step)

### Decision & Architecture
- Order Confirmation is rendered as the final step (`step 5`) of `/checkout` rather than a 6th route.
- Category listings and search are query-param driven on `/shop` (`?category=`, `?sale=1`, `?q=`, `?sort=`).
- All other routes (`/search`, `/shop/:category`, `/contact`, `/shipping-returns`, `/order-confirmation`) were removed, and unknown paths redirect directly to `/`.

---

## 3. Order-Level Coupon Allocation (Section 6.4)

### Context & Consistency
GA4 defines `value` as the sum of item `price × quantity`, excluding shipping and tax. To ensure purchase revenue equals item revenue when an order-level coupon (such as `WELCOME10` or `NORD500`) is applied, the coupon discount is allocated proportionally across all cart line items in `src/utils/pricing.js` via `allocateCouponAcrossItems()`.

### Mitigation for Rounding Remainder
Line shares are computed as `round(couponDiscount × lineTotal / itemsSubtotal, 2)`. The final line in the cart absorbs any accumulated fractional cent discrepancy so that the sum of line shares matches `couponDiscount` exactly.

