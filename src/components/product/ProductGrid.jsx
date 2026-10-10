import React, { useEffect } from 'react';
import ProductCard from './ProductCard.jsx';
import { trackViewItemList } from '../../analytics/dataLayer.js';
import './ProductGrid.css';

export function ProductGrid({ products = [], columns = 4, className = '', listId, listName }) {
  useEffect(() => {
    if (listId && products.length > 0) trackViewItemList(products, listId, listName);
  }, [products, listId, listName]);

  if (!products || products.length === 0) {
    return (
      <div className="product-grid-empty">
        <p>No products available matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className={`product-grid columns-${columns} ${className}`}>
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i + 1}
          listId={listId}
          listName={listName}
        />
      ))}
    </div>
  );
}

export default ProductGrid;

