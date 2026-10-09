import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { FallbackImage } from '../common/FallbackImage.jsx';
import { QuantitySelector } from '../product/QuantitySelector.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { getLineTotal } from '../../utils/pricing.js';
import './CartItem.css';

export function CartItem({ item, onUpdateQuantity, onRemove }) {
  if (!item) return null;

  const lineTotal = getLineTotal(item.unitPrice, item.quantity);
  const maxStock = Math.min(item.stock || 10, 10);

  return (
    <div className="cart-item">
      {/* Thumbnail */}
      <Link to={`/product/${item.productId}`} className="cart-item-image-link">
        <FallbackImage
          src={item.image}
          alt={item.name}
          productName={item.name}
          aspectRatio="3/4"
          className="cart-item-image"
        />
      </Link>

      {/* Content */}
      <div className="cart-item-info">
        <div className="cart-item-header">
          <div>
            <span className="cart-item-category">{item.category}</span>
            <h3 className="cart-item-title">
              <Link to={`/product/${item.productId}`}>{item.name}</Link>
            </h3>
          </div>

          <button
            type="button"
            className="cart-item-remove-btn"
            onClick={() => onRemove(item.lineKey)}
            data-testid="cart-remove"
            aria-label={`Remove ${item.name} from bag`}
          >
            <Trash2 size={16} />
            <span className="remove-text">Remove</span>
          </button>
        </div>

        {/* Variants */}
        <div className="cart-item-variants">
          {item.size && (
            <span className="variant-tag">
              Size: <strong>{item.size}</strong>
            </span>
          )}
          {item.color && (
            <span className="variant-tag">
              Color: <strong>{item.color}</strong>
            </span>
          )}
        </div>

        {/* Price & Quantity Footer */}
        <div className="cart-item-footer">
          <div className="cart-item-qty-wrap">
            <span className="qty-label">Quantity</span>
            <QuantitySelector
              quantity={item.quantity}
              onChange={(newQty) => onUpdateQuantity(item.lineKey, newQty)}
              max={maxStock}
              min={1}
              size="sm"
              increaseTestId="cart-increase"
              decreaseTestId="cart-decrease"
            />
          </div>

          <div className="cart-item-prices">
            <span className="cart-item-unit-price">
              {formatPrice(item.unitPrice)} each
            </span>
            <span className="cart-item-line-total">
              {formatPrice(lineTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;

