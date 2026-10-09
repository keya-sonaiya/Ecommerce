/**
 * Coupon Definitions from PROJECT_TASK.md Section 6.2
 */

export const coupons = {
  WELCOME10: {
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    maxDiscount: 500,
    minSubtotal: 1500,
    description: '10% off orders over ₹1,500 (up to ₹500)',
  },
  NORD500: {
    code: 'NORD500',
    type: 'flat',
    value: 500,
    maxDiscount: null,
    minSubtotal: 4000,
    description: 'Flat ₹500 off orders over ₹4,000',
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'shipping',
    value: 0,
    maxDiscount: null,
    minSubtotal: 0,
    description: 'Complimentary standard shipping on all orders',
  },
};

/**
 * Finds and validates coupon code
 * @param {string} code
 * @returns {object|null}
 */
export function getCoupon(code) {
  if (!code || typeof code !== 'string') return null;
  const normalized = code.trim().toUpperCase();
  return coupons[normalized] || null;
}

export default coupons;
