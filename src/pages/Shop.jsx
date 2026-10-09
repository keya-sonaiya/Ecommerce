import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search as SearchIcon,
  Percent,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { products } from '../data/products.js';
import { categories } from '../data/categories.js';
import { getFinalUnitPrice } from '../utils/pricing.js';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './Shop.css';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query Parameters (Single Source of Truth)
  const categoryParam = searchParams.get('category') || '';
  const saleParam = searchParams.get('sale') === '1';
  const queryParam = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'featured';
  const priceParam = searchParams.get('price') || 'all';

  // Local state for instant typing in search input
  const [searchInput, setSearchInput] = useState(queryParam);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync search input with URL query param
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  // Close mobile filter drawer if user resizes to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 860) {
        setIsMobileFiltersOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Validate category slug
  const matchedCategory = useMemo(() => {
    if (!categoryParam) return null;
    return categories.find((c) => c.slug.toLowerCase() === categoryParam.toLowerCase()) || null;
  }, [categoryParam]);

  const isInvalidCategory = Boolean(categoryParam && !matchedCategory);

  // Dynamic Page Title
  const pageTitle = useMemo(() => {
    if (isInvalidCategory) return 'All Pieces';
    if (matchedCategory) return matchedCategory.name;
    if (saleParam) return 'Seasonal Reductions';
    if (queryParam) return `Search: "${queryParam}"`;
    return 'The Collection';
  }, [matchedCategory, saleParam, queryParam, isInvalidCategory]);

  useDocumentTitle(`${pageTitle} — Atelier Nord`);

  // Filtered & Sorted Product List
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Category Filter (?category=slug)
    if (matchedCategory) {
      list = list.filter(
        (p) => p.category.toLowerCase() === matchedCategory.name.toLowerCase()
      );
    }

    // 2. Sale Filter (?sale=1)
    if (saleParam) {
      list = list.filter((p) => Number(p.discount) > 0);
    }

    // 3. Keyword Search (?q=) across name, category, and subcategory
    if (queryParam.trim()) {
      const term = queryParam.trim().toLowerCase();
      list = list.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(term);
        const catMatch = p.category.toLowerCase().includes(term);
        const subMatch = (p.subcategory || '').toLowerCase().includes(term);
        return nameMatch || catMatch || subMatch;
      });
    }

    // 4. Price Range Filter
    if (priceParam === 'under-1500') {
      list = list.filter((p) => getFinalUnitPrice(p) < 1500);
    } else if (priceParam === '1500-3000') {
      list = list.filter((p) => {
        const price = getFinalUnitPrice(p);
        return price >= 1500 && price <= 3000;
      });
    } else if (priceParam === 'above-3000') {
      list = list.filter((p) => getFinalUnitPrice(p) > 3000);
    }

    // 5. Sorting
    switch (sortParam) {
      case 'price-asc':
        list.sort((a, b) => getFinalUnitPrice(a) - getFinalUnitPrice(b));
        break;
      case 'price-desc':
        list.sort((a, b) => getFinalUnitPrice(b) - getFinalUnitPrice(a));
        break;
      case 'discount-desc':
        list.sort((a, b) => (Number(b.discount) || 0) - (Number(a.discount) || 0));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'featured':
      default:
        list.sort((a, b) => {
          const aFeat = a.tags?.includes('featured') ? 1 : 0;
          const bFeat = b.tags?.includes('featured') ? 1 : 0;
          return bFeat - aFeat;
        });
        break;
    }

    return list;
  }, [matchedCategory, saleParam, queryParam, priceParam, sortParam]);

  // Update query params helper
  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'featured') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('q', searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    categoryParam || saleParam || queryParam || (priceParam && priceParam !== 'all')
  );

  const getPriceLabel = (val) => {
    if (val === 'under-1500') return 'Under ₹1,500';
    if (val === '1500-3000') return '₹1,500 – ₹3,000';
    if (val === 'above-3000') return 'Above ₹3,000';
    return '';
  };

  return (
    <div className="shop-page section-spacing">
      <div className="container">
        {/* Page Header */}
        <div className="shop-header">
          <span className="section-eyebrow">Atelier Nord Archive</span>
          <h1 className="shop-title">{pageTitle}</h1>
          <p className="shop-description">
            {matchedCategory
              ? matchedCategory.description
              : saleParam
              ? 'Seasonal reductions across essential and tailored pieces in limited studio quantities.'
              : 'Explore conscious design, architectural proportions, and timeless Scandinavian craftsmanship.'}
          </p>
        </div>

        {/* Invalid Category Notice Banner */}
        {isInvalidCategory && (
          <div className="invalid-category-notice" role="alert">
            <AlertCircle size={16} />
            <span>
              Category <em>"{categoryParam}"</em> was not found. Showing all pieces in our collection.
            </span>
            <button
              type="button"
              className="clear-invalid-cat-btn"
              onClick={() => updateParam('category', '')}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Toolbar: Search input, count, sorting */}
        <div className="shop-toolbar">
          <div className="shop-toolbar-left">
            {/* Mobile-only filter button */}
            <button
              type="button"
              className="btn btn-secondary filter-toggle-btn"
              onClick={() => setIsMobileFiltersOpen(true)}
              aria-label="Open filter menu"
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {hasActiveFilters && <span className="filter-active-dot" />}
            </button>

            {/* Search Input with SINGLE custom clear button (type="text" prevents duplicate native cross) */}
            <form onSubmit={handleSearchSubmit} className="shop-search-form" role="search">
              <SearchIcon size={16} className="shop-search-icon" aria-hidden="true" />
              <input
                type="text"
                role="searchbox"
                className="shop-search-input"
                placeholder="Search pieces..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                data-testid="search-input"
                aria-label="Search catalog"
              />
              {(searchInput || queryParam) && (
                <button
                  type="button"
                  className="shop-search-clear"
                  onClick={() => {
                    setSearchInput('');
                    updateParam('q', '');
                  }}
                  aria-label="Clear search query"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            <span className="results-count">
              Showing <strong>{filteredProducts.length}</strong>{' '}
              {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>

          <div className="shop-toolbar-right">
            <label htmlFor="shop-sort" className="sort-label">Sort:</label>
            <select
              id="shop-sort"
              className="form-select sort-select"
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              aria-label="Sort products"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount-desc">Biggest Discount</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="active-filters-chips-bar" aria-label="Active Filters">
            <span className="active-chips-label">Active:</span>

            {matchedCategory && (
              <button
                type="button"
                className="filter-chip"
                onClick={() => updateParam('category', '')}
                title="Remove department filter"
              >
                <span>Department: {matchedCategory.name}</span>
                <X size={12} />
              </button>
            )}

            {saleParam && (
              <button
                type="button"
                className="filter-chip chip-sale"
                onClick={() => updateParam('sale', '')}
                title="Remove sale filter"
              >
                <span>On Sale</span>
                <X size={12} />
              </button>
            )}

            {priceParam && priceParam !== 'all' && (
              <button
                type="button"
                className="filter-chip"
                onClick={() => updateParam('price', 'all')}
                title="Remove price filter"
              >
                <span>{getPriceLabel(priceParam)}</span>
                <X size={12} />
              </button>
            )}

            {queryParam && (
              <button
                type="button"
                className="filter-chip"
                onClick={() => {
                  setSearchInput('');
                  updateParam('q', '');
                }}
                title="Remove search filter"
              >
                <span>Search: "{queryParam}"</span>
                <X size={12} />
              </button>
            )}

            <button
              type="button"
              className="clear-all-chips-btn"
              onClick={handleClearFilters}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="shop-layout">
          {/* Desktop Filter Sidebar - The ONLY filter panel on desktop */}
          <aside className="shop-sidebar" aria-label="Desktop Filters">
            {/* Department Filter */}
            <div className="filter-group">
              <h4 className="filter-title">Department</h4>
              <ul className="filter-list">
                <li>
                  <button
                    type="button"
                    className={`filter-btn ${!categoryParam ? 'active' : ''}`}
                    onClick={() => updateParam('category', '')}
                  >
                    All Collections
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      type="button"
                      className={`filter-btn ${
                        categoryParam.toLowerCase() === cat.slug.toLowerCase() ? 'active' : ''
                      }`}
                      onClick={() => updateParam('category', cat.slug)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sale Filter Toggle */}
            <div className="filter-group">
              <h4 className="filter-title">Promotions</h4>
              <label className="sale-filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={saleParam}
                  onChange={(e) => updateParam('sale', e.target.checked ? '1' : '')}
                  className="sale-checkbox"
                />
                <span className="sale-filter-text">
                  <Percent size={13} className="sale-checkbox-icon" /> On Sale Only
                </span>
              </label>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h4 className="filter-title">Price Range</h4>
              <ul className="filter-list">
                {[
                  { label: 'All Prices', value: 'all' },
                  { label: 'Under ₹1,500', value: 'under-1500' },
                  { label: '₹1,500 to ₹3,000', value: '1500-3000' },
                  { label: 'Above ₹3,000', value: 'above-3000' },
                ].map((item) => (
                  <li key={item.value}>
                    <button
                      type="button"
                      className={`filter-btn ${priceParam === item.value ? 'active' : ''}`}
                      onClick={() => updateParam('price', item.value)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clear Filters Button in Sidebar */}
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-outline btn-full clear-filters-btn"
                onClick={handleClearFilters}
              >
                <RotateCcw size={13} /> Reset Filters
              </button>
            )}
          </aside>

          {/* Product Grid Area */}
          <div className="shop-grid-area">
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} columns={3} />
            ) : (
              <div className="empty-results-state">
                <h3 className="empty-title">No matching pieces found</h3>
                <p className="empty-text">
                  We could not find pieces matching your active combination of filters, search query, or price criteria.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleClearFilters}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer - ONLY rendered and shown on mobile/small screens */}
        {isMobileFiltersOpen && (
          <div className="mobile-filter-overlay" onClick={() => setIsMobileFiltersOpen(false)}>
            <div
              className="mobile-filter-drawer"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Filter Options"
            >
              <div className="mobile-filter-header">
                <h3>Filter Pieces</h3>
                <button
                  type="button"
                  className="filter-close-btn"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mobile-filter-body">
                <div className="filter-group">
                  <h4 className="filter-title">Department</h4>
                  <div className="filter-pills">
                    <button
                      type="button"
                      className={`filter-pill ${!categoryParam ? 'active' : ''}`}
                      onClick={() => updateParam('category', '')}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        className={`filter-pill ${
                          categoryParam.toLowerCase() === cat.slug.toLowerCase() ? 'active' : ''
                        }`}
                        onClick={() => updateParam('category', cat.slug)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4 className="filter-title">Promotions</h4>
                  <button
                    type="button"
                    className={`filter-pill ${saleParam ? 'active' : ''}`}
                    onClick={() => updateParam('sale', saleParam ? '' : '1')}
                  >
                    On Sale Only
                  </button>
                </div>

                <div className="filter-group">
                  <h4 className="filter-title">Price Range</h4>
                  <div className="filter-pills">
                    {[
                      { label: 'All', value: 'all' },
                      { label: 'Under ₹1,500', value: 'under-1500' },
                      { label: '₹1,500 – ₹3,000', value: '1500-3000' },
                      { label: 'Above ₹3,000', value: 'above-3000' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className={`filter-pill ${priceParam === item.value ? 'active' : ''}`}
                        onClick={() => updateParam('price', item.value)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mobile-filter-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClearFilters}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  Show Results ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;
