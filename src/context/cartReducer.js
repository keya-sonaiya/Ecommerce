import { mapProductToCartItem, createCartLineKey } from '../utils/itemMapper.js';
import { calculateCartTotals } from '../utils/pricing.js';
import { getCoupon } from '../data/coupons.js';

export const CART_ACTION_TYPES = {
  INIT_CART: 'INIT_CART',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_SHIPPING_METHOD: 'SET_SHIPPING_METHOD',
  APPLY_COUPON: 'APPLY_COUPON',
  REMOVE_COUPON: 'REMOVE_COUPON',
  CLEAR_COUPON_NOTICE: 'CLEAR_COUPON_NOTICE',
};

export const initialCartState = {
  items: [],
  shippingMethod: 'standard',
  couponCode: null,
  couponNotice: null,
  ...calculateCartTotals([], 'standard', ''),
};

/**
 * Checks if active coupon still meets minimum subtotal; auto-removes if deficit
 */
function evaluateCartState(items, shippingMethod, couponCode, previousNotice = null) {
  let activeCode = couponCode;
  let notice = previousNotice;

  if (activeCode) {
    const coupon = getCoupon(activeCode);
    const subtotal = items.reduce((sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1), 0);
    if (!coupon || subtotal < coupon.minSubtotal) {
      if (coupon && subtotal < coupon.minSubtotal && items.length > 0) {
        notice = `Coupon ${coupon.code} was removed because subtotal fell below minimum (₹${coupon.minSubtotal.toLocaleString('en-IN')}).`;
      }
      activeCode = null;
    }
  }

  const totals = calculateCartTotals(items, shippingMethod, activeCode || '');

  return {
    items,
    shippingMethod,
    couponCode: activeCode,
    couponNotice: notice,
    ...totals,
  };
}

export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTION_TYPES.INIT_CART: {
      const items = Array.isArray(action.payload?.items) ? action.payload.items : [];
      const shippingMethod = action.payload?.shippingMethod || 'standard';
      const couponCode = action.payload?.couponCode || null;
      return evaluateCartState(items, shippingMethod, couponCode);
    }

    case CART_ACTION_TYPES.ADD_ITEM: {
      const { product, size, color, quantity = 1 } = action.payload;
      if (!product) return state;

      const lineKey = createCartLineKey(product.id, size, color);
      const existingIndex = state.items.findIndex((item) => item.lineKey === lineKey);

      let updatedItems;
      if (existingIndex > -1) {
        updatedItems = state.items.map((item, idx) => {
          if (idx === existingIndex) {
            const maxAllowed = Math.min(item.stock || 10, 10);
            const newQty = Math.min(maxAllowed, item.quantity + (Number(quantity) || 1));
            return { ...item, quantity: newQty };
          }
          return item;
        });
      } else {
        const newItem = mapProductToCartItem(product, size, color, quantity);
        updatedItems = [...state.items, newItem];
      }

      return evaluateCartState(updatedItems, state.shippingMethod, state.couponCode);
    }

    case CART_ACTION_TYPES.REMOVE_ITEM: {
      const { lineKey } = action.payload;
      const updatedItems = state.items.filter((item) => item.lineKey !== lineKey);
      return evaluateCartState(updatedItems, state.shippingMethod, state.couponCode);
    }

    case CART_ACTION_TYPES.UPDATE_QUANTITY: {
      const { lineKey, quantity } = action.payload;
      const newQty = Math.max(1, Number(quantity) || 1);

      const updatedItems = state.items.map((item) => {
        if (item.lineKey === lineKey) {
          const maxAllowed = Math.min(item.stock || 10, 10);
          return { ...item, quantity: Math.min(maxAllowed, newQty) };
        }
        return item;
      });

      return evaluateCartState(updatedItems, state.shippingMethod, state.couponCode);
    }

    case CART_ACTION_TYPES.SET_SHIPPING_METHOD: {
      const shippingMethod = action.payload || 'standard';
      return evaluateCartState(state.items, shippingMethod, state.couponCode);
    }

    case CART_ACTION_TYPES.APPLY_COUPON: {
      const code = action.payload;
      return evaluateCartState(state.items, state.shippingMethod, code, null);
    }

    case CART_ACTION_TYPES.REMOVE_COUPON: {
      return evaluateCartState(state.items, state.shippingMethod, null, null);
    }

    case CART_ACTION_TYPES.CLEAR_COUPON_NOTICE: {
      return {
        ...state,
        couponNotice: null,
      };
    }

    case CART_ACTION_TYPES.CLEAR_CART: {
      return {
        ...state,
        items: [],
        couponCode: null,
        couponNotice: null,
        ...calculateCartTotals([], state.shippingMethod, ''),
      };
    }

    default:
      return state;
  }
}
