import { getFinalUnitPrice } from './pricing.js';

/**
 * Creates a unique cart line key combining productId, size, and color.
 * Different variants produce distinct lines.
 * @param {string} productId
 * @param {string} [size='']
 * @param {string} [color='']
 * @returns {string}
 */
export function createCartLineKey(productId, size = '', color = '') {
  return `${productId}_${size || 'nosize'}_${color || 'nocolor'}`;
}

/**
 * Maps a product and chosen variant into a standardized cart item object.
 * @param {object} product
 * @param {string} [size='']
 * @param {string} [color='']
 * @param {number} [quantity=1]
 * @returns {object}
 */
export function mapProductToCartItem(product, size = '', color = '', quantity = 1) {
  const finalUnitPrice = getFinalUnitPrice(product);
  const qty = Math.max(1, Number(quantity) || 1);
  const lineKey = createCartLineKey(product.id, size, color);

  return {
    lineKey,
    productId: product.id,
    id: product.id,
    name: product.name,
    brand: product.brand || 'Atelier Nord',
    category: product.category,
    subcategory: product.subcategory,
    image: product.image,
    alt: product.alt || product.name,
    originalPrice: Number(product.price) || 0,
    discount: Number(product.discount) || 0,
    unitPrice: finalUnitPrice,
    size: size || null,
    color: color || null,
    quantity: qty,
    stock: Number(product.stock) || 0,
  };
}

