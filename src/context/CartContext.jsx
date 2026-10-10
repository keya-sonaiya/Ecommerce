import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { cartReducer, initialCartState, CART_ACTION_TYPES } from './cartReducer.js';
import { getFromStorage, setToStorage, CART_STORAGE_KEY, ORDER_STORAGE_KEY } from '../utils/storage.js';
import { createCompletedOrder } from '../utils/orderGenerator.js';
import { getCoupon } from '../data/coupons.js';
import { FREE_SHIPPING_THRESHOLD } from '../utils/pricing.js';
import { trackFreeShippingUnlocked } from '../analytics/dataLayer.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState, () => {
    const saved = getFromStorage(CART_STORAGE_KEY, null);
    if (saved && Array.isArray(saved.items)) {
      return cartReducer(initialCartState, {
        type: CART_ACTION_TYPES.INIT_CART,
        payload: {
          items: saved.items,
          shippingMethod: saved.shippingMethod || 'standard',
          couponCode: saved.couponCode || null,
        },
      });
    }
    return initialCartState;
  });

  // Persist only items, shippingMethod, and couponCode to localStorage
  useEffect(() => {
    setToStorage(CART_STORAGE_KEY, {
      items: state.items,
      shippingMethod: state.shippingMethod,
      couponCode: state.couponCode,
    });
  }, [state.items, state.shippingMethod, state.couponCode]);

  // free_shipping_unlocked: fires only when the cart crosses the threshold upwards
  const prevSubtotal = useRef(state.discountedSubtotal);
  useEffect(() => {
    const prev = prevSubtotal.current;
    if (prev < FREE_SHIPPING_THRESHOLD && state.discountedSubtotal >= FREE_SHIPPING_THRESHOLD) {
      trackFreeShippingUnlocked(state.discountedSubtotal);
    }
    prevSubtotal.current = state.discountedSubtotal;
  }, [state.discountedSubtotal]);

  // Central Cart Actions
  const addToCart = (product, size = '', color = '', quantity = 1) => {
    dispatch({
      type: CART_ACTION_TYPES.ADD_ITEM,
      payload: { product, size, color, quantity },
    });
  };

  const removeFromCart = (lineKey) => {
    dispatch({
      type: CART_ACTION_TYPES.REMOVE_ITEM,
      payload: { lineKey },
    });
  };

  const updateQuantity = (lineKey, quantity) => {
    dispatch({
      type: CART_ACTION_TYPES.UPDATE_QUANTITY,
      payload: { lineKey, quantity },
    });
  };

  const setShippingMethod = (method) => {
    dispatch({
      type: CART_ACTION_TYPES.SET_SHIPPING_METHOD,
      payload: method,
    });
  };

  const applyCoupon = (rawCode) => {
    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return { success: false, error: 'Please enter a coupon code' };
    }
    const coupon = getCoupon(rawCode);
    if (!coupon) {
      return { success: false, error: 'Invalid coupon code' };
    }
    if (state.itemsSubtotal < coupon.minSubtotal) {
      const deficit = coupon.minSubtotal - state.itemsSubtotal;
      return {
        success: false,
        error: `Add ₹${deficit.toLocaleString('en-IN')} more to use ${coupon.code}`,
      };
    }

    dispatch({
      type: CART_ACTION_TYPES.APPLY_COUPON,
      payload: coupon.code,
    });
    return { success: true };
  };

  const removeCoupon = () => {
    dispatch({ type: CART_ACTION_TYPES.REMOVE_COUPON });
  };

  const clearCouponNotice = () => {
    dispatch({ type: CART_ACTION_TYPES.CLEAR_COUPON_NOTICE });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTION_TYPES.CLEAR_CART });
  };

  const placeOrder = ({ paymentMethod = 'Card', shippingMethod = state.shippingMethod, customer = null } = {}) => {
    const orderData = createCompletedOrder({
      items: state.items,
      itemsSubtotal: state.itemsSubtotal,
      couponCode: state.couponCode,
      couponDiscount: state.couponDiscount,
      discountedSubtotal: state.discountedSubtotal,
      shipping: state.shipping,
      shippingMethod,
      tax: state.tax,
      total: state.total,
      paymentMethod,
      couponAllocation: state.couponAllocation,
      customer,
    });

    setToStorage(ORDER_STORAGE_KEY, orderData);
    clearCart();
    return orderData;
  };

  const value = {
    cart: state,
    items: state.items,
    itemCount: state.itemCount,
    itemsSubtotal: state.itemsSubtotal,
    couponDiscount: state.couponDiscount,
    discountedSubtotal: state.discountedSubtotal,
    shipping: state.shipping,
    shippingMethod: state.shippingMethod,
    tax: state.tax,
    total: state.total,
    productSavings: state.productSavings,
    couponCode: state.couponCode,
    couponError: state.couponError,
    couponNotice: state.couponNotice,
    couponAllocation: state.couponAllocation,
    hasFreeShipping: state.hasFreeShipping,
    amountNeededForFreeShipping: state.amountNeededForFreeShipping,
    freeShippingProgress: state.freeShippingProgress,
    addToCart,
    removeFromCart,
    updateQuantity,
    setShippingMethod,
    applyCoupon,
    removeCoupon,
    clearCouponNotice,
    clearCart,
    placeOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
