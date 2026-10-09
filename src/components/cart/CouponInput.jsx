import React, { useState } from 'react';
import { Tag, Check, X, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import './CouponInput.css';

export function CouponInput({ className = '' }) {
  const { couponCode, couponDiscount, couponError, applyCoupon, removeCoupon } = useCart();
  const [inputVal, setInputVal] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    const code = inputVal.trim();
    if (!code) {
      setLocalError('Please enter a coupon code');
      return;
    }
    const result = applyCoupon(code);
    if (!result.success) {
      setLocalError(result.error);
    } else {
      setInputVal('');
      setLocalError('');
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setInputVal('');
    setLocalError('');
  };

  const displayedError = localError || couponError;

  return (
    <div className={`coupon-input-wrapper ${className}`}>
      {couponCode ? (
        <div className="active-coupon-badge">
          <div className="active-coupon-info">
            <Check size={16} className="active-coupon-check" />
            <div>
              <span className="active-coupon-code">{couponCode} applied</span>
              {couponDiscount > 0 ? (
                <span className="active-coupon-savings">
                  You saved {formatPrice(couponDiscount)}
                </span>
              ) : (
                <span className="active-coupon-savings">
                  Complimentary standard shipping unlocked
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="coupon-remove-btn"
            onClick={handleRemove}
            aria-label={`Remove coupon ${couponCode}`}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="coupon-form" noValidate>
          <div className="coupon-field-row">
            <div className="coupon-input-container">
              <Tag size={15} className="coupon-tag-icon" />
              <input
                type="text"
                className={`coupon-text-input ${displayedError ? 'has-error' : ''}`}
                placeholder="Promo code"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  if (localError) setLocalError('');
                }}
                aria-label="Enter promotional coupon code"
              />
            </div>
            <button type="submit" className="btn btn-secondary coupon-apply-btn">
              Apply
            </button>
          </div>

          <div className="coupon-hint-text">
            Try <strong>WELCOME10</strong> (10% off) or <strong>NORD500</strong> (₹500 off)
          </div>

          {displayedError && (
            <div className="coupon-error-message" role="alert">
              <AlertCircle size={14} />
              <span>{displayedError}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default CouponInput;
