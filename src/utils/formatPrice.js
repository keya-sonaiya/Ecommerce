const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * Format a number into INR currency string (e.g. ₹3,499)
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return inrFormatter.format(num);
}

export default formatPrice;

