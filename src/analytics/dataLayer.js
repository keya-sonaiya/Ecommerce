import { getFromStorage, setToStorage } from '../utils/storage.js';
import { getCoupon } from '../data/coupons.js';

const CURRENCY = 'INR';
export const USER_PROPS_KEY = 'atelier_nord_user_props';
const TRACKED_KEY = 'atelier_nord_tracked_transactions';
const DEFAULT_PROPS = {
  visitor_type: 'new',
  has_purchased: 'no',
  preferred_category: 'unknown',
  preferred_size: 'unknown',
};

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function push(payload) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

// Clears old ecommerce data, then pushes. Never sends an empty items array.
function pushEcommerce(event, params, items) {
  if (!items || items.length === 0) return;
  push({ ecommerce: null });
  push({ event, ecommerce: { ...params, items } });
}

/* ---------- User properties ---------- */
export function getUserProperties() {
  return { ...DEFAULT_PROPS, ...getFromStorage(USER_PROPS_KEY, {}) };
}

export function setUserProperties(patch = {}) {
  const next = { ...getUserProperties(), ...patch };
  Object.keys(next).forEach((k) => {
    next[k] = next[k] ? String(next[k]).slice(0, 36) : 'unknown';
  });
  setToStorage(USER_PROPS_KEY, next);
  push({ user_properties: next });
  return next;
}

/* ---------- Item builder ---------- */
// src = a product (price/discount) OR a cart line (unitPrice/discount/size/color)
export function buildItem(src, opts = {}) {
  const { quantity, index, listId, listName, couponShare = 0 } = opts;
  const isLine = src.unitPrice !== undefined;
  const finalUnit = isLine
    ? Number(src.unitPrice)
    : Number(src.price) - Number(src.discount || 0);
  const size = opts.size ?? src.size;
  const color = opts.color ?? src.color;
  const variant = [color, size].filter(Boolean).join(' / ');

  const item = {
    item_id: src.id,
    item_name: src.name,
    item_brand: src.brand || 'Atelier Nord',
    item_category: src.category,
  };
  if (src.subcategory) item.item_category2 = src.subcategory;
  if (variant) item.item_variant = variant;
  item.price = round2(finalUnit - couponShare);
  item.discount = round2(Number(src.discount || 0) + couponShare);
  item.quantity = quantity ?? src.quantity ?? 1;
  if (index) item.index = index;
  if (listId) item.item_list_id = listId;
  if (listName) item.item_list_name = listName;
  return item;
}

const sumItems = (items) =>
  round2(items.reduce((s, i) => s + i.price * i.quantity, 0));

/* ---------- Page views ---------- */
let lastListSignature = '';
export const resetListSignature = () => { lastListSignature = ''; };

export function trackVirtualPageView({ path, title }) {
  push({
    event: 'virtual_page_view',
    page_location: window.location.href,
    page_title: title || document.title,
    page_path: path,
  });
}

/* ---------- Recommended e-commerce events ---------- */
export function trackViewItemList(products, listId, listName) {
  if (!products || products.length === 0) return;
  const signature = listId + '|' + products.map((p) => p.id).join(',');
  if (signature === lastListSignature) return; // identical list twice in a row
  lastListSignature = signature;
  const items = products.map((p, i) =>
    buildItem(p, { quantity: 1, index: i + 1, listId, listName })
  );
  pushEcommerce('view_item_list', { item_list_id: listId, item_list_name: listName }, items);
}

export function trackSelectItem(product, index, listId, listName) {
  const items = [buildItem(product, { quantity: 1, index, listId, listName })];
  pushEcommerce('select_item', { item_list_id: listId, item_list_name: listName }, items);
}

export function trackViewItem(product) {
  const items = [buildItem(product, { quantity: 1 })];
  pushEcommerce('view_item', { currency: CURRENCY, value: sumItems(items) }, items);
}

export function trackAddToCart(src, quantity = 1, variant = {}) {
  const items = [buildItem(src, { quantity, ...variant })];
  pushEcommerce('add_to_cart', { currency: CURRENCY, value: sumItems(items) }, items);
}

export function trackRemoveFromCart(src, quantity = 1, variant = {}) {
  const items = [buildItem(src, { quantity, ...variant })];
  pushEcommerce('remove_from_cart', { currency: CURRENCY, value: sumItems(items) }, items);
}

export function trackViewCart(lines) {
  const items = lines.map((l) => buildItem(l));
  pushEcommerce('view_cart', { currency: CURRENCY, value: sumItems(items) }, items);
}

// Shared by begin_checkout, add_shipping_info, add_payment_info, purchase (section 6.4)
// totals = cart state or saved order: needs itemsSubtotal, discountedSubtotal,
// couponDiscount, couponCode, couponAllocation
function checkoutPayload(lines, totals) {
  const hasDiscount = Number(totals.couponDiscount) > 0;
  const items = lines.map((line, i) => {
    const alloc = hasDiscount ? totals.couponAllocation?.[i] : null;
    return buildItem(line, { couponShare: alloc ? alloc.unitCouponShare : 0 });
  });
  const params = {
    currency: CURRENCY,
    value: round2(hasDiscount ? totals.discountedSubtotal : totals.itemsSubtotal),
  };
  const knownCode = getCoupon(totals.couponCode)?.code;
  if (knownCode) params.coupon = knownCode;
  return { items, params };
}

export function trackBeginCheckout(lines, totals) {
  const { items, params } = checkoutPayload(lines, totals);
  pushEcommerce('begin_checkout', params, items);
}

export function trackAddShippingInfo(lines, totals, shippingTier) {
  const { items, params } = checkoutPayload(lines, totals);
  pushEcommerce('add_shipping_info', { shipping_tier: shippingTier, ...params }, items);
}

export function trackAddPaymentInfo(lines, totals, paymentType) {
  const { items, params } = checkoutPayload(lines, totals);
  pushEcommerce('add_payment_info', { payment_type: paymentType, ...params }, items);
}

// order = the SAVED order. Personal data (order.customer) is never read.
export function trackPurchase(order) {
  if (!order?.id || !order.items?.length) return false;
  const tracked = getFromStorage(TRACKED_KEY, []);
  if (tracked.includes(order.id)) return false; // already sent

  const lines = order.items.map((it) => ({
    id: it.id,
    name: it.name,
    brand: it.brand,
    category: it.category,
    subcategory: it.subcategory,
    unitPrice: it.unitPrice,
    discount: it.discount,
    quantity: it.quantity,
    size: it.variant?.size,
    color: it.variant?.color,
  }));
  const { items, params } = checkoutPayload(lines, order);
  pushEcommerce(
    'purchase',
    { transaction_id: order.id, ...params, tax: order.tax, shipping: order.shipping },
    items
  );
  setToStorage(TRACKED_KEY, [...tracked, order.id].slice(-50));
  setUserProperties({ has_purchased: 'yes' });
  return true;
}

/* ---------- Search (sanitised) ---------- */
export function sanitiseSearchTerm(raw) {
  if (typeof raw !== 'string') return null;
  const term = raw.toLowerCase().trim().replace(/\s+/g, ' ');
  if (!term) return null;
  if (term.includes('@')) return null;
  if ((term.match(/\d/g) || []).length >= 7) return null;
  return term.slice(0, 40);
}

export function trackSearch(rawTerm) {
  const search_term = sanitiseSearchTerm(rawTerm);
  if (!search_term) return;
  push({ event: 'search', search_term });
}

/* ---------- Custom events ---------- */
export const trackFilterProducts = (filter_type, filter_value) =>
  push({ event: 'filter_products', filter_type, filter_value });

export const trackSortProducts = (sort_option) =>
  push({ event: 'sort_products', sort_option });

export const trackSelectVariant = (variant_type, variant_value, item_id) =>
  push({ event: 'select_variant', variant_type, variant_value, item_id });

export const trackUpdateCartQuantity = (item_id, direction, quantity_after) =>
  push({ event: 'update_cart_quantity', item_id, direction, quantity_after });

export const trackApplyCoupon = (code, discount_amount) => {
  const known = getCoupon(code)?.code;
  if (!known) return;
  push({ event: 'apply_coupon', coupon_code: known, discount_amount });
};

// error_reason: 'invalid' | 'minimum_not_met' | 'empty'
export const trackCouponError = (rawCode, error_reason) => {
  const payload = { event: 'coupon_error', error_reason };
  const known = getCoupon(rawCode)?.code; // raw text is never sent
  if (known) payload.coupon_code = known;
  push(payload);
};

export const trackCheckoutError = (error_field, checkout_step) =>
  push({ event: 'checkout_error', error_field, checkout_step }); // field NAMES only

export const trackSelectShippingMethod = (shipping_tier) =>
  push({ event: 'select_shipping_method', shipping_tier });

export const trackClickCta = (cta_text, cta_location) =>
  push({ event: 'click_cta', cta_text, cta_location });

export const trackFreeShippingUnlocked = (cart_value) =>
  push({ event: 'free_shipping_unlocked', cart_value });