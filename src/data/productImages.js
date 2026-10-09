/**
 * Product Image Registry
 * Maps every permanent product ID (28 total) to its local image in public/images/products/.
 * No image URL may be hardcoded anywhere else.
 */

export const productImages = {
  // T-Shirts (4)
  'ATN-TS-001': '/images/products/atn-ts-001.jpg',
  'ATN-TS-002': '/images/products/atn-ts-002.jpg',
  'ATN-TS-003': '/images/products/atn-ts-003.jpg',
  'ATN-TS-004': '/images/products/atn-ts-004.jpg',

  // Shirts (4)
  'ATN-SH-001': '/images/products/atn-sh-001.jpg',
  'ATN-SH-002': '/images/products/atn-sh-002.jpg',
  'ATN-SH-003': '/images/products/atn-sh-003.jpg',
  'ATN-SH-004': '/images/products/atn-sh-004.jpg',

  // Trousers (4)
  'ATN-TR-001': '/images/products/atn-tr-001.jpg',
  'ATN-TR-002': '/images/products/atn-tr-002.jpg',
  'ATN-TR-003': '/images/products/atn-tr-003.jpg',
  'ATN-TR-004': '/images/products/atn-tr-004.jpg',

  // Outerwear (4)
  'ATN-OW-001': '/images/products/atn-ow-001.jpg',
  'ATN-OW-002': '/images/products/atn-ow-002.jpg',
  'ATN-OW-003': '/images/products/atn-ow-003.jpg',
  'ATN-OW-004': '/images/products/atn-ow-004.jpg',

  // Knitwear (4)
  'ATN-KN-001': '/images/products/atn-kn-001.jpg',
  'ATN-KN-002': '/images/products/atn-kn-002.jpg',
  'ATN-KN-003': '/images/products/atn-kn-003.jpg',
  'ATN-KN-004': '/images/products/atn-kn-004.jpg',

  // Accessories (8)
  'ATN-AC-001': '/images/products/atn-ac-001.jpg',
  'ATN-AC-002': '/images/products/atn-ac-002.jpg',
  'ATN-AC-003': '/images/products/atn-ac-003.jpg',
  'ATN-AC-004': '/images/products/atn-ac-004.jpg',
  'ATN-AC-005': '/images/products/atn-ac-005.jpg',
  'ATN-AC-006': '/images/products/atn-ac-006.jpg',
  'ATN-AC-007': '/images/products/atn-ac-007.jpg',
  'ATN-AC-008': '/images/products/atn-ac-008.jpg',
};

/**
 * Returns local image URL for a given product ID
 * @param {string} productId
 * @returns {string}
 */
export function getProductImageUrl(productId) {
  if (!productId) return '/images/placeholder.svg';
  const key = String(productId).toUpperCase();
  return productImages[key] || `/images/products/${productId.toLowerCase()}.jpg` || '/images/placeholder.svg';
}

export default productImages;
