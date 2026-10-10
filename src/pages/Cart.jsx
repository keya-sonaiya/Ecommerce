import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, AlertCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { CartItem } from '../components/cart/CartItem.jsx';
import { FreeShippingMeter } from '../components/cart/FreeShippingMeter.jsx';
import { CouponInput } from '../components/cart/CouponInput.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import {
  trackViewCart, trackAddToCart, trackRemoveFromCart, trackUpdateCartQuantity,
} from '../analytics/dataLayer.js';
import './Cart.css';

export function Cart() {
  useDocumentTitle('Shopping Bag');
  const navigate = useNavigate();

  const {
    items,
    itemCount,
    itemsSubtotal,
    couponCode,
    couponDiscount,
    discountedSubtotal,
    shipping,
    tax,
    total,
    productSavings,
    couponNotice,
    clearCouponNotice,
    hasFreeShipping,
    amountNeededForFreeShipping,
    freeShippingProgress,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // view_cart: once per visit, only with items
  const viewedCart = useRef(false);
  useEffect(() => {
    if (items.length > 0 && !viewedCart.current) {
      viewedCart.current = true;
      trackViewCart(items);
    }
  }, [items]);

  const handleRemove = (lineKey) => {
    const line = items.find((i) => i.lineKey === lineKey);
    if (line) trackRemoveFromCart(line, line.quantity);
    removeFromCart(lineKey);
  };

  // Quantity changes send only the DELTA
  const handleQuantity = (lineKey, newQty) => {
    const line = items.find((i) => i.lineKey === lineKey);
    if (!line || newQty === line.quantity) return;
    const delta = newQty - line.quantity;
    if (delta > 0) trackAddToCart(line, delta);
    else trackRemoveFromCart(line, -delta);
    trackUpdateCartQuantity(line.id, delta > 0 ? 'increase' : 'decrease', newQty);
    updateQuantity(lineKey, newQty);
  };

  if (items.length === 0) {
    return (
      <div className="cart-page cart-empty-page section-spacing">
        <div className="container text-center">
          <div className="empty-cart-icon-wrapper">
            <ShoppingBag size={48} className="empty-bag-icon" />
          </div>
          <span className="section-eyebrow">Your Bag is Empty</span>
          <h1 className="empty-cart-title">Nothing in Your Shopping Bag</h1>
          <p className="empty-cart-text">
            Your shopping bag awaits your curation. Explore our latest arrivals or foundational wardrobe essentials.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Discover The Collection <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page section-spacing">
      <div className="container">
        {/* Page Header */}
        <div className="cart-header">
          <span className="section-eyebrow">Curated Selection</span>
          <h1 className="cart-title">Your Shopping Bag</h1>
          <p className="cart-subtitle">
            You have <strong>{itemCount}</strong> {itemCount === 1 ? 'piece' : 'pieces'} in your bag.
          </p>
        </div>

        {/* Auto-removal coupon notice */}
        {couponNotice && (
          <div className="cart-coupon-notice" role="alert">
            <AlertCircle size={16} className="notice-icon" />
            <span>{couponNotice}</span>
            <button
              type="button"
              className="notice-dismiss-btn"
              onClick={clearCouponNotice}
              aria-label="Dismiss notice"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Free Shipping Progress Meter */}
        <FreeShippingMeter
          amountNeeded={amountNeededForFreeShipping}
          progressPercentage={freeShippingProgress}
          hasFreeShipping={hasFreeShipping}
        />

        {/* Cart Layout: Items List + Order Summary */}
        <div className="cart-layout-grid">
          {/* Items List */}
          <div className="cart-items-column">
            <div className="cart-items-list">
              {items.map((item) => (
                <CartItem
                  key={item.lineKey}
                  item={item}
                  onUpdateQuantity={handleQuantity}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <div className="cart-actions-bottom">
              <Link to="/shop" className="continue-shopping-link">
                <ArrowLeft size={16} /> Continue Browsing Collections
              </Link>
            </div>
          </div>

          {/* Sticky Order Summary Card */}
          <div className="cart-summary-column">
            <div className="cart-summary-card">
              <h2 className="summary-title">Order Overview</h2>

              {/* Coupon Input Form */}
              <CouponInput />

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Items Subtotal</span>
                  <span>{formatPrice(itemsSubtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="summary-row coupon-savings-row">
                    <span>Coupon ({couponCode})</span>
                    <span>- {formatPrice(couponDiscount)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="summary-row">
                    <span>Discounted Subtotal</span>
                    <span>{formatPrice(discountedSubtotal)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Estimated Shipping</span>
                  <span>
                    {hasFreeShipping ? (
                      <strong className="free-shipping-text">FREE</strong>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="summary-row">
                  <span>Estimated GST (5%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                {productSavings > 0 && (
                  <div className="summary-row product-savings-row">
                    <span>Product Savings</span>
                    <span>{formatPrice(productSavings)}</span>
                  </div>
                )}

                <div className="summary-divider" />

                <div className="summary-row summary-total-row">
                  <span className="total-label">Total</span>
                  <span className="total-amount">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="summary-checkout-action">
                <button
                  type="button"
                  className="btn btn-primary btn-full checkout-proceed-btn"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
              </div>

              <div className="summary-guarantee-notes">
                <p>• Prices include standard packaging</p>
                <p>• 14-day hassle-free studio returns</p>
                <p>• Complimentary shipping on orders above ₹2,999</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
