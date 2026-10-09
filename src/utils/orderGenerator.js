/**
 * Generates an order ID adhering to PROJECT_TASK.md Section 8.4:
 * Format: ATN-YYYYMMDD-<6+ character random/time-based suffix>
 * @returns {string}
 */
export function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // 6-character random alphanumeric uppercase suffix
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return `ATN-${year}${month}${day}-${suffix}`;
}

/**
 * Creates a sanitized completed order object without personal details
 * @param {object} params
 * @returns {object}
 */
export function createCompletedOrder({
  items = [],
  itemsSubtotal = 0,
  couponCode = null,
  couponDiscount = 0,
  discountedSubtotal = 0,
  shipping = 0,
  shippingMethod = 'standard',
  tax = 0,
  total = 0,
  paymentMethod = 'Card',
  couponAllocation = [],
  customer = null,
}) {
  const sanitizedItems = items.map((item) => ({
    id: item.productId || item.id,
    name: item.name,
    brand: item.brand || 'Atelier Nord',
    category: item.category,
    subcategory: item.subcategory || null,
    image: item.image,
    variant: {
      size: item.size || null,
      color: item.color || null,
    },
    originalPrice: Number(item.originalPrice) || Number(item.price) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    discount: Number(item.discount) || 0,
    quantity: Number(item.quantity) || 1,
    lineTotal: (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
  }));

  return {
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    customer: customer ? { ...customer } : null,
    items: sanitizedItems,
    itemsSubtotal: Number(itemsSubtotal) || 0,
    couponCode: couponCode || null,
    couponDiscount: Number(couponDiscount) || 0,
    discountedSubtotal: Number(discountedSubtotal) || 0,
    shipping: Number(shipping) || 0,
    shippingMethod: shippingMethod || 'standard',
    tax: Number(tax) || 0,
    total: Number(total) || 0,
    paymentMethod: paymentMethod || 'Card',
    couponAllocation: couponAllocation || [],
  };
}
