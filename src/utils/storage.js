export const CART_STORAGE_KEY = 'atelier_nord_cart';
export const ORDER_STORAGE_KEY = 'atelier_nord_completed_order';

/**
 * Safely read and parse JSON from localStorage
 * @param {string} key
 * @param {*} fallbackValue
 * @returns {*}
 */
export function getFromStorage(key, fallbackValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] Error reading key "${key}" from localStorage:`, error);
    return fallbackValue;
  }
}

/**
 * Safely stringify and write to localStorage
 * @param {string} key
 * @param {*} value
 * @returns {boolean}
 */
export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] Error writing key "${key}" to localStorage:`, error);
    return false;
  }
}

/**
 * Remove an item from localStorage
 * @param {string} key
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] Error removing key "${key}" from localStorage:`, error);
  }
}

