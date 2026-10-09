import React from 'react';
import ProductCard from './ProductCard.jsx';
import './ProductGrid.css';

export function ProductGrid({ products = [], columns = 4, className = '' }) {
  if (!products || products.length === 0) {
    return (
      <div className="product-grid-empty">
        <p>No products available matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className={`product-grid columns-${columns} ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;

