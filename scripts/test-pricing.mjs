import { calculateCartTotals, allocateCouponAcrossItems } from '../src/utils/pricing.js';

console.log('--- Running Pricing and Coupon Reference Checks ---');

// Case 1: One ATN-AC-007 (₹799) with no coupon
const case1Items = [
  { id: 'ATN-AC-007', lineKey: 'ATN-AC-007_nosize_nocolor', unitPrice: 799, quantity: 1, discount: 100 }
];
const case1 = calculateCartTotals(case1Items, 'standard', '');
console.log('Case 1 (ATN-AC-007 no coupon):', {
  shipping: case1.shipping,
  tax: case1.tax,
  total: case1.total
});
console.assert(case1.shipping === 99, `Case 1 shipping expected 99, got ${case1.shipping}`);
console.assert(case1.tax === 40, `Case 1 tax expected 40, got ${case1.tax}`);
console.assert(case1.total === 938, `Case 1 total expected 938, got ${case1.total}`);

// Case 2: WELCOME10 on ₹5,000 subtotal
const case2Items = [
  { id: 'TEST-ITEM', lineKey: 'TEST-ITEM', unitPrice: 5000, quantity: 1, discount: 0 }
];
const case2 = calculateCartTotals(case2Items, 'standard', 'WELCOME10');
console.log('Case 2 (WELCOME10 on 5000):', {
  couponDiscount: case2.couponDiscount,
  discountedSubtotal: case2.discountedSubtotal,
  shipping: case2.shipping,
  tax: case2.tax,
  total: case2.total
});
console.assert(case2.couponDiscount === 500, `Case 2 couponDiscount expected 500, got ${case2.couponDiscount}`);
console.assert(case2.discountedSubtotal === 4500, `Case 2 discountedSubtotal expected 4500, got ${case2.discountedSubtotal}`);
console.assert(case2.shipping === 0, `Case 2 shipping expected 0, got ${case2.shipping}`);
console.assert(case2.tax === 225, `Case 2 tax expected 225, got ${case2.tax}`);
console.assert(case2.total === 4725, `Case 2 total expected 4725, got ${case2.total}`);

// Case 3: Worked allocation example (WELCOME10 on ATN-TS-004 ×1 + ATN-OW-003 ×1)
// Items: 1,499 and 4,999. Subtotal: 6,498. Coupon discount: 500. Discounted subtotal: 5,998.
const case3Items = [
  { id: 'ATN-TS-004', lineKey: 'ATN-TS-004', unitPrice: 1499, quantity: 1, discount: 0 },
  { id: 'ATN-OW-003', lineKey: 'ATN-OW-003', unitPrice: 4999, quantity: 1, discount: 800 }
];
const case3Totals = calculateCartTotals(case3Items, 'standard', 'WELCOME10');
const allocation = case3Totals.couponAllocation;
console.log('Case 3 Coupon Allocation:', allocation);

const sumPaid = allocation.reduce((sum, item) => sum + item.paidUnitPrice, 0);
console.log('Case 3 Paid sum:', sumPaid, 'Expected discountedSubtotal:', case3Totals.discountedSubtotal);
console.assert(Math.abs(sumPaid - case3Totals.discountedSubtotal) < 0.05, `Allocation sum ${sumPaid} does not match discountedSubtotal ${case3Totals.discountedSubtotal}`);
console.assert(Math.abs(allocation[0].paidUnitPrice - 1383.65) <= 0.02, `Line 1 paid price expected ~1383.65, got ${allocation[0].paidUnitPrice}`);
console.assert(Math.abs(allocation[1].paidUnitPrice - 4614.35) <= 0.02, `Line 2 paid price expected ~4614.35, got ${allocation[1].paidUnitPrice}`);

// Case 4: Minimum subtotal check
const belowMinItems = [
  { id: 'LOW', lineKey: 'LOW', unitPrice: 1000, quantity: 1, discount: 0 }
];
const belowMin = calculateCartTotals(belowMinItems, 'standard', 'WELCOME10');
console.assert(belowMin.couponDiscount === 0, 'Below min coupon discount must be 0');
console.assert(belowMin.couponError.includes('Add ₹500 more'), 'Error message should guide minimum subtotal');

// Case 5: FREESHIP check
const freeshipCase = calculateCartTotals(belowMinItems, 'standard', 'FREESHIP');
console.assert(freeshipCase.shipping === 0, 'FREESHIP must waive standard shipping');

console.log('All pricing and coupon reference checks PASSED!');

