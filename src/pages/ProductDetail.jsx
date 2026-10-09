import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ShieldCheck, Truck, RefreshCw, AlertCircle, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { getProductById, getProductsByCategory } from '../data/products.js';
import { categories } from '../data/categories.js';
import { FallbackImage } from '../components/common/FallbackImage.jsx';
import { QuantitySelector } from '../components/product/QuantitySelector.jsx';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { getFinalUnitPrice } from '../utils/pricing.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './ProductDetail.css';

export function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id);
  const { addToCart } = useCart();

  // Document Title
  useDocumentTitle(product ? product.name : 'Piece Not Found');

  // Local Component State
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [addedSuccessMessage, setAddedSuccessMessage] = useState('');
  const [activeAccordion, setActiveAccordion] = useState('notes');

  // Reset selections when viewing a different product
  useEffect(() => {
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
    setValidationError('');
    setAddedSuccessMessage('');
  }, [id]);

  // If product not found
  if (!product) {
    return (
      <div className="product-not-found section-spacing">
        <div className="container text-center">
          <span className="section-eyebrow">Catalog Notice</span>
          <h2>Piece Not Found</h2>
          <p className="not-found-text">
            We could not locate this design in our current collection catalog.
            The reference ID may be archived or altered.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Explore All Collections
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = getFinalUnitPrice(product);
  const hasDiscount = product.discount > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const maxStock = Math.min(product.stock, 10);

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
  const hasColors = Array.isArray(product.colors) && product.colors.length > 0;

  // Category slug
  const catObj = categories.find((c) => c.name.toLowerCase() === product.category.toLowerCase());
  const categorySlug = catObj ? catObj.slug : '';

  // Related products (same category, excluding current product)
  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    setValidationError('');
    setAddedSuccessMessage('');

    // Validate size if product has sizes
    if (hasSizes && !selectedSize) {
      setValidationError('Please select a size before adding to your bag.');
      return;
    }

    // Validate color if product has colors
    if (hasColors && !selectedColor) {
      setValidationError('Please select a colour before adding to your bag.');
      return;
    }

    // Add to cart via central context action
    addToCart(product, selectedSize, selectedColor, quantity);

    // Show accessible confirmation message
    const variantDesc = [selectedSize, selectedColor].filter(Boolean).join(' / ');
    setAddedSuccessMessage(
      `Added ${quantity} × ${product.name} ${variantDesc ? `(${variantDesc})` : ''} to your bag.`
    );

    // Auto-clear message after 5 seconds
    setTimeout(() => {
      setAddedSuccessMessage('');
    }, 5000);
  };

  const toggleAccordion = (key) => {
    setActiveAccordion(activeAccordion === key ? null : key);
  };

  return (
    <div className="product-detail-page section-spacing">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link to="/shop" className="breadcrumb-link">
            <ArrowLeft size={14} /> Catalog
          </Link>
          <span className="breadcrumb-separator">/</span>
          {categorySlug ? (
            <Link to={`/shop?category=${categorySlug}`} className="breadcrumb-link">
              {product.category}
            </Link>
          ) : (
            <span>{product.category}</span>
          )}
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="product-hero-grid">
          {/* Main Visual Column */}
          <div className="product-visual-col">
            <div className="product-image-frame">
              <FallbackImage
                src={product.image}
                alt={product.alt || product.name}
                aspectRatio="4/5"
                className="product-main-image"
                loading="eager"
              />

              {/* Badges */}
              <div className="product-detail-badges">
                {hasDiscount && (
                  <span className="badge badge-sale">Save {formatPrice(product.discount)}</span>
                )}
                {product.tags?.includes('bestseller') && !hasDiscount && (
                  <span className="badge badge-bestseller">Bestseller</span>
                )}
                {product.tags?.includes('new') && !hasDiscount && (
                  <span className="badge badge-new">New Release</span>
                )}
              </div>
            </div>
          </div>

          {/* Product Purchasing Info Column */}
          <div className="product-info-col">
            <span className="detail-category">
              {product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}
            </span>
            <h1 className="detail-title">{product.name}</h1>

            {/* Pricing Section */}
            <div className="detail-pricing">
              <span className="detail-final-price">
                {formatPrice(finalPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="detail-original-price">
                    {formatPrice(product.price)}
                  </span>
                  <span className="detail-discount-tag">
                    Save {formatPrice(product.discount)}
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="detail-short-desc">{product.shortDescription}</p>

            {/* Stock Availability Indicator */}
            <div className="stock-status-row">
              {isLowStock ? (
                <span className="stock-pill low-stock">
                  <span className="stock-dot dot-low" /> Only {product.stock} pieces remaining in studio
                </span>
              ) : (
                <span className="stock-pill in-stock">
                  <span className="stock-dot dot-in" /> In stock — ready to dispatch
                </span>
              )}
            </div>

            {/* Size Selector */}
            {hasSizes && (
              <div className="variant-section">
                <div className="variant-header">
                  <label className="variant-label">Select Size</label>
                  {selectedSize && <span className="selected-variant-val">{selectedSize}</span>}
                </div>
                <div className="size-options-grid" role="radiogroup" aria-label="Available sizes">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      role="radio"
                      aria-checked={selectedSize === size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSize(size);
                        setValidationError('');
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {hasColors && (
              <div className="variant-section">
                <div className="variant-header">
                  <label className="variant-label">Select Colour</label>
                  {selectedColor && <span className="selected-variant-val">{selectedColor}</span>}
                </div>
                <div className="color-options-flex" role="radiogroup" aria-label="Available colours">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      role="radio"
                      aria-checked={selectedColor === color}
                      className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedColor(color);
                        setValidationError('');
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="quantity-section">
              <label className="variant-label">Quantity</label>
              <QuantitySelector
                quantity={quantity}
                onChange={(val) => setQuantity(val)}
                min={1}
                max={maxStock}
              />
            </div>

            {/* Inline Validation Error Message */}
            {validationError && (
              <div className="validation-error-alert" role="alert">
                <AlertCircle size={16} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Accessible Confirmation Toast Banner */}
            <div
              className={`add-success-banner ${addedSuccessMessage ? 'visible' : ''}`}
              aria-live="polite"
              role="status"
            >
              {addedSuccessMessage && (
                <>
                  <Check size={18} />
                  <span>{addedSuccessMessage}</span>
                  <Link to="/cart" className="view-bag-link">
                    View Bag
                  </Link>
                </>
              )}
            </div>

            {/* Add to Bag CTA Button */}
            <div className="cta-action-area">
              <button
                type="button"
                className="btn btn-primary btn-full add-to-bag-btn"
                onClick={handleAddToCart}
                data-testid="add-to-bag"
              >
                Add to Bag — {formatPrice(finalPrice * quantity)}
              </button>
            </div>

            {/* Delivery & Care Guarantees */}
            <div className="product-perks">
              <div className="perk-row">
                <Truck size={18} className="perk-icon" />
                <div>
                  <strong>Complimentary Standard Delivery</strong>
                  <p>On domestic orders above ₹2,999. Express priority options available at checkout.</p>
                </div>
              </div>
              <div className="perk-row">
                <RefreshCw size={18} className="perk-icon" />
                <div>
                  <strong>14-Day Studio Returns</strong>
                  <p>Unworn garments may be exchanged or returned within 14 days of delivery.</p>
                </div>
              </div>
              <div className="perk-row">
                <ShieldCheck size={18} className="perk-icon" />
                <div>
                  <strong>Ethical Nordic Production</strong>
                  <p>Crafted from certified organic natural textiles with reinforced French seam construction.</p>
                </div>
              </div>
            </div>

            {/* Accordion: Description & Care */}
            <div className="product-accordions">
              <div className="accordion-item">
                <button
                  type="button"
                  className="accordion-header"
                  onClick={() => toggleAccordion('notes')}
                  aria-expanded={activeAccordion === 'notes'}
                >
                  <span>Design Notes</span>
                  {activeAccordion === 'notes' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion === 'notes' && (
                  <div className="accordion-content">
                    <p>{product.description}</p>
                  </div>
                )}
              </div>

              <div className="accordion-item">
                <button
                  type="button"
                  className="accordion-header"
                  onClick={() => toggleAccordion('care')}
                  aria-expanded={activeAccordion === 'care'}
                >
                  <span>Fabric & Care Instructions</span>
                  {activeAccordion === 'care' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion === 'care' && (
                  <div className="accordion-content">
                    <p>
                      Machine wash gentle at 30°C with eco-friendly detergent or dry clean when recommended. Reshape while damp and dry flat in the shade. Cool iron on reverse. Do not tumble dry or bleach.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section" aria-label="Complementary Pieces">
            <div className="section-header">
              <span className="section-eyebrow">Complementary Pieces</span>
              <h2 className="section-title">Complete The Look</h2>
            </div>
            <ProductGrid products={relatedProducts} columns={4} />
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
