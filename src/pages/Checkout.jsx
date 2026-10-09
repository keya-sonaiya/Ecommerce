import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Check,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  PackageCheck,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { FallbackImage } from '../components/common/FallbackImage.jsx';
import { CouponInput } from '../components/cart/CouponInput.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { getFromStorage, ORDER_STORAGE_KEY } from '../utils/storage.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './Checkout.css';

export function Checkout() {
  useDocumentTitle('Simulated Checkout — Atelier Nord');

  const {
    items,
    itemCount,
    itemsSubtotal,
    couponCode,
    couponDiscount,
    discountedSubtotal,
    shipping,
    shippingMethod,
    tax,
    total,
    productSavings,
    hasFreeShipping,
    setShippingMethod,
    placeOrder,
  } = useCart();

  // Active step: 1: Details, 2: Shipping, 3: Payment, 4: Review, 5: Confirmation
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Form Fields State for Step 1
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'Card',
  });

  const [errors, setErrors] = useState({});

  // Refs for focusing first invalid field
  const fieldRefs = {
    fullName: useRef(null),
    email: useRef(null),
    phone: useRef(null),
    address: useRef(null),
    city: useRef(null),
    state: useRef(null),
    postalCode: useRef(null),
  };

  // Scroll to top when changing steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Check saved order from localStorage for Step 5 / refresh support
  const savedOrder = placedOrder || getFromStorage(ORDER_STORAGE_KEY, null);

  // If cart is empty:
  // - If a saved order exists, render Step 5 (Confirmation from storage)
  // - Otherwise, redirect to /cart per PROJECT_TASK.md Section 8.4
  if (items.length === 0 && !placedOrder) {
    if (savedOrder && savedOrder.id) {
      return renderConfirmation(savedOrder);
    }
    return <Navigate to="/cart" replace />;
  }

  // If order was just placed in this session, render confirmation
  if (currentStep === 5 && savedOrder) {
    return renderConfirmation(savedOrder);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full legal name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    const phoneClean = formData.phone.replace(/[\s-]/g, '');
    if (!phoneClean) {
      newErrors.phone = 'Mobile contact number is required.';
    } else if (!/^\d{10}$/.test(phoneClean)) {
      newErrors.phone = 'Please provide a valid 10-digit mobile number.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Street address & apartment details are required.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State / Region is required.';
    }

    const postalClean = formData.postalCode.replace(/[\s-]/g, '');
    if (!postalClean) {
      newErrors.postalCode = 'Postal PIN code is required.';
    } else if (!/^\d{6}$/.test(postalClean)) {
      newErrors.postalCode = 'PIN code must be exactly 6 digits.';
    }

    setErrors(newErrors);

    const firstInvalidField = Object.keys(newErrors)[0];
    if (firstInvalidField && fieldRefs[firstInvalidField]?.current) {
      fieldRefs[firstInvalidField].current.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToShipping = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleContinueToReview = (e) => {
    e.preventDefault();
    setCurrentStep(4);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Simulate order processing delay
    setTimeout(() => {
      try {
        const orderResult = placeOrder({
          paymentMethod: formData.paymentMethod,
          shippingMethod,
          customer: {
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            postalCode: formData.postalCode.trim(),
          },
        });
        setPlacedOrder(orderResult);
        setCurrentStep(5);
      } catch (err) {
        console.error('Order placement failed:', err);
      } finally {
        setIsSubmitting(false);
      }
    }, 600);
  };

  /**
   * Renders Step 5: Confirmation from the completed/saved order
   */
  function renderConfirmation(order) {
    const formattedDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Just now';

    return (
      <div className="checkout-page confirmation-view section-spacing">
        <div className="container">
          <div className="confirmation-card">
            <div className="confirmation-header text-center">
              <div className="confirmation-icon-wrap" aria-hidden="true">
                <Check size={32} />
              </div>
              <span className="section-eyebrow">Order Confirmed</span>
              <h1 className="confirmation-title">Thank you for your order</h1>
              <p className="confirmation-subtitle">
                Your order has been recorded in our simulated atelier.
                {order.customer?.email && (
                  <> An order summary was dispatched to <strong>{order.customer.email}</strong>.</>
                )}
              </p>
            </div>

            {/* Order Meta Bar */}
            <div className="order-meta-banner">
              <div className="order-meta-item">
                <span className="meta-label">Order Reference</span>
                <strong className="meta-value order-id-highlight" data-testid="order-id">
                  {order.id}
                </strong>
              </div>
              <div className="order-meta-item">
                <span className="meta-label">Date & Time</span>
                <span className="meta-value">{formattedDate}</span>
              </div>
              <div className="order-meta-item">
                <span className="meta-label">Payment Method</span>
                <span className="meta-value">{order.paymentMethod} (Simulated)</span>
              </div>
              <div className="order-meta-item">
                <span className="meta-label">Shipping Method</span>
                <span className="meta-value">
                  {order.shippingMethod === 'express' ? 'Express Priority Delivery' : 'Standard Delivery'}
                </span>
              </div>
            </div>

            <div className="confirmation-details-grid">
              {/* Left Column: Items */}
              <div className="confirmation-items-column">
                <h3 className="confirmation-section-heading">
                  Purchased Items ({order.items.reduce((s, i) => s + (i.quantity || 1), 0)})
                </h3>
                <div className="confirmation-items-list">
                  {order.items.map((item, idx) => (
                    <div key={item.id + (item.variant?.size || '') + idx} className="confirmation-item-row">
                      <div className="confirmation-item-thumb">
                        <FallbackImage
                          src={item.image}
                          alt={item.name}
                          productName={item.name}
                          aspectRatio="4/5"
                          className="confirmation-thumb-img"
                        />
                      </div>
                      <div className="confirmation-item-info">
                        <h4 className="confirmation-item-title">{item.name}</h4>
                        <p className="confirmation-item-brand">{item.brand || 'Atelier Nord'}</p>
                        {(item.variant?.size || item.variant?.color) && (
                          <p className="confirmation-item-variant">
                            {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <p className="confirmation-item-qty">
                          Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <div className="confirmation-item-total">
                        {formatPrice(item.lineTotal || item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Address & Financial Breakdown */}
              <div className="confirmation-summary-column">
                {order.customer && (
                  <div className="confirmation-info-box">
                    <h4 className="box-title">Delivery Destination</h4>
                    <p className="customer-name"><strong>{order.customer.fullName}</strong></p>
                    <p className="customer-address">
                      {order.customer.address}, {order.customer.city}, {order.customer.state} — {order.customer.postalCode}
                    </p>
                    {order.customer.phone && (
                      <p className="customer-contact">Phone: +91 {order.customer.phone}</p>
                    )}
                  </div>
                )}

                <div className="confirmation-info-box financial-box">
                  <h4 className="box-title">Financial Summary</h4>
                  <div className="breakdown-row">
                    <span>Items Subtotal</span>
                    <span>{formatPrice(order.itemsSubtotal)}</span>
                  </div>

                  {order.couponDiscount > 0 && (
                    <div className="breakdown-row discount-row">
                      <span>Coupon Savings ({order.couponCode})</span>
                      <span>−{formatPrice(order.couponDiscount)}</span>
                    </div>
                  )}

                  <div className="breakdown-row">
                    <span>
                      Shipping ({order.shippingMethod === 'express' ? 'Express' : 'Standard'})
                    </span>
                    <span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
                  </div>

                  <div className="breakdown-row">
                    <span>GST (5%)</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>

                  <div className="breakdown-divider" />

                  <div className="breakdown-row final-total-row">
                    <span>Total Paid</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="confirmation-actions">
                  <Link to="/shop" className="btn btn-primary btn-block">
                    Continue Shopping <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page section-spacing">
      <div className="container">
        {/* Top Return & Status Banner */}
        <div className="checkout-top-bar">
          <Link to="/cart" className="checkout-back-link">
            <ArrowLeft size={16} /> Return to Shopping Bag
          </Link>
          <div className="checkout-demo-tag">
            <Lock size={14} /> Simulated Demo Checkout
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="demo-notice-alert" role="status">
          <ShieldCheck size={18} className="demo-notice-icon" />
          <div>
            <strong>Demonstration Fashion Store Checkout</strong>
            <p>
              This is a test store. All payments, shipping updates, and orders are simulated. No real cards or bank details will ever be charged.
            </p>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="checkout-stepper-bar" aria-label="Checkout Progress">
          <div className={`stepper-step ${currentStep >= 1 ? 'is-active' : ''} ${currentStep > 1 ? 'is-complete' : ''}`}>
            <span className="stepper-circle">{currentStep > 1 ? <Check size={14} /> : '1'}</span>
            <span className="stepper-label">Details</span>
          </div>
          <div className="stepper-line" />
          <div className={`stepper-step ${currentStep >= 2 ? 'is-active' : ''} ${currentStep > 2 ? 'is-complete' : ''}`}>
            <span className="stepper-circle">{currentStep > 2 ? <Check size={14} /> : '2'}</span>
            <span className="stepper-label">Shipping</span>
          </div>
          <div className="stepper-line" />
          <div className={`stepper-step ${currentStep >= 3 ? 'is-active' : ''} ${currentStep > 3 ? 'is-complete' : ''}`}>
            <span className="stepper-circle">{currentStep > 3 ? <Check size={14} /> : '3'}</span>
            <span className="stepper-label">Payment</span>
          </div>
          <div className="stepper-line" />
          <div className={`stepper-step ${currentStep >= 4 ? 'is-active' : ''} ${currentStep > 4 ? 'is-complete' : ''}`}>
            <span className="stepper-circle">{currentStep > 4 ? <Check size={14} /> : '4'}</span>
            <span className="stepper-label">Review</span>
          </div>
        </div>

        <div className="checkout-grid-layout">
          {/* Main Left Column: Multi-Step Forms */}
          <div className="checkout-steps-column">
            {/* STEP 1: Details (Contact & Address) */}
            <section
              className={`checkout-step-box ${currentStep === 1 ? 'is-active' : ''} ${currentStep > 1 ? 'is-completed' : ''}`}
              aria-labelledby="step1-heading"
            >
              <div className="step-header">
                <span className="step-number-badge">
                  {currentStep > 1 ? <Check size={14} /> : '1'}
                </span>
                <h2 id="step1-heading" className="step-heading">
                  Contact & Delivery Address
                </h2>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="step-edit-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    Edit
                  </button>
                )}
              </div>

              {currentStep > 1 ? (
                <div className="step-summary-content">
                  <p><strong>{formData.fullName}</strong> · {formData.email}</p>
                  <p>{formData.address}, {formData.city}, {formData.state} — {formData.postalCode}</p>
                  <p>Mobile: +91 {formData.phone}</p>
                </div>
              ) : (
                <form onSubmit={handleContinueToShipping} className="step-form" noValidate>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="fullName" className="form-label">
                        Full Legal Name *
                      </label>
                      <input
                        ref={fieldRefs.fullName}
                        id="fullName"
                        name="fullName"
                        type="text"
                        className={`form-input ${errors.fullName ? 'has-error' : ''}`}
                        placeholder="e.g. Astrid Lindgren"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                        required
                      />
                      {errors.fullName && (
                        <span id="fullName-error" className="form-error">
                          <AlertCircle size={13} /> {errors.fullName}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address *
                      </label>
                      <input
                        ref={fieldRefs.email}
                        id="email"
                        name="email"
                        type="email"
                        className={`form-input ${errors.email ? 'has-error' : ''}`}
                        placeholder="astrid@atelier-nord.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        required
                      />
                      {errors.email && (
                        <span id="email-error" className="form-error">
                          <AlertCircle size={13} /> {errors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Mobile Number (10 digits) *
                    </label>
                    <input
                      ref={fieldRefs.phone}
                      id="phone"
                      name="phone"
                      type="tel"
                      className={`form-input ${errors.phone ? 'has-error' : ''}`}
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      required
                    />
                    {errors.phone && (
                      <span id="phone-error" className="form-error">
                        <AlertCircle size={13} /> {errors.phone}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">
                      Street Address & Flat / Suite *
                    </label>
                    <input
                      ref={fieldRefs.address}
                      id="address"
                      name="address"
                      type="text"
                      className={`form-input ${errors.address ? 'has-error' : ''}`}
                      placeholder="e.g. 42 Strandvägen, Apartment 4B"
                      value={formData.address}
                      onChange={handleInputChange}
                      aria-invalid={!!errors.address}
                      aria-describedby={errors.address ? 'address-error' : undefined}
                      required
                    />
                    {errors.address && (
                      <span id="address-error" className="form-error">
                        <AlertCircle size={13} /> {errors.address}
                      </span>
                    )}
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label htmlFor="city" className="form-label">
                        City *
                      </label>
                      <input
                        ref={fieldRefs.city}
                        id="city"
                        name="city"
                        type="text"
                        className={`form-input ${errors.city ? 'has-error' : ''}`}
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.city}
                        aria-describedby={errors.city ? 'city-error' : undefined}
                        required
                      />
                      {errors.city && (
                        <span id="city-error" className="form-error">
                          <AlertCircle size={13} /> {errors.city}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="state" className="form-label">
                        State / Region *
                      </label>
                      <input
                        ref={fieldRefs.state}
                        id="state"
                        name="state"
                        type="text"
                        className={`form-input ${errors.state ? 'has-error' : ''}`}
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.state}
                        aria-describedby={errors.state ? 'state-error' : undefined}
                        required
                      />
                      {errors.state && (
                        <span id="state-error" className="form-error">
                          <AlertCircle size={13} /> {errors.state}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="postalCode" className="form-label">
                        Postal PIN Code (6 digits) *
                      </label>
                      <input
                        ref={fieldRefs.postalCode}
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        className={`form-input ${errors.postalCode ? 'has-error' : ''}`}
                        placeholder="400001"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.postalCode}
                        aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
                        required
                      />
                      {errors.postalCode && (
                        <span id="postalCode-error" className="form-error">
                          <AlertCircle size={13} /> {errors.postalCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="step-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      data-testid="checkout-continue-1"
                    >
                      Continue to Shipping <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* STEP 2: Shipping Method */}
            <section
              className={`checkout-step-box ${currentStep === 2 ? 'is-active' : ''} ${currentStep > 2 ? 'is-completed' : ''} ${currentStep < 2 ? 'is-disabled' : ''}`}
              aria-labelledby="step2-heading"
            >
              <div className="step-header">
                <span className="step-number-badge">
                  {currentStep > 2 ? <Check size={14} /> : '2'}
                </span>
                <h2 id="step2-heading" className="step-heading">
                  Shipping Method
                </h2>
                {currentStep > 2 && (
                  <button
                    type="button"
                    className="step-edit-btn"
                    onClick={() => setCurrentStep(2)}
                  >
                    Edit
                  </button>
                )}
              </div>

              {currentStep === 2 ? (
                <form onSubmit={handleContinueToPayment} className="step-form">
                  <div className="shipping-options-list" role="radiogroup">
                    <label
                      className={`shipping-option-card ${shippingMethod === 'standard' ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="shippingOption"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="sr-only"
                      />
                      <div className="shipping-option-icon">
                        <Truck size={20} />
                      </div>
                      <div className="shipping-option-details">
                        <span className="shipping-option-name">Standard Delivery</span>
                        <span className="shipping-option-time">3 to 5 business days</span>
                        {hasFreeShipping && (
                          <span className="shipping-perk-badge">Complimentary Shipping</span>
                        )}
                      </div>
                      <span className="shipping-option-price">
                        {hasFreeShipping ? 'FREE' : formatPrice(99)}
                      </span>
                    </label>

                    <label
                      className={`shipping-option-card ${shippingMethod === 'express' ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="shippingOption"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="sr-only"
                      />
                      <div className="shipping-option-icon">
                        <Clock size={20} />
                      </div>
                      <div className="shipping-option-details">
                        <span className="shipping-option-name">Express Priority Delivery</span>
                        <span className="shipping-option-time">1 to 2 business days</span>
                      </div>
                      <span className="shipping-option-price">
                        {formatPrice(199)}
                      </span>
                    </label>
                  </div>

                  <div className="step-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back to Address
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      data-testid="checkout-continue-2"
                    >
                      Continue to Payment <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              ) : currentStep > 2 ? (
                <div className="step-summary-content">
                  <p>
                    <strong>
                      {shippingMethod === 'express' ? 'Express Priority Delivery' : 'Standard Delivery'}
                    </strong>{' '}
                    — {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </p>
                </div>
              ) : null}
            </section>

            {/* STEP 3: Payment Method */}
            <section
              className={`checkout-step-box ${currentStep === 3 ? 'is-active' : ''} ${currentStep > 3 ? 'is-completed' : ''} ${currentStep < 3 ? 'is-disabled' : ''}`}
              aria-labelledby="step3-heading"
            >
              <div className="step-header">
                <span className="step-number-badge">
                  {currentStep > 3 ? <Check size={14} /> : '3'}
                </span>
                <h2 id="step3-heading" className="step-heading">
                  Payment Method
                </h2>
                {currentStep > 3 && (
                  <button
                    type="button"
                    className="step-edit-btn"
                    onClick={() => setCurrentStep(3)}
                  >
                    Edit
                  </button>
                )}
              </div>

              {currentStep === 3 ? (
                <form onSubmit={handleContinueToReview} className="step-form">
                  <div className="payment-options-list" role="radiogroup">
                    <label
                      className={`payment-option-card ${formData.paymentMethod === 'Card' ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Card"
                        checked={formData.paymentMethod === 'Card'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="payment-option-icon">
                        <CreditCard size={20} />
                      </div>
                      <div className="payment-option-content">
                        <strong>Credit / Debit Card (Simulated)</strong>
                        <p>Simulates Visa, Mastercard, RuPay & Amex instant authorization without charging real funds.</p>
                      </div>
                    </label>

                    <label
                      className={`payment-option-card ${formData.paymentMethod === 'UPI' ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={formData.paymentMethod === 'UPI'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="payment-option-icon">
                        <QrCode size={20} />
                      </div>
                      <div className="payment-option-content">
                        <strong>UPI / NetBanking (Simulated)</strong>
                        <p>Simulates Google Pay, PhonePe, Paytm, BHIM and instant online bank authorization.</p>
                      </div>
                    </label>

                    <label
                      className={`payment-option-card ${formData.paymentMethod === 'COD' ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="payment-option-icon">
                        <Banknote size={20} />
                      </div>
                      <div className="payment-option-content">
                        <strong>Cash on Delivery (COD)</strong>
                        <p>Pay cash or scan courier UPI QR code upon parcel arrival at your doorstep.</p>
                      </div>
                    </label>
                  </div>

                  <div className="step-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(2)}
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      data-testid="checkout-continue-3"
                    >
                      Continue to Review <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              ) : currentStep > 3 ? (
                <div className="step-summary-content">
                  <p>
                    <strong>{formData.paymentMethod}</strong> (Simulated)
                  </p>
                </div>
              ) : null}
            </section>

            {/* STEP 4: Review & Place Order */}
            <section
              className={`checkout-step-box ${currentStep === 4 ? 'is-active' : ''} ${currentStep < 4 ? 'is-disabled' : ''}`}
              aria-labelledby="step4-heading"
            >
              <div className="step-header">
                <span className="step-number-badge">4</span>
                <h2 id="step4-heading" className="step-heading">
                  Review & Confirm Order
                </h2>
              </div>

              {currentStep === 4 && (
                <div className="step-review-body">
                  <div className="review-cards-grid">
                    <div className="review-card">
                      <div className="review-card-head">
                        <h4>Contact & Shipping Address</h4>
                        <button
                          type="button"
                          className="step-edit-btn"
                          onClick={() => setCurrentStep(1)}
                        >
                          Change
                        </button>
                      </div>
                      <p className="review-card-text">
                        <strong>{formData.fullName}</strong>
                        <br />
                        {formData.address}, {formData.city}, {formData.state} — {formData.postalCode}
                        <br />
                        Email: {formData.email}
                        <br />
                        Phone: +91 {formData.phone}
                      </p>
                    </div>

                    <div className="review-card">
                      <div className="review-card-head">
                        <h4>Shipping & Payment</h4>
                        <button
                          type="button"
                          className="step-edit-btn"
                          onClick={() => setCurrentStep(3)}
                        >
                          Change
                        </button>
                      </div>
                      <p className="review-card-text">
                        <strong>Shipping:</strong>{' '}
                        {shippingMethod === 'express' ? 'Express Priority Delivery (1-2 days)' : 'Standard Delivery (3-5 days)'} ({shipping === 0 ? 'FREE' : formatPrice(shipping)})
                        <br />
                        <strong>Payment:</strong> {formData.paymentMethod} (Simulated)
                      </p>
                    </div>
                  </div>

                  <div className="review-items-box">
                    <h4>Bag Items ({itemCount})</h4>
                    <div className="review-items-list">
                      {items.map((item) => (
                        <div key={item.lineKey} className="review-item-row">
                          <div className="review-item-thumb">
                            <FallbackImage
                              src={item.image}
                              alt={item.name}
                              productName={item.name}
                              aspectRatio="4/5"
                              className="review-thumb-img"
                            />
                          </div>
                          <div className="review-item-info">
                            <h5>{item.name}</h5>
                            {(item.size || item.color) && (
                              <p className="review-item-variant">
                                {[item.size, item.color].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            <p className="review-item-qty">
                              Quantity: {item.quantity} × {formatPrice(item.unitPrice)}
                            </p>
                          </div>
                          <div className="review-item-price">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="review-coupon-wrapper">
                    <CouponInput />
                  </div>

                  <div className="review-final-bar">
                    <div className="review-total-glance">
                      <span className="total-glance-label">Total to be authorized:</span>
                      <strong className="total-glance-amount">{formatPrice(total)}</strong>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary place-order-btn"
                      disabled={isSubmitting}
                      onClick={handlePlaceOrder}
                      data-testid="place-order"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="spinner-icon" /> Placing Order...
                        </>
                      ) : (
                        <>
                          Complete Order ({formatPrice(total)}) <PackageCheck size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sticky Summary & Breakdown */}
          <aside className="checkout-summary-column" aria-label="Order Summary">
            <div className="checkout-summary-card">
              <h3 className="checkout-summary-title">
                Order Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </h3>

              {/* Items Mini Preview */}
              <div className="checkout-items-preview">
                {items.map((item) => (
                  <div key={item.lineKey} className="checkout-item-row">
                    <div className="checkout-item-thumbnail">
                      <FallbackImage
                        src={item.image}
                        alt={item.name}
                        productName={item.name}
                        aspectRatio="1/1"
                        className="item-preview-img"
                      />
                      <span className="item-preview-qty">{item.quantity}</span>
                    </div>

                    <div className="checkout-item-info">
                      <h4 className="checkout-item-name">{item.name}</h4>
                      {(item.size || item.color) && (
                        <p className="checkout-item-variant">
                          {[item.size, item.color].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="checkout-item-price">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="checkout-totals-breakdown">
                <div className="summary-calc-row">
                  <span>Items Subtotal</span>
                  <span>{formatPrice(itemsSubtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="summary-calc-row discount-row">
                    <span>Coupon ({couponCode})</span>
                    <span>−{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="summary-calc-row">
                    <span>Discounted Subtotal</span>
                    <span>{formatPrice(discountedSubtotal)}</span>
                  </div>
                )}

                <div className="summary-calc-row">
                  <span>
                    Shipping ({shippingMethod === 'express' ? 'Express' : 'Standard'})
                  </span>
                  <span>
                    {shipping === 0 ? (
                      <span className="free-shipping-tag">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="summary-calc-row">
                  <span>GST (5%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <div className="summary-calc-divider" />

                <div className="summary-calc-row summary-final-total">
                  <span>Total Amount</span>
                  <span>{formatPrice(total)}</span>
                </div>

                {productSavings > 0 && (
                  <div className="product-savings-note">
                    <Sparkles size={14} /> Total savings of {formatPrice(productSavings + couponDiscount)} on this order
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
