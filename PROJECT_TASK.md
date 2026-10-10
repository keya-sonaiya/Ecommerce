# Atelier Nord Project Build Notes

This document is the implementation reference for the Atelier Nord storefront. Keep requirements here that affect building, changing, testing, or deploying the project. Public project information belongs in `README.md`; analytics evidence belongs in `docs/`.

## Product

Atelier Nord is a fictional Scandinavian-fashion e-commerce storefront. It is a client-side React application with a local catalogue, persistent cart, coupons, simulated checkout, and Google Tag Manager / GA4 tracking.

The app has exactly five routes:

| Route | Purpose |
| --- | --- |
| `/` | Home, hero, categories, featured products, and sale link |
| `/shop` | Product catalogue with category, sale, search, and sorting filters |
| `/product/:id` | Product detail, variants, quantity, and add-to-bag |
| `/cart` | Bag contents, quantity changes, coupons, shipping, and totals |
| `/checkout` | Details, shipping, payment, review, and confirmation steps |

Unknown routes redirect to `/`. Order confirmation remains the final step of `/checkout`; it is not a separate route.

## Stack And Structure

- React 19 with Vite 6
- React Router 7
- Plain CSS with shared variables and component stylesheets
- `lucide-react` for icons
- React Context and `useReducer` for cart state
- `localStorage` through `src/utils/storage.js`
- Local product, category, coupon, and image data
- Vercel deployment with the SPA rewrite in `vercel.json`

Important ownership boundaries:

- `src/data/`: catalogue, categories, coupons, and image mappings
- `src/context/`: cart state and reducer
- `src/utils/pricing.js`: all price, discount, coupon, tax, and shipping calculations
- `src/utils/itemMapper.js`: shared product-to-cart/analytics item mapping
- `src/utils/orderGenerator.js`: simulated order and transaction generation
- `src/analytics/dataLayer.js`: all application data-layer pushes
- `src/components/`: reusable UI and interaction components
- `src/pages/`: the five route-level views
- `docs/`: tracking documentation, test cases, challenges, and real evidence

Do not add a backend, real payment processing, accounts, inventory management, admin tools, wishlist, chat, newsletter signup, or additional routes unless the product scope changes.

## Catalogue And Shopping Rules

- Keep one shared product source in `src/data/products.js` for cards, details, cart, and analytics.
- Product IDs use `ATN-<CATEGORY_CODE>-<NUMBER>` and must not be reused or renumbered.
- Keep the six categories in `src/data/categories.js`: `t-shirts`, `shirts`, `trousers`, `outerwear`, `knitwear`, and `accessories`.
- Accessories may have a subcategory; other products do not.
- Product images are local files under `public/images/`. Do not add remote image URLs or invented paths.
- Product `price` is the list price and `discount` is the per-unit discount. Final unit price is `price - discount`.
- Cart, coupon code, order, purchase-deduplication, and user-property state persist through the shared storage helpers.
- The checkout is simulated. Never collect or send real payment credentials.

### Filters

Shop filters are URL-driven and use these query parameters:

- `category`
- `sale`
- `q`
- `sort` (`price-asc`, `price-desc`, `discount`, or `newest`)

Invalid category values must fall back to all products without crashing. Search matches product name, category, and accessory subcategory.

### Coupons

Supported demo codes are defined in `src/data/coupons.js`:

- `WELCOME10`: 10% off, capped at INR 500, minimum subtotal INR 1,500
- `NORD500`: INR 500 off, minimum subtotal INR 4,000
- `FREESHIP`: waives standard shipping

Coupon codes are trimmed and case-insensitive. Store only the code and recalculate amounts from current cart contents. Remove a coupon when its minimum is no longer met or the cart is emptied.

Calculation order in `calculateCartTotals()`:

1. Sum final unit price times quantity.
2. Apply the coupon to get the discounted subtotal.
3. Calculate shipping: free at INR 2,999, otherwise INR 99 standard or INR 199 express.
4. Calculate tax as 5% of the discounted subtotal, rounded to whole INR.
5. Add discounted subtotal, shipping, and tax for the customer total.

GA4 `value` excludes shipping and tax. On coupon checkout events, allocate the coupon across items in `pricing.js` so item revenue reconciles with the discounted subtotal. This allocation must not change customer-facing prices.

## Design And Accessibility

- Use a premium, clean, editorial fashion direction.
- Keep the existing ivory, near-black, taupe, serif-heading, and sans-serif-body visual language.
- Preserve responsive layouts for desktop and 375px mobile widths.
- Use local image aspect ratios or fixed dimensions to prevent layout shift.
- Provide visible keyboard focus, labelled form controls, useful empty states, and `aria-live` feedback for status messages.
- Keep animation subtle. Do not add carousels, intrusive popups, or heavy effects.

## Analytics Implementation

The data flow is: UI interaction -> named helper in `dataLayer.js` -> `window.dataLayer` -> GTM Custom Event trigger -> GA4 event tag.

Rules:

- Components must call analytics helpers; they must not push directly to `window.dataLayer`.
- The only data-layer code outside `dataLayer.js` is the initial bootstrap in `index.html`.
- Push `{ ecommerce: null }` before every ecommerce event.
- Use `currency: "INR"` on monetary events and never send ecommerce events with empty `items`.
- Build item objects through the shared item-mapping helper.
- Send `purchase` once per transaction ID and persist the deduplication record.
- Send no names, email addresses, phone numbers, street addresses, payment details, or raw free text to analytics.
- Coupon analytics may include only known demo codes. Search terms must be trimmed, lowercased, length-limited, and rejected when they resemble email addresses or phone numbers.

Implemented recommended events:

`page_view`, `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`, and `search`.

Implemented custom events:

`virtual_page_view`, `filter_products`, `sort_products`, `select_variant`, `update_cart_quantity`, `apply_coupon`, `coupon_error`, `checkout_error`, `select_shipping_method`, `click_cta`, and `free_shipping_unlocked`.

Page-view rules:

- The Google tag sends the initial page view.
- `RouteTracker` sends `virtual_page_view` for later route changes; GTM converts it to `page_view`.
- The confirmation step is a virtual page; other checkout steps are not.
- Avoid duplicate events from rerenders or React StrictMode.

User properties are `visitor_type`, `has_purchased`, `preferred_category`, and `preferred_size`. Bootstrap them before GTM loads, update them through the shared helper, and attach them to the Google tag and event tags.

## GTM And GA4 Setup

Local and deployment configuration:

```env
VITE_GTM_ID=GTM-XXXXXXXX
```

Use `.env.example` as the committed template. Never commit `.env`, `node_modules/`, or `dist/`.

GTM should contain one Web container with:

- One Google tag for the initial page view
- Matching Custom Event triggers and GA4 Event tags for the events above
- Data Layer Variables for custom parameters and user properties
- Folders for configuration, ecommerce events, custom events, and variables
- GTM Preview validation before publishing

GA4 should use one Web data stream with INR currency and India Standard Time. Disable browser-history page changes and automatic site search if the custom `search` event is enabled. Register required custom dimensions before the final validation pass. Treat all traffic as demo/test traffic.

Manual GTM Preview and GA4 DebugView validation is required before claiming analytics is verified.

## Build And Run

Prerequisite: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
npm run build
npm run preview
```

PowerShell users can run `npm.cmd run dev` if the npm PowerShell shim is blocked.

Before a release, verify:

- `npm run build` succeeds.
- All five routes render and refresh correctly in the deployed environment.
- Cart, coupons, checkout, order confirmation, and purchase deduplication work after refresh.
- No browser console errors occur during the main shopping journey.
- GTM Preview shows one expected tag firing per action.
- GA4 DebugView shows correct event names, parameters, items, values, and user properties.
- No personal data appears in any analytics payload.

The current `package.json` does not define automated image or pricing verification commands. Add scripts only when the corresponding implementation and tests exist.

## Documentation

Keep the public overview and usage instructions in `README.md`. Keep supporting project material in:

- `docs/TRACKING_PLAN.md`: event, parameter, user-property, and custom-dimension reference

Update documentation when behavior or tracking contracts change. Do not record fake test results or screenshots.
