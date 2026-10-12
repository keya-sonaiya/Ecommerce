# Atelier Nord — Event and Parameter Documentation

**Website:** https://ecommerce-26-ivory.vercel.app/  
**Tools:** Google Tag Manager (GTM) and Google Analytics 4 (GA4)  
**Currency:** INR (₹)

## 1. Tracking overview

Atelier Nord sends website interaction data from its React application to `window.dataLayer`. Google Tag Manager uses the event name and associated data to send events to GA4. Tracking covers product discovery, product selection, cart activity, checkout, and purchase.

## 2. GA4 events

| Event | When it is triggered | Parameters sent |
|---|---|---|
| `page_view` | Initial page load and React route changes | `page_location`, `page_title` |
| `view_item_list` | A product list is displayed | `item_list_id`, `item_list_name`, `items` |
| `select_item` | A product is selected from a list | `item_list_id`, `item_list_name`, `items` |
| `view_item` | A product detail page is viewed | `currency`, `value`, `items` |
| `add_to_cart` | A product is added or its quantity is increased | `currency`, `value`, `items` |
| `remove_from_cart` | A product is removed or its quantity is decreased | `currency`, `value`, `items` |
| `view_cart` | A non-empty cart is viewed | `currency`, `value`, `items` |
| `begin_checkout` | Checkout begins with items in the cart | `currency`, `value`, `coupon` (when applied), `items` |
| `add_shipping_info` | The shipping step is confirmed | `shipping_tier`, `currency`, `value`, `coupon` (when applied), `items` |
| `add_payment_info` | The payment step is confirmed | `payment_type`, `currency`, `value`, `coupon` (when applied), `items` |
| `purchase` | An order is successfully placed | `transaction_id`, `currency`, `value`, `tax`, `shipping`, `coupon` (when applied), `items` |
| `search` | An allowed, non-empty product search is submitted | `search_term` |

**Page views:** The React route tracker pushes `virtual_page_view`; GTM maps this to the GA4 `page_view` event. The initial page view is sent by the Google tag. Browser-history page-view tracking is disabled to avoid overlapping page views.

**`page_location` limitation:** `page_location` is the complete browser URL. On the shop route it can therefore include the `?q=` search query. The sanitised `search` event does not alter that URL, so visitors must not enter personal information in the on-site search box. This demo does not strip `q` from `page_location`.

## 3. Custom events

| Event | When it is triggered | Parameters sent |
|---|---|---|
| `filter_products` | A category or sale filter is applied | `filter_type`, `filter_value` |
| `sort_products` | The product sort order changes | `sort_option` |
| `select_variant` | A product size or colour is selected | `variant_type`, `variant_value`, `item_id` |
| `update_cart_quantity` | An item's cart quantity is increased or decreased | `item_id`, `direction`, `quantity_after` |
| `apply_coupon` | A valid coupon is applied | `coupon_code`, `discount_amount` |
| `coupon_error` | A coupon attempt is rejected | `error_reason`, `coupon_code` (only for a known, safe code) |
| `checkout_error` | Validation fails on the checkout details step | `error_field`, `checkout_step` |
| `select_shipping_method` | The visitor changes the shipping option | `shipping_tier` |
| `click_cta` | A tracked call-to-action is clicked | `cta_text`, `cta_location` |
| `free_shipping_unlocked` | The cart crosses the free Standard shipping threshold | `cart_value` |

## 4. E-commerce item data

The `items` array provides details about products included in an e-commerce event. Fields are included when relevant to the event.

| Parameter | Description |
|---|---|
| `item_id` | Product identifier |
| `item_name` | Product name |
| `item_brand` | Brand name (`Atelier Nord`) |
| `item_category` | Main product category |
| `item_category2` | Additional category for applicable products |
| `item_variant` | Selected colour and size, where available |
| `price` | Item price used in the event's revenue calculation |
| `discount` | Discount attributed to the item, where applicable |
| `quantity` | Quantity represented by the event |
| `index` | Product position in a product list, starting at 1 |
| `item_list_id` | Product-list identifier, for list-related events |
| `item_list_name` | Product-list name, for list-related events |

Product-list identifiers include `home_featured`, `shop_all`, `shop_category_<slug>`, `shop_sale`, and `shop_search`.

## 5. Revenue and coupon handling

- Monetary e-commerce events use `currency: "INR"`.
- `value` is the sum of item `price × quantity`; shipping and tax are excluded.
- For `purchase`, shipping is sent separately as `shipping` and tax as `tax`. The order total is `value + shipping + tax`.
- When a coupon is applied, `coupon` is sent at event level. The order-level coupon discount is allocated across items using the application's pricing utility, with the final line absorbing the rounding remainder.
- Events before checkout use the applicable product price without allocating an order-level coupon discount.
- The `purchase` event includes a `transaction_id` and `items`. A transaction is protected against repeat tracking in the same browser storage context.
- Cart quantity changes are tracked as changes to quantity, rather than reporting the entire cart as newly added.

## 6. User properties

User properties describe the visitor and are sent with analytics events.

| Property | Values / meaning | When it is updated |
|---|---|---|
| `visitor_type` | `new` or `returning` | Based on the browser's previous-visit flag |
| `has_purchased` | `yes` or `no` | Starts as `no` and changes to `yes` before the purchase event |
| `preferred_category` | Category slug or `unknown` | When a product is viewed or a category filter is used |
| `preferred_size` | Selected size or `unknown` | When a size is selected |


## 7. Custom dimensions

Custom dimensions make selected event parameters and user properties available for analysis in GA4 reports. Event parameters use **event scope**; user properties use **user scope**.

| Scope | Parameter / property |
|---|---|
| Event | `filter_type` |
| Event | `filter_value` |
| Event | `sort_option` |
| Event | `variant_type` |
| Event | `variant_value` |
| Event | `coupon_code` |
| Event | `error_reason` |
| Event | `error_field` |
| Event | `checkout_step` |
| Event | `shipping_tier` |
| Event | `cta_location` |
| Event | `traffic_type` |
| User | `visitor_type` |
| User | `has_purchased` |
| User | `preferred_category` |
| User | `preferred_size` |
