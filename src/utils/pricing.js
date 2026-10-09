import { getCoupon } from '../data/coupons.js';

export const FREE_SHIPPING_THRESHOLD = 2999;
export const STANDARD_SHIPPING_FEE = 99;
export const EXPRESS_SHIPPING_FEE = 199;
export const GST_RATE = 0.05;

/**
 * Calculates final unit price after product discount
 * @param {object} product
 * @returns {number}
 */
export function getFinalUnitPrice(product) {
  if (!product) return 0;
  const price = Number(product.price) || 0;
  const discount = Math.min(Number(product.discount) || 0, price);
  return Math.max(0, price - discount);
}

/**
 * Calculates line total for unit price and quantity
 * @param {number} unitPrice
 * @param {number} quantity
 * @returns {number}
 */
export function getLineTotal(unitPrice, quantity) {
  const qty = Math.max(1, Number(quantity) || 1);
  return (Number(unitPrice) || 0) * qty;
}

/**
 * Allocates coupon discount across cart line items (PROJECT_TASK.md Section 6.4)
 * @param {Array} lines - Array of cart item lines with lineTotal, finalUnitPrice, and quantity
 * @param {number} couponDiscount - Total coupon discount amount
 * @returns {Array} Array of line allocations with lineShare, unitCouponShare, and paidUnitPrice
 */
export function allocateCouponAcrossItems(lines = [], couponDiscount = 0) {
  if (!lines || lines.length === 0 || couponDiscount <= 0) {
    return (lines || []).map((line) => {
      const finalUnit = Number(line.unitPrice ?? line.finalUnitPrice) || 0;
      return {
        lineKey: line.lineKey,
        id: line.id || line.productId,
        lineShare: 0,
        unitCouponShare: 0,
        paidUnitPrice: finalUnit,
      };
    });
  }

  const itemsSubtotal = lines.reduce((sum, line) => {
    const unit = Number(line.unitPrice ?? line.finalUnitPrice) || 0;
    const qty = Number(line.quantity) || 1;
    return sum + unit * qty;
  }, 0);

  if (itemsSubtotal <= 0) {
    return lines.map((line) => ({
      lineKey: line.lineKey,
      id: line.id || line.productId,
      lineShare: 0,
      unitCouponShare: 0,
      paidUnitPrice: 0,
    }));
  }

  let allocatedSoFar = 0;
  return lines.map((line, idx) => {
    const isLast = idx === lines.length - 1;
    const lineTotal = (Number(line.unitPrice ?? line.finalUnitPrice) || 0) * (Number(line.quantity) || 1);
    const qty = Number(line.quantity) || 1;
    const finalUnit = Number(line.unitPrice ?? line.finalUnitPrice) || 0;

    let lineShare;
    if (isLast) {
      // Last line absorbs the rounding remainder
      lineShare = Number((couponDiscount - allocatedSoFar).toFixed(2));
    } else {
      lineShare = Number(((couponDiscount * lineTotal) / itemsSubtotal).toFixed(2));
      allocatedSoFar += lineShare;
    }

    const unitCouponShare = Number((lineShare / qty).toFixed(2));
    const paidUnitPrice = Number((finalUnit - unitCouponShare).toFixed(2));

    return {
      lineKey: line.lineKey,
      id: line.id || line.productId,
      lineShare,
      unitCouponShare,
      paidUnitPrice,
    };
  });
}

/**
 * Calculates cart totals according to the exact order in PROJECT_TASK.md Section 6.3:
 * 1. itemsSubtotal
 * 2. couponDiscount
 * 3. discountedSubtotal
 * 4. shipping
 * 5. tax
 * 6. total
 *
 * @param {Array} items
 * @param {'standard' | 'express'} [shippingMethod='standard']
 * @param {string} [couponCode='']
 * @returns {object}
 */
export function calculateCartTotals(items = [], shippingMethod = 'standard', couponCode = '') {
  // 1. itemsSubtotal = sum of final unit price × quantity
  const itemsSubtotal = items.reduce((sum, item) => {
    const unit = Number(item.unitPrice ?? item.finalUnitPrice) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + unit * qty;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  // Product savings (informational): sum of discount × quantity
  const productSavings = items.reduce((sum, item) => {
    const disc = Number(item.discount) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + disc * qty;
  }, 0);

  // 2. couponDiscount = from itemsSubtotal, whole rupees, never above itemsSubtotal (0 for FREESHIP)
  let couponDiscount = 0;
  let activeCoupon = null;
  let couponError = null;

  if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
    const coupon = getCoupon(couponCode);
    if (!coupon) {
      couponError = 'Invalid coupon code';
    } else if (itemsSubtotal < coupon.minSubtotal) {
      const deficit = coupon.minSubtotal - itemsSubtotal;
      couponError = `Add ₹${deficit} more to use ${coupon.code}`;
    } else {
      activeCoupon = coupon;
      if (coupon.type === 'percent') {
        const raw = Math.round(itemsSubtotal * (coupon.value / 100));
        couponDiscount = coupon.maxDiscount ? Math.min(coupon.maxDiscount, raw) : raw;
      } else if (coupon.type === 'flat') {
        couponDiscount = Math.min(itemsSubtotal, coupon.value);
      } else if (coupon.type === 'shipping') {
        couponDiscount = 0; // Handled under shipping
      }
      couponDiscount = Math.min(couponDiscount, itemsSubtotal);
    }
  }

  // 3. discountedSubtotal = itemsSubtotal − couponDiscount
  const discountedSubtotal = Math.max(0, itemsSubtotal - couponDiscount);

  // 4. shipping: free if discountedSubtotal ≥ 2999, otherwise ₹99 standard or ₹199 express. FREESHIP makes standard shipping ₹0.
  let shipping = 0;
  if (items.length > 0) {
    if (shippingMethod === 'express') {
      shipping = EXPRESS_SHIPPING_FEE;
    } else {
      // Standard shipping
      if (discountedSubtotal >= FREE_SHIPPING_THRESHOLD || (activeCoupon && activeCoupon.type === 'shipping')) {
        shipping = 0;
      } else {
        shipping = STANDARD_SHIPPING_FEE;
      }
    }
  }

  // 5. tax = round(5% of discountedSubtotal)
  const tax = items.length === 0 ? 0 : Math.round(discountedSubtotal * GST_RATE);

  // 6. total = discountedSubtotal + shipping + tax
  const total = items.length === 0 ? 0 : discountedSubtotal + shipping + tax;

  // Coupon Allocation for events / analytics
  const couponAllocation = allocateCouponAcrossItems(items, couponDiscount);

  // Progress towards free standard shipping
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const hasFreeShipping = shipping === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD;

  return {
    itemsSubtotal,
    couponDiscount,
    discountedSubtotal,
    shipping,
    tax,
    total,
    itemCount,
    productSavings,
    couponCode: activeCoupon ? activeCoupon.code : null,
    couponError,
    couponAllocation,
    shippingMethod,
    amountNeededForFreeShipping,
    freeShippingProgress,
    hasFreeShipping,
  };
}

export default calculateCartTotals;
