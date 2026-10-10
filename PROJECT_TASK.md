# PROJECT_TASK.md — Atelier Nord
## End-to-End Web Analytics Implementation: E-commerce Website + GTM + GA4

> **Purpose:** Main source of truth for the project. Read this fully before changing code.
> **Project type:** Fashion e-commerce demo for the Tatvic Technical Analyst (Data Collection) assessment.
> **Priority:** Tracking accuracy → test evidence and documentation → working shopping journey → visual polish.
> **Version:** 2.1 (v2.0 plus the review changes listed below).

### Changes in v2.1
1. **Coupon allocation (6.4):** the order-level coupon is now allocated across items, so `value` always equals the sum of `item.price × quantity` on checkout and purchase events.
2. **`customer_type` renamed `visitor_type`** (it measures repeat visits, not purchase history).
3. **Free-text protection:** `coupon_code` is sent only for known demo codes; `search_term` is sanitised (explicit exception to rule 8.2.11).
4. **User properties on the first `page_view`:** the Google tag now carries them, and first load is tested separately from route changes.
5. **`newsletter_signup` replaced by `select_shipping_method`** (no newsletter form is built). New dimension: Shipping tier.

---

## 1. Project Overview

Atelier Nord is a fictional premium fashion store. Visitors browse products, view details, add items to a bag, apply a coupon, and complete a simulated checkout.

The website is a test bed. **The main deliverable is a correct, validated GTM + GA4 measurement setup.**

### Assessment brief (what is being evaluated)

The participant must demonstrate:
- A basic web experience with navigation, interactions and meaningful user journeys (**maximum 5 pages**).
- GA4 tracking implemented through Google Tag Manager (Web).
- One GA4 property with one Web data stream (timezone, currency, enhanced measurement configured correctly).
- `page_view` implemented via GTM, plus additional events via the data layer.
- **8–10 custom events** with consistent naming, relevant parameters and business context.
- **At least 5 GA4 recommended e-commerce events** with correct schema, consistent currency/value, and no duplicates.
- **At least 3 user properties**, set consistently across pages and journeys.
- **Custom dimensions** registered for event parameters and user properties, with the correct scope.
- Validation in **GTM Preview and GA4 DebugView**: no duplicates, accurate parameters, events visible in GA4 reports.

### Brief deliverables
1. Website URL (live deployment, not a dev tunnel).
2. Event and parameter documentation (`docs/TRACKING_PLAN.md`).
3. Validation screenshots (real evidence only).

### Client scenario

Atelier Nord wants to understand:
- Which products and categories are viewed, filtered and added to the bag.
- How shoppers use sorting, filters, search and coupons.
- How many shoppers begin checkout and complete an order, and which shipping option they choose.
- Where shoppers drop out of the purchase funnel, and which form errors occur.
- Which products generate the most revenue in the demo data.
- How new and returning visitors, and buyers and non-buyers, behave differently.

---

## 2. Scope

### 2.1 Pages (maximum 5 — hard limit)

The site has exactly **five** routes. Do not add a sixth page or route.

| # | Route | Page | Required functionality |
|---|---|---|---|
| 1 | `/` | Home | Announcement bar, navigation, hero banner, featured products, category links, sale link |
| 2 | `/shop` | Shop | Product grid with category filter, sale filter, sorting and search. All driven by query parameters: `?category=shirts`, `?sale=1`, `?q=linen`, `?sort=price-asc` |
| 3 | `/product/:id` | Product detail | Image, name, price and discount, description, size and colour, quantity, Add to Bag |
| 4 | `/cart` | Shopping bag | Items, quantity change, remove, coupon, subtotal, shipping estimate, total |
| 5 | `/checkout` | Checkout and confirmation | Multi-step: details → shipping → payment → review → **order confirmation as the final step on the same route** |

Rules:
- Any unknown URL redirects to `/`.
- Remove the old `/shop/:category`, `/search`, `/order-confirmation`, `/contact`, `/shipping-returns` routes and their pages.
- Shipping and returns information, if shown, is plain static text in the footer. Not a page, not a modal.
- Use React Router. Route refresh must work locally and after deployment.
- Open question for the assessor (record the answer in `docs/CHALLENGES.md`): whether "5 pages" means 5 URLs or 5 templates. The 5-route structure above satisfies both readings.

### 2.2 Required shopping features
- 28 fictional products across 6 categories (section 5).
- Stable product IDs, local images, descriptions, prices, discounts.
- Sizes and colours where applicable.
- Category filter, sale filter, sorting (price low-high, high-low, biggest discount, newest) and keyword search on name, category and subcategory.
- Add to bag, change quantity, remove item.
- Coupon codes with validation (section 6).
- Cart and coupon persist across refresh using `localStorage`.
- Checkout form with validation; simulated order only. No real payment.
- Order confirmation with a unique transaction ID, rendered from the saved order.
- Responsive desktop and mobile layouts; useful empty states and clear action feedback.

### 2.3 Out of scope
Real payments, real accounts or login, backend or database, inventory management, admin dashboard, chat or AI assistant, server-side GTM, mobile app tracking, wishlist, promotion tracking, consent banner, **newsletter signup form**. Do not build these unless the task owner explicitly asks.

---

## 3. Design Direction

- Premium, clean, minimal, editorial.
- Warm ivory backgrounds, near-black text, muted taupe accent.
- Serif headings, clean sans-serif body.
- Consistent 4:5 product photography, generous whitespace, thin borders.
- Accessible buttons and form controls (visible focus, labels, `aria-live` for status messages).
- Subtle hover effects only. **No carousels, sliders, intrusive popups or heavy animation.**

---

## 4. Technology Stack

| Area | Choice |
|---|---|
| Build tool | Vite |
| UI | React (functional components and hooks) |
| Routing | React Router |
| Styling | Plain CSS with the existing variables and per-component stylesheets |
| Icons | lucide-react (already installed) |
| Product and coupon data | Local JavaScript data files |
| Cart state | React Context with `useReducer` |
| Persistence | `localStorage` through the shared storage helpers |
| Analytics event layer | One shared module: `src/analytics/dataLayer.js` |
| Tag management | One GTM Web container |
| Analytics | One GA4 property, one Web data stream |
| Debugging | GTM Preview, Tag Assistant, GA4 DebugView, Chrome DevTools |
| Hosting | Vercel **or** Netlify (keep one config, delete the other) |
| Version control | Existing GitHub repository `Ecommerce`. Do not delete `.git/` or create a second repo |

### Environment configuration
`.env` (local, not committed):
```env
VITE_GTM_ID=GTM-XXXXXXXX
```
`.env.example` (committed):
```env
VITE_GTM_ID=GTM-REPLACE_ME
```
GTM and GA4 IDs are identifiers, not secrets, but keep them in configuration. Never commit `.env`, `node_modules/` or `dist/`.

---

## 5. Catalogue, Categories and Images

### 5.1 Categories (single flat list)

One shared source: `src/data/categories.js` (name, slug, short description). Use it for navigation, home category links, shop filters, URL validation and search.

| Name | Slug | Code |
|---|---|---|
| T-Shirts | `t-shirts` | TS |
| Shirts | `shirts` | SH |
| Trousers | `trousers` | TR |
| Outerwear | `outerwear` | OW |
| Knitwear | `knitwear` | KN |
| Accessories | `accessories` | AC |

- `category` on a product is exactly one of these display names.
- `subcategory` exists **only** for Accessories: Bags, Jewellery, Belts, Scarves, Wallets, Socks.
- An invalid `?category=` value shows all products and a short notice. It must not crash.
- The old values `Clothing`, `Essentials` and similar must not appear anywhere in the code.

### 5.2 Product data model

Store products in `src/data/products.js`. Fields: `id`, `name`, `brand` ("Atelier Nord"), `category`, `subcategory`, `price` (list price, INR), `discount` (INR off **per unit**, `0` if none), `image`, `alt`, `shortDescription`, `description`, `sizes`, `colors`, `stock`, `tags` (`featured`, `bestseller`, `new`), `createdAt`.

IDs follow `ATN-<CODE>-<NNN>` and are **permanent**. Never reuse or renumber them, because GA4 reports are keyed on `item_id`.

Use one shared product source for cards, detail pages, cart and analytics. Never hard-code names or prices elsewhere.

### 5.3 Product list (28)

| ID | Name | Category | Sub | List | Discount | Final |
|---|---|---|---|---|---|---|
| ATN-TS-001 | Heavyweight Organic Cotton T-Shirt | T-Shirts | | 1299 | 0 | 1299 |
| ATN-TS-002 | Supima Cotton Long Sleeve | T-Shirts | | 1799 | 200 | 1599 |
| ATN-TS-003 | Relaxed Raw Hem Cotton Tank | T-Shirts | | 999 | 0 | 999 |
| ATN-TS-004 | Boxy Organic Cotton Tee | T-Shirts | | 1499 | 0 | 1499 |
| ATN-SH-001 | Oversized Pure Linen Shirt | Shirts | | 3499 | 500 | 2999 |
| ATN-SH-002 | Poplin Button-Down Shirt | Shirts | | 2799 | 0 | 2799 |
| ATN-SH-003 | Oxford Stripe Shirt | Shirts | | 2999 | 400 | 2599 |
| ATN-SH-004 | Cuban Collar Camp Shirt | Shirts | | 2499 | 0 | 2499 |
| ATN-TR-001 | Relaxed Pleated Trousers | Trousers | | 4299 | 0 | 4299 |
| ATN-TR-002 | Wide-Leg Linen Lounge Pants | Trousers | | 2999 | 0 | 2999 |
| ATN-TR-003 | Tailored Wool Trousers | Trousers | | 4799 | 0 | 4799 |
| ATN-TR-004 | Straight Cotton Chinos | Trousers | | 3299 | 300 | 2999 |
| ATN-OW-001 | Structured Minimalist Blazer | Outerwear | | 6999 | 1000 | 5999 |
| ATN-OW-002 | Quilted Liner Jacket | Outerwear | | 7999 | 0 | 7999 |
| ATN-OW-003 | Waxed Cotton Overshirt | Outerwear | | 5799 | 800 | 4999 |
| ATN-OW-004 | Lightweight Cotton Trench | Outerwear | | 8499 | 0 | 8499 |
| ATN-KN-001 | Ribbed Merino Wool Crewneck | Knitwear | | 4999 | 700 | 4299 |
| ATN-KN-002 | Cashmere-Blend Cardigan | Knitwear | | 6499 | 500 | 5999 |
| ATN-KN-003 | Cable-Knit Cotton Sweater | Knitwear | | 4299 | 0 | 4299 |
| ATN-KN-004 | Fine-Gauge Knit Polo | Knitwear | | 3799 | 400 | 3399 |
| ATN-AC-001 | Structured Leather Tote | Accessories | Bags | 5499 | 500 | 4999 |
| ATN-AC-002 | Brushed Brass Signet Ring | Accessories | Jewellery | 1899 | 0 | 1899 |
| ATN-AC-003 | Full Grain Leather Belt | Accessories | Belts | 1999 | 300 | 1699 |
| ATN-AC-004 | Sculptural Silver Ear Cuff | Accessories | Jewellery | 1499 | 0 | 1499 |
| ATN-AC-005 | Nordic Woven Canvas Weekender | Accessories | Bags | 4499 | 0 | 4499 |
| ATN-AC-006 | Merino Wool Scarf | Accessories | Scarves | 1699 | 0 | 1699 |
| ATN-AC-007 | Leather Card Holder | Accessories | Wallets | 899 | 100 | 799 |
| ATN-AC-008 | Merino Wool Ribbed Socks (3-Pack) | Accessories | Socks | 1199 | 200 | 999 |

Thirteen products are discounted, the rest are full price. This gives a useful mix for testing. Prices range from ₹799 to ₹8,499.

Size rules: tops, knitwear, outerwear XS–XL; trousers waist 28–36; belts S/M/L; rings 7/8/9; other accessories have no size. Two to three colours per product. No product has `stock: 0`.

### 5.4 Images (local only)
- Product images: `public/images/products/<product-id-lowercase>.jpg`, e.g. `/images/products/atn-ts-001.jpg`, 4:5 ratio.
- Site images (hero, category tiles): `public/images/site/`.
- No remote image URLs in code or data.
- Products without a real photo use `/images/placeholder.svg`. Never invent image URLs.
- `npm run verify:images` runs `scripts/verify-images.mjs` and fails if any referenced file is missing.
- Use `aspect-ratio` or width/height to avoid layout shift, and `loading="lazy"` below the fold.

---

## 6. Pricing, Discount and Coupon Rules (fixed)

All maths lives in `src/utils/pricing.js`. UI, cart and analytics all use these functions.

### 6.1 Product pricing
1. **Final unit price** = `price − discount` (`getFinalUnitPrice`).
2. **Line total** = final unit price × quantity.
3. **Items subtotal** = sum of line totals.
4. **Product savings** (informational) = sum of `discount × quantity`.
5. Prices are fictional, in INR.

### 6.2 Coupons

Defined in `src/data/coupons.js`. Codes are trimmed and case-insensitive.

| Code | Type | Value | Max discount | Minimum subtotal | Notes |
|---|---|---|---|---|---|
| `WELCOME10` | percent | 10% | ₹500 | ₹1,500 | |
| `NORD500` | flat | ₹500 | n/a | ₹4,000 | |
| `FREESHIP` | shipping | waives standard fee | n/a | ₹0 | No effect on express shipping |

Behaviour:
- One coupon at a time; a new code replaces the old one.
- Only the coupon **code** is stored in cart state and persisted. Amounts are recalculated on every render.
- If the cart changes so the minimum is no longer met, remove the coupon and show a short notice.
- Clear the coupon when the cart is emptied and after a successful order.
- Friendly errors for: empty input, invalid code, minimum not met ("Add ₹X more to use this code").
- Shared `<CouponInput />` in the Cart and Checkout summaries. It shows hint text such as "Try WELCOME10".

### 6.3 Calculation order (`calculateCartTotals(items, shippingMethod, couponCode)`)
1. `itemsSubtotal` = sum of final unit price × quantity.
2. `couponDiscount` = from `itemsSubtotal`, whole rupees, never above `itemsSubtotal` (0 for FREESHIP).
3. `discountedSubtotal` = `itemsSubtotal − couponDiscount`.
4. `shipping`: free if `discountedSubtotal ≥ 2999`, otherwise ₹99 standard or ₹199 express. FREESHIP makes standard shipping ₹0.
5. `tax` = round(5% of `discountedSubtotal`).
6. `total` = `discountedSubtotal + shipping + tax`.

Also return `couponCode`, `couponError`, `productSavings`, `itemCount`, and `couponAllocation` (section 6.4).

Reference checks: one ATN-AC-007 (₹799) with no coupon gives shipping 99, tax 40, total 938. `WELCOME10` on ₹5,000 gives discount 500, discounted 4,500, shipping 0, tax 225, total 4,725.

The coupon allocation in 6.4 is an **analytics-only** calculation. It does not change anything in 6.3 or any amount shown to the customer.

### 6.4 GA4 value rules and coupon allocation

GA4 defines `value` as the sum of item `price × quantity`, excluding shipping and tax. To keep item revenue and purchase revenue consistent, the order-level coupon is **allocated across the items** on events that carry a coupon.

**Allocation function** (`allocateCouponAcrossItems(lines, couponDiscount)` in `pricing.js`):
1. Only runs when `couponDiscount > 0` (never for FREESHIP).
2. Each line's share = `couponDiscount × lineTotal / itemsSubtotal`, rounded to 2 decimals.
3. The **last line absorbs the rounding remainder**, so the shares add up to exactly `couponDiscount`.
4. Per-unit coupon share = line share ÷ quantity, rounded to 2 decimals.
5. Result per line: `paidUnitPrice = finalUnitPrice − unitCouponShare`.

**Rules:**
1. Product-only events (`view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`): item `price` = final unit price after product discount. Item `discount` = per-unit product discount. No coupon allocation. `value` = sum of `price × quantity`.
2. Checkout events (`begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`) when a coupon discount applies: item `price` = `paidUnitPrice`. Item `discount` = per-unit product discount **plus** per-unit coupon share. `value` = `discountedSubtotal`, which equals the sum of `item.price × quantity` to within rounding (rule 5).
3. Without a coupon, checkout events use rule 1 pricing, and `value` = `itemsSubtotal`.
4. `coupon` is sent at **event level** on those four events when a coupon is applied. Item-level `coupon` is not used.
5. Rounding: values are 2 decimals at most. Unit-price rounding can cause a drift of at most ₹0.01 per unit against `value`. Document this in `docs/TRACKING_PLAN.md`. A unit test must assert `|value − Σ(price × quantity)| ≤ 0.01 × total units` for every coupon test case.
6. **Shipping and tax are never included in `value`.** Send them as `shipping` and `tax` on `purchase`. The customer's order total (6.3) may include them.
7. Consequence to document in `docs/CHALLENGES.md` and `docs/TRACKING_PLAN.md`: item `price` on coupon orders differs from the displayed shelf price, by design. Item-level revenue in GA4 therefore reflects what was actually paid before shipping and tax.
8. Confirm all of the above against the official GA4 e-commerce documentation (section 18) and record any deviation in `docs/CHALLENGES.md`.

**Worked example** (`WELCOME10`, two lines): ATN-TS-004 ×1 (₹1,499) and ATN-OW-003 ×1 (₹4,999). Subtotal ₹6,498, coupon = min(10%, 500) = 500.
- Share on line 1 = 500 × 1499 / 6498 = 115.35; line 2 (remainder) = 384.65.
- Paid prices: 1,383.65 and 4,614.35. Sum = 5,998 = `discountedSubtotal` = `value`.

---

## 7. Project Structure

```text
atelier-nord/
├── public/
│   ├── images/
│   │   ├── products/
│   │   ├── site/
│   │   └── placeholder.svg
│   └── _redirects                  # or vercel.json, keep one
├── scripts/
│   └── verify-images.mjs
├── src/
│   ├── analytics/
│   │   └── dataLayer.js            # ALL dataLayer pushes and helpers
│   ├── components/
│   │   ├── common/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── product/                # includes CouponInput
│   ├── context/                    # CartContext, cartReducer
│   ├── data/                       # products.js, categories.js, coupons.js
│   ├── hooks/
│   ├── pages/                      # Home, Shop, ProductDetail, Cart, Checkout
│   ├── styles/
│   ├── utils/                      # pricing.js, itemMapper.js, orderGenerator.js, storage.js
│   ├── App.jsx
│   └── main.jsx
├── docs/
│   ├── REQUIREMENTS.md
│   ├── TRACKING_PLAN.md
│   ├── TEST_CASES.md
│   ├── CHALLENGES.md
│   ├── IMPROVEMENTS.md
│   └── evidence/                   # real screenshots only
├── .env.example
├── .gitignore
├── PROJECT_TASK.md
├── README.md
├── index.html
├── package.json
└── package-lock.json
```

---

## 8. Analytics Architecture

### 8.1 Data flow
1. A user acts on the site.
2. A component calls a named helper from `src/analytics/dataLayer.js`.
3. The helper builds a correctly formed event and pushes it to `window.dataLayer`.
4. GTM detects the custom event and fires the matching GA4 Event tag.
5. GA4 receives the event for DebugView and reports.

### 8.2 Mandatory rules
1. **All pushes live in `src/analytics/dataLayer.js`.** Components call helpers and never touch `window.dataLayer`. One documented exception: the small bootstrap script in `index.html` (section 8.3).
2. Push `{ ecommerce: null }` before every e-commerce push.
3. Use standard GA4 event names and parameter structures for recommended events.
4. `currency: "INR"` on every monetary event.
5. Build item objects through **one shared helper** (`buildItem`) so fields and prices are consistent. It accepts an optional coupon allocation (section 6.4).
6. Follow section 6 for every `value`, item `price` and `discount`.
7. **Page views, one method only:**
   - The Google tag sends the first `page_view` on load.
   - A router wrapper pushes one custom event `virtual_page_view` (`page_location`, `page_title`, `page_path`) on each route change **after** the first load. A GTM trigger on that event fires a GA4 Event tag named `page_view`.
   - The order confirmation step counts as its own virtual page (`page_title` "Order Confirmed"). Other checkout steps do not send page views.
   - Turn off "Page changes based on browser history events" in GA4 enhanced measurement.
   - Verify exactly one `page_view` on first load and exactly one per route change.
8. Guard against duplicates from React StrictMode and re-renders. Check behaviour in both dev and production builds.
9. Never fire an e-commerce event with an empty `items` array.
10. Send `purchase` only for a successfully placed order, with a unique `transaction_id`, and never twice for the same ID.
11. **No personal data** (name, email, phone, address, free text) in any event, parameter or user property. **Two controlled exceptions, both sanitised (section 8.5):** `coupon_code` (known codes only) and `search_term` (sanitised).
12. Never send the same event through GTM and a direct-to-GA4 implementation.
13. Custom event and parameter names: lowercase `snake_case`, max 40 characters, no reserved names. Parameter values max 100 characters. User property values max 36 characters.
14. Do not claim tracking is verified until it has been tested in GTM Preview **and** GA4 DebugView.

### 8.3 Bootstrap in `index.html`
Before the GTM snippet, an inline script initialises `window.dataLayer` and pushes the initial user property values (section 11) from `localStorage`, so they exist before the Google tag fires. This is the only data-layer code outside `dataLayer.js`. Document it in `README.md`.

### 8.4 Order persistence and purchase deduplication
- When an order succeeds, create a unique `transaction_id`, save the completed order (ID, items, totals, coupon, shipping, tax) to storage, then clear the cart and coupon.
- The confirmation step renders from the **saved order**, not from the live cart.
- `/checkout` with an empty cart and **no** saved order redirects to `/cart`, with no `purchase`.
- `/checkout` with an empty cart and a saved order shows the confirmation from storage.
- After the first `purchase` push, record the `transaction_id` as "tracked" in storage. Never push it again, so a confirmation refresh cannot duplicate it.
- Transaction ID format: `ATN-YYYYMMDD-<6+ character random/time-based suffix>`. Four random digits are not enough.
- Limitation to document: browser storage is a demo-level guard, not a server-side ledger. It cannot stop duplication across browsers, devices or cleared storage.

### 8.5 User-entered text controls

**Coupon codes** (`coupon_code` on `apply_coupon` and `coupon_error`):
- Send `coupon_code` (uppercased) **only if it matches a code in `coupons.js`**.
- For an unknown code or an empty input, omit `coupon_code` and send only `error_reason`.
- The raw string the user typed is never sent.

**Search** (`search_term` on `search`), via a `sanitiseSearchTerm()` helper in `dataLayer.js`:
- Lowercase, trim, collapse repeated whitespace, cap at 40 characters.
- **Do not send the event** if the term contains `@`, contains 7 or more digits, or is empty after trimming.
- The search box shows placeholder text such as "Search products".
- `page_location` automatically includes `?q=<term>` on `/shop`. For this demo the term is accepted in the URL and the limitation is documented in `docs/TRACKING_PLAN.md`. Redacting `q` from `page_location` (for example with a GTM custom JavaScript variable) is listed in `docs/IMPROVEMENTS.md`.
- Add unit checks for the sanitiser: an email, a phone number, a long string, mixed case, and a normal term such as "Linen".

---

## 9. Event Plan

### 9.1 GA4 recommended events (12)

| Event | Trigger | Key parameters |
|---|---|---|
| `page_view` | First load (Google tag) and each route change (custom event, section 8.2) | `page_location`, `page_title` |
| `view_item_list` | A product list is displayed (home featured, shop with current filter, sort or search) | `item_list_id`, `item_list_name`, `items` |
| `select_item` | A product is clicked in a list | `item_list_id`, `item_list_name`, `items` |
| `view_item` | Product detail page viewed | `currency`, `value`, `items` |
| `add_to_cart` | Add to Bag, or quantity increase in the cart (delta only) | `currency`, `value`, `items` |
| `remove_from_cart` | Item removed, or quantity decrease in the cart (delta only) | `currency`, `value`, `items` |
| `view_cart` | Cart page viewed with at least one item | `currency`, `value`, `items` |
| `begin_checkout` | Checkout page entered with items, once per entry | `currency`, `value`, `coupon`*, `items` |
| `add_shipping_info` | Shipping step **submitted** (confirmed) | `shipping_tier`, `currency`, `value`, `coupon`*, `items` |
| `add_payment_info` | Payment step submitted | `payment_type`, `currency`, `value`, `coupon`*, `items` |
| `purchase` | Order successfully placed, once per `transaction_id` | `transaction_id`, `value`, `tax`, `shipping`, `currency`, `coupon`*, `items` |
| `search` | Search submitted on `/shop` and passes sanitising (8.5) | `search_term` |

\* only when a coupon is applied. Item prices on these events follow section 6.4.

Rules for list events:
- `item_list_id` values: `home_featured`, `shop_all`, `shop_category_<slug>`, `shop_sale`, `shop_search`.
- `item_list_name` is the readable name, e.g. "Shop – Shirts".
- `index` is the position in the list shown (starting at 1).
- Fire `view_item_list` again when the displayed set or order changes (filter, sort, search), but not twice in a row for an identical list.
- `shipping_tier` values: `Standard`, `Express`. `payment_type` values: `Card`, `UPI`, `COD` (all simulated).
- Quantity changes inside the cart send **only the delta** (+1 sends `add_to_cart` with quantity 1).

### 9.2 Custom events (10)

| Event | Trigger | Parameters | Business question |
|---|---|---|---|
| `filter_products` | A category or sale filter is applied | `filter_type` (`category`/`sale`), `filter_value` | Which categories do shoppers explore? |
| `sort_products` | Sort order changed | `sort_option` | How do shoppers prefer to compare prices? |
| `select_variant` | Size or colour chosen on product page | `variant_type` (`size`/`colour`), `variant_value`, `item_id` | Which sizes and colours are in demand? |
| `update_cart_quantity` | Quantity changed in the cart | `item_id`, `direction` (`increase`/`decrease`), `quantity_after` | Do shoppers adjust quantities? |
| `apply_coupon` | Coupon accepted | `coupon_code` (known codes only), `discount_amount` | Which coupons are used and how much do they cost? |
| `coupon_error` | Coupon rejected | `error_reason` (`invalid`/`minimum_not_met`/`empty`), `coupon_code` **only if it is a known code** (e.g. `minimum_not_met`) | Why do coupons fail? |
| `checkout_error` | Checkout validation fails | `error_field`, `checkout_step` (field **names** only, never values) | Where do shoppers struggle in the form? |
| `select_shipping_method` | The user **selects** Standard or Express on the shipping step (user action only, not the default render) | `shipping_tier` (`Standard`/`Express`) | Which shipping option do shoppers prefer, and do they switch? |
| `click_cta` | Hero or sale button clicked | `cta_text`, `cta_location` | Which calls to action work? |
| `free_shipping_unlocked` | Cart crosses the ₹2,999 threshold | `cart_value` | Does free shipping motivate larger carts? |

Notes:
- `select_shipping_method` fires on each change of selection. `add_shipping_info` fires separately, once, when the shipping step is submitted. A shopper who switches twice before confirming produces two `select_shipping_method` events and one `add_shipping_info`.
- Coupon code values are sent only when they match a known demo code (section 8.5). Free text typed by the user is never sent.

### 9.3 Enhanced measurement settings
- Keep enhanced measurement **on**.
- Turn **off** "Page changes based on browser history events".
- Turn **off** site search under enhanced measurement. The custom `search` event is the single source, and `?q=` would otherwise trigger an automatic `view_search_results` as well.
- Note in the docs which automatic events still appear (scrolls, outbound clicks, form events) and that they are expected.

### 9.4 Item object
Built by `buildItem` from product and cart data: `item_id`, `item_name`, `item_brand`, `item_category`, `item_category2` (accessory subcategory only), `item_variant` (e.g. "Ivory / M"), `price`, `discount`, `quantity`, `index` and `item_list_id`/`item_list_name` (list events only).

`price` and `discount` follow section 6.4: shelf-after-discount values on product events, paid-after-coupon values on coupon checkout events.

Do not send fields with invented or empty values.

---

## 10. GTM Configuration Plan

One GTM Web container.

### Google tag
- Install the GTM snippet in `index.html`, with `dataLayer` initialised before it.
- One Google tag named `Google tag - Atelier Nord`, using the GA4 Measurement ID held in a Constant variable.
- It sends only the first-load `page_view`; route changes use the custom event.
- It fires on **Initialization – All Pages**, so the bootstrap values are available.
- It carries the `traffic_type` test parameter (section 12).
- **It must also carry the four user properties** (section 11), read from Data Layer Variables fed by the bootstrap push, so the first `page_view` has them. Do not rely only on the event tags.

### Event tags and triggers
- A Custom Event trigger and a matching GA4 Event tag for every event in sections 9.1 and 9.2, plus `virtual_page_view` → `page_view`.
- E-commerce events send the data-layer `ecommerce` object through GTM's built-in data-layer option.
- Data Layer Variables only for custom parameters and user properties.
- User properties are attached to **every** GA4 Event tag too (through a shared settings variable where possible), so every event and journey carries them.
- No duplicate tags or triggers.

### Naming and folders
- Tags: `GA4 - Event - add_to_cart`. Triggers: `CE - add_to_cart`. Variables: `DLV - filter_type`, `DLV - user_properties.visitor_type`. Constant: `CONST - GA4 Measurement ID`.
- Folders: **Configuration**, **E-commerce Events**, **Custom Events**, **Variables and Utilities**.

### Publishing
- Test in Preview first.
- Publish with a clear version name and notes.
- Export the container JSON to `docs/evidence/`.

---

## 11. User Properties (4)

| User property | Values | Set when | Business use |
|---|---|---|---|
| `visitor_type` | `new` / `returning` | At load: `new` if no previous-visit flag in storage, otherwise `returning`. Then set the flag | Compare first-time and repeat visitors (repeat **visits**, not purchase history) |
| `has_purchased` | `yes` / `no` | `no` at start, `yes` after a successful order | Separate buyers from browsers |
| `preferred_category` | Category slug | Updated on category filter or product view | Which category attracts each visitor |
| `preferred_size` | e.g. `M` | Updated when a size is selected | Stock and size planning |

Rules:
- Values live in `localStorage` (`atelier_nord_user_props`) and are managed through `setUserProperties()` in `dataLayer.js`.
- They are pushed in the bootstrap before GTM loads, and again whenever a value changes.
- They must be attached to the **Google tag** (so the first `page_view` carries them) **and** to every GA4 Event tag, so they are present on all pages and journeys.
- Use `unknown` rather than leaving a value empty.
- Verify in DebugView (User properties panel) on the **first page load separately from route changes**, on several pages, and after a purchase.
- Confirm the exact GTM field names against current documentation when implementing.
- Note: a returning-visitor flag in `localStorage` is lost if storage is cleared, so the visitor counts as `new` again. Document this.

---

## 12. GA4 Property Configuration

- **One** GA4 property, **one** Web data stream, connected only through GTM.
- Reporting time zone: **India Standard Time**. Currency: **INR**.
- Enhanced measurement as in section 9.3.
- Mark `purchase` as a **key event**.
- **Separate test traffic:** create an internal traffic filter (set to Testing, then Active after verification) **or** send `traffic_type: "demo"` from the Google tag and register it as a dimension. All data in this project is demo traffic and must be described that way.
- Do not claim standard reports are complete immediately. Processing can take many hours.

### Custom dimensions (register before the final test run)

Dimensions only collect from the moment they are registered.

| Dimension name | Parameter / property | Scope |
|---|---|---|
| Filter type | `filter_type` | Event |
| Filter value | `filter_value` | Event |
| Sort option | `sort_option` | Event |
| Variant type | `variant_type` | Event |
| Variant value | `variant_value` | Event |
| Coupon code | `coupon_code` | Event |
| Error reason | `error_reason` | Event |
| Error field | `error_field` | Event |
| Checkout step | `checkout_step` | Event |
| CTA location | `cta_location` | Event |
| Shipping tier | `shipping_tier` | Event |
| Traffic type | `traffic_type` | Event (if used) |
| Visitor type | `visitor_type` | User |
| Has purchased | `has_purchased` | User |
| Preferred category | `preferred_category` | User |
| Preferred size | `preferred_size` | User |

Optionally register `discount_amount`, `quantity_after` and `cart_value` as custom metrics.

### Analysis
- Funnel exploration: `view_item` → `add_to_cart` → `begin_checkout` → `purchase`.
- Check item and monetization reports for correct product names and revenue. On coupon orders, confirm that item revenue and purchase revenue reconcile (section 6.4).
- Use custom dimensions in explorations (for example `apply_coupon` by `coupon_code`, `checkout_error` by `error_field`, `select_shipping_method` by `shipping_tier`).

---

## 13. Documentation Deliverables

### `README.md`
Summary and features; stack; prerequisites; install and run commands; environment setup; how GTM and GA4 are connected; how to test the journey; limitations; deployment steps and **live link**; short note on AI coding assistance (AI used for scaffolding and drafts, all tracking verified manually in GTM Preview and GA4 DebugView).

### `docs/REQUIREMENTS.md`
Client scenario, business questions, goals, scope (5-page limit), KPIs.

### `docs/TRACKING_PLAN.md` (the "event and parameter documentation" deliverable)
Three tables:
1. **Events:** name, business meaning, trigger action, parameters, GTM trigger, GTM tag, test status, evidence.
2. **User properties:** name, values, when set, DLV, test status.
3. **Custom dimensions:** name, parameter or property, scope, registered date.

Include a sample payload for every event, the **coupon allocation note** (section 6.4, with the worked example), the rounding tolerance, the search sanitising rules, and the `?q=` in `page_location` limitation.

### `docs/TEST_CASES.md`
Single-item order, multi-item order, discounted item, coupon orders (each code, invalid code, minimum not met, coupon removed after cart change), **multi-item order with a coupon (allocation sums to `value`)**, **rounding cases (odd amounts, quantity above 1, three or more lines)**, **final order total vs `value` + shipping + tax**, free-shipping threshold, quantity increase and decrease, remove then re-add, empty cart, checkout abandonment, validation errors, **shipping selection (select Standard, switch to Express, confirm: two `select_shipping_method`, one `add_shipping_info`)**, successful purchase, confirmation refresh, direct `/checkout` with empty cart, route changes and browser refresh on every route, custom events, **user properties on the first `page_view` and on route changes, tested separately**, user properties across pages, **invalid and empty coupon codes send no raw text**, **search sanitising (email, phone number, long string, normal term)**, dev and production builds.

### `docs/CHALLENGES.md`
Log as they happen: date, symptom, root cause, fix, evidence, lesson. Seed entries: coupon allocation vs `value`, the "5 pages" interpretation, and `?q=` in `page_location`.

### `docs/IMPROVEMENTS.md`
Consent handling, server-side order ledger, server-side GTM, BigQuery export, accessibility audit, wishlist and promotions, newsletter tracking if a form is ever added, redacting `?q=` from `page_location`, expanded reporting.

### Evidence (`docs/evidence/`)
GTM Preview (events and fired tags); GA4 DebugView (names, parameters, user properties); funnel exploration; item and revenue reports; custom dimensions list; successful production build; live deployment. **Real evidence only. Never fabricate screenshots or numbers.**

---

## 14. Testing and Definition of Done

### Website
- [x] Exactly five routes; unknown URLs redirect to `/`.
- [x] Categories, filters, sale view, sorting and search work, driven by the URL.
- [x] All 28 products show correct prices, discount badges and local images.
- [x] Cart add, remove and quantity changes work and survive refresh.
- [x] Coupons behave as in section 6, and survive refresh.
- [x] Totals match section 6.3 for every test case.
- [x] Checkout validation works.
- [x] Order produces a unique transaction ID and a saved order; the confirmation renders from storage.
- [x] `/checkout` with an empty cart and no saved order redirects, with no purchase.
- [x] Confirmation refresh does not repeat `purchase`.
- [x] Responsive at desktop and 375px mobile. No console errors.
- [x] Production build succeeds. Deployed, and refresh works on every route (vercel.json SPA rewrite configured).

### Tracking
- [ ] Each implemented event fires exactly once for its action.
- [ ] First load sends one `page_view`; each route change sends one.
- [ ] Item data in list, select and view events is correct.
- [ ] Cart events carry correct IDs, quantities, prices, currency and values.
- [ ] Checkout and purchase `value` follows section 6.4, equals Σ(`item.price × quantity`) within the stated tolerance, and carries `coupon` when applied.
- [ ] Coupon allocation unit tests pass (multi-item, rounding, quantity above 1).
- [ ] `purchase` has the correct `transaction_id`, `shipping` and `tax`.
- [ ] All 10 custom events fire with correct parameters.
- [ ] `coupon_code` is sent only for known codes; `search_term` is sanitised; no raw user text in any payload.
- [ ] All 4 user properties appear on the **first `page_view`**, on route-change events, across pages and after purchase.
- [ ] Remove then re-add leaves no stale ecommerce data.
- [ ] No personal data in any payload.
- [ ] Dev and production behaviour both checked.

### GTM and GA4
- [ ] Naming convention and folders followed.
- [ ] Google tag carries the user properties.
- [ ] Published only after testing, with version notes; container JSON exported.
- [ ] GTM Preview shows expected triggers and tags.
- [ ] DebugView shows expected events, parameters and user properties.
- [ ] Time zone, currency and enhanced measurement set as in sections 9.3 and 12.
- [ ] `purchase` is a key event.
- [ ] Custom dimensions registered with the correct scope.
- [ ] Test traffic separated.
- [ ] Funnel exploration built; item and revenue reports checked.

### Documentation
- [ ] README, requirements, tracking plan (three tables), test results, challenges and improvements complete.
- [ ] Evidence saved in `docs/evidence/`.

---

## 15. Current State and Required Changes

The storefront exists (Vite, React 19, plain CSS, lucide-react) with cart, checkout, order saving, pricing utilities and local image assets. **No tracking exists yet**: no GTM snippet or `dataLayer.js`. Only `docs/CHALLENGES.md` is currently present; the remaining analytics documentation and evidence are still pending.

Required refactors before tracking work:

| Area | Change |
|---|---|
| Routes | Cut to 5; merge confirmation into `/checkout`; move category and search into `/shop` query parameters; delete Contact, Shipping & Returns, NotFound, Search, Category pages |
| Categories | Replace the old category mix with section 5.1 |
| Products | Replace the catalogue with section 5.3 |
| Images | Local product, site and placeholder assets are present; restore the credits file and verify script |
| Discounts | Badges, struck-through prices, sale filter, "biggest discount" sort, savings line |
| Coupons | Data file, calculation order, `CouponInput`, order object fields, **coupon allocation function (6.4)** |
| Orders | Stronger transaction ID, tracked-ID flag, redirect when no order |
| Footer | No newsletter form; static shipping and returns text only |
| Environment | Add `.env.example`; remove unused host config |

---

## 16. Recommended Build Order

**Phase A — Refactor (no analytics)**
1. Update this file in the repo and commit.
2. Categories and products (sections 5.1–5.3).
3. Local images and verify script.
4. Discount UI.
5. Coupons and pricing changes, with unit checks from section 6.3 **and the allocation checks from section 6.4**.
6. 5-page restructure, order persistence rules (section 8.4).
7. Build, deploy early, and test refresh on every route.

**Phase B — Analytics layer**
1. `dataLayer.js` with `buildItem` (supports coupon allocation), the ecommerce clear, `sanitiseSearchTerm`, the known-coupon check, and all 12 recommended event helpers.
2. Router wrapper for `virtual_page_view`.
3. The 10 custom events.
4. User property helpers and the `index.html` bootstrap.
5. Purchase deduplication; check StrictMode duplicates.

**Phase C — GTM**
1. Install the container and Google tag, **with user properties on the Google tag**.
2. Variables, triggers, tags and folders.
3. Preview testing, first load and route changes separately; fix before publishing.

**Phase D — GA4**
1. Property settings (time zone, currency, enhanced measurement).
2. DebugView and Realtime checks; key event; test traffic.
3. Register custom dimensions, then run a clean final test.
4. Funnel exploration and item and revenue reports.

**Phase E — QA and documentation**
1. Run every test in `docs/TEST_CASES.md`.
2. Save evidence, export the GTM JSON.
3. Complete README and tracking plan.
4. Prepare a short demo walkthrough.

---

## 17. AI Coding Agent Instructions

AI agents are optional helpers, not part of the website runtime.
- Read `PROJECT_TASK.md` before changing code, and inspect the existing code first.
- Work one phase at a time.
- Keep analytics code in `src/analytics/dataLayer.js` (plus the documented bootstrap).
- Reuse the shared product data and pricing utilities.
- No new dependencies or frameworks without asking.
- Never commit secrets, `.env`, `node_modules/` or `dist/`.
- Run `npm run build` and `npm run verify:images` after meaningful changes.
- Report checks run and checks that still need manual browser testing.
- Log significant issues in `docs/CHALLENGES.md`.
- When requirements conflict, ask. Do not silently change scope.

---

## 18. Useful Commands and References

```bash
npm install
npm run dev
npm run build
npm run preview
npm run verify:images
```

- GA4 e-commerce events: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
- GA4 e-commerce with GTM: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm
- Install GTM: https://support.google.com/tagmanager/answer/6103696
- GTM Preview and debug: https://support.google.com/tagmanager/answer/6107056
- GA4 DebugView: https://support.google.com/analytics/answer/7201382
- GA4 custom dimensions: https://support.google.com/analytics/answer/14240153
- GA4 user properties: https://support.google.com/analytics/answer/9269570

---

**Final principle:** A polished storefront helps, but the strongest demonstration is a complete journey where the right GA4 events fire through GTM, values match the displayed order, duplicates are prevented, and everything is backed by real test evidence.