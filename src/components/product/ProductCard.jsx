import React from 'react';
import { Link } from 'react-router-dom';
import { FallbackImage } from '../common/FallbackImage.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { getFinalUnitPrice } from '../../utils/pricing.js';
import { trackSelectItem } from '../../analytics/dataLayer.js';
import './ProductCard.css';

export function ProductCard({ product, showCategory = true, index, listId, listName }) {
  if (!product) return null;

  const finalPrice = getFinalUnitPrice(product);
  const hasDiscount = product.discount > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <article
      className="product-card"
      data-testid={`product-card-${product.id}`}
    >
      <Link
        to={`/product/${product.id}`}
        className="product-card-link"
        onClick={() => { if (listId) trackSelectItem(product, index, listId, listName); }}
      >
        <div className="product-card-media">
          <FallbackImage
            src={product.image}
            alt={product.alt || product.name}
            aspectRatio="4/5"
            className="product-card-image"
          />

          {/* Badges Overlay */}
          <div className="product-card-badges">
            {hasDiscount && (
              <span className="badge badge-sale">Sale</span>
            )}
            {product.tags?.includes('bestseller') && !hasDiscount && (
              <span className="badge badge-bestseller">Bestseller</span>
            )}
            {product.tags?.includes('new') && !hasDiscount && !product.tags?.includes('bestseller') && (
              <span className="badge badge-new">New</span>
            )}
            {isLowStock && (
              <span className="badge badge-low-stock">Only {product.stock} left</span>
            )}
          </div>
        </div>

        <div className="product-card-details">
          {showCategory && (
            <span className="product-card-category">
              {product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}
            </span>
          )}
          <h3 className="product-card-title">{product.name}</h3>

          <div className="product-card-pricing">
            <span className="product-card-price final-price">
              {formatPrice(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="product-card-price original-price">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="product-card-savings">
              Save {formatPrice(product.discount)}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
