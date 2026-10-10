# Atelier Nord

Atelier Nord is a fictional Scandinavian-fashion e-commerce demo built for the Tatvic Technical Analyst (Data Collection) assessment. It pairs a five-route React storefront with a Google Tag Manager (GTM) and GA4 data-layer implementation.

The primary project requirements and tracking specification live in [PROJECT_TASK.md](PROJECT_TASK.md).

## Features

- Five client-side routes: Home, Shop, Product Detail, Cart, and Checkout/Confirmation.
- A 28-item local product catalogue with category, sale, sort, and URL-driven search views.
- Variant selection, cart persistence, quantity changes, coupons, free-shipping progress, and simulated checkout.
- Local product and editorial imagery with image fallbacks.
- Coupon allocation across items for GA4-consistent checkout and purchase values.
- A shared analytics module at `src/analytics/dataLayer.js`; UI components call named helpers and never push directly to `window.dataLayer`.

## Stack

- React 19 and Vite 6
- React Router 7
- React Context and `useReducer` for cart state
- Plain CSS and `lucide-react`
- Browser `localStorage` for cart, order, purchase-deduplication, and user-property state
- Google Tag Manager and GA4 (configuration required outside this repository)

## Run locally

Prerequisites: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

Vite serves the app at [http://localhost:3000](http://localhost:3000). If PowerShell blocks `npm.ps1`, use `npm.cmd run dev` instead.

Create a local `.env` file from `.env.example` before testing GTM:

```env
VITE_GTM_ID=GTM-XXXXXXXX
```

`VITE_GTM_ID` is compiled into the client bundle, so restart the development server after changing it. Never commit `.env`.

## Build and checks

```bash
npm run build
npm run preview
```

No automated pricing or image-verification script is currently provided. Restore the planned checks under `scripts/` and add their npm commands before treating the assessment test suite as complete.

## Routes

| Route | Purpose |
|---|---|
| `/` | Hero, category links, featured products, and bestsellers |
| `/shop` | Catalogue with `category`, `sale`, `q`, `sort`, and price query parameters |
| `/product/:id` | Product information, variants, quantity, and add-to-bag action |
| `/cart` | Bag contents, coupon entry, shipping progress, and order summary |
| `/checkout` | Details, shipping, payment, review, and confirmation on one route |

Unknown routes redirect to `/`. The checkout confirmation is deliberately a step on `/checkout`, not a sixth route.

## Analytics implementation

`src/analytics/dataLayer.js` owns all application data-layer pushes. It provides helpers for GA4-recommended e-commerce events, custom events, user properties, item mapping, coupon-safe values, and purchase deduplication.

Implemented tracking includes:

- Product and cart events: `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, and `view_cart`.
- Checkout events: `begin_checkout`, `add_shipping_info`, `add_payment_info`, and a transaction-ID-deduplicated `purchase`.
- Supporting events: `search`, `filter_products`, `sort_products`, `select_variant`, `update_cart_quantity`, `apply_coupon`, `coupon_error`, `checkout_error`, `select_shipping_method`, `click_cta`, and `free_shipping_unlocked`.
- First-load user-property bootstrap in `index.html`, plus route-change page views through `RouteTracker` and `virtual_page_view`.

The app deliberately avoids sending customer names, email addresses, phones, or addresses. Coupon codes are emitted only for known demo codes; search terms are normalised and rejected when they resemble an email address or phone number.

### GTM and GA4 setup

This repository installs the GTM bootstrap snippet, but GTM and GA4 still require manual configuration:

1. Create one GTM Web container and set `VITE_GTM_ID` locally and in the deployment environment.
2. Configure the Google tag for the initial page view and attach the four user properties.
3. Add Custom Event triggers and GA4 Event tags for the data-layer event names in [PROJECT_TASK.md](PROJECT_TASK.md).
4. Configure GA4 with India Standard Time and INR; disable browser-history page changes and enhanced-measurement site search.
5. Register the required custom dimensions before the final test pass.
6. Validate the full journey in GTM Preview and GA4 DebugView before publishing the container.

Do not claim analytics is verified until the manual GTM Preview and DebugView checks have been completed and real evidence is saved.

## Data and pricing

Products, categories, coupons, and image paths are local JavaScript data sources under `src/data`. Price calculations are centralised in `src/utils/pricing.js`.

Supported demo coupons are:

- `WELCOME10`: 10% off, capped at ₹500, with a ₹1,500 minimum subtotal.
- `NORD500`: ₹500 off a ₹4,000 minimum subtotal.
- `FREESHIP`: standard-shipping waiver.

Coupon allocation is used only for analytics checkout and purchase item values. It does not change the shelf prices or customer-facing totals.

## Deployment

The project includes [vercel.json](vercel.json), which rewrites all paths to `index.html` so React Router refreshes work after deployment.

For Vercel, use `npm run build` and publish the `dist` directory. Set `VITE_GTM_ID` in the project environment before deploying. A live deployment URL has not yet been recorded.

## Documentation and test evidence

The project keeps only these deliverables:

- [Tracking plan](docs/TRACKING_PLAN.md)
- [Test cases](docs/TEST_CASES.md)
- [Challenges log](docs/CHALLENGES.md)
- Real GTM Preview and GA4 DebugView screenshots in `docs/evidence/` after testing

The live website URL and validation screenshots are pending; no placeholder evidence is committed.

## AI assistance

AI assistance was used for implementation support and documentation drafts. Analytics must still be manually validated in GTM Preview and GA4 DebugView before being presented as verified.
