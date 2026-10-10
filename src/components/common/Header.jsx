import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { categories } from '../../data/categories.js';
import { trackSearch, trackClickCta } from '../../analytics/dataLayer.js';
import './Header.css';

export function Header() {
  const { itemCount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsCategoriesOpen(false);
  }, [location.pathname, location.search]);

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
        setIsCategoriesOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCategoriesOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      trackSearch(query);
      navigate(`/shop?q=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isCategoryActive = location.pathname === '/shop' && location.search.includes('category=');
  const isSaleActive = location.pathname === '/shop' && location.search.includes('sale=1');
  const isShopActive = location.pathname === '/shop' && !isCategoryActive && !isSaleActive;

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="header-left">
          <button
            type="button"
            className="header-icon-btn mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="brand-logo" aria-label="Atelier Nord Home">
            <span className="brand-text">ATELIER NORD</span>
          </Link>
        </div>

        {/* Center: Streamlined Minimalist Navigation (Clean 4 options) */}
        <nav className="desktop-nav" aria-label="Primary Navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/shop"
                end={location.search === ''}
                className={`nav-link ${isShopActive ? 'active' : ''}`}
              >
                Shop All
              </NavLink>
            </li>

            {/* Categories Dropdown */}
            <li
              ref={dropdownRef}
              className="nav-item has-dropdown"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button
                type="button"
                className={`nav-link dropdown-toggle ${isCategoryActive || isCategoriesOpen ? 'active' : ''}`}
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                aria-expanded={isCategoriesOpen}
                aria-haspopup="true"
              >
                <span>Categories</span>
                <ChevronDown
                  size={13}
                  className={`dropdown-chevron ${isCategoriesOpen ? 'is-rotated' : ''}`}
                />
              </button>

              {/* Flyout Menu */}
              {isCategoriesOpen && (
                <div className="categories-dropdown-menu" role="menu">
                  <div className="categories-dropdown-grid">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/shop?category=${cat.slug}`}
                        className={`dropdown-category-item ${
                          location.search.includes(`category=${cat.slug}`) ? 'is-current' : ''
                        }`}
                        onClick={() => setIsCategoriesOpen(false)}
                        role="menuitem"
                      >
                        <strong className="dropdown-category-name">{cat.name}</strong>
                        <span className="dropdown-category-desc">{cat.description}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="dropdown-footer">
                    <Link
                      to="/shop"
                      className="dropdown-all-link"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      Browse Complete Collection <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </li>

            <li className="nav-item">
              <Link
                to="/shop?sale=1"
                className={`nav-link nav-link-sale ${isSaleActive ? 'active' : ''}`}
                onClick={() => trackClickCta('Sale', 'header_nav')}
              >
                Sale
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right: Actions (Search & Shopping Bag) */}
        <div className="header-actions">
          <button
            type="button"
            className="header-icon-btn search-toggle-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-expanded={isSearchOpen}
            aria-label="Toggle search bar"
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          <Link
            to="/cart"
            className="header-icon-btn cart-btn"
            aria-label={`Shopping bag with ${itemCount} items`}
          >
            <ShoppingBag size={20} />
            <span className="cart-badge" data-testid="cart-count">
              {itemCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {isSearchOpen && (
        <div className="header-search-bar" role="search">
          <div className="container">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <Search size={18} className="search-form-icon" />
              <input
                ref={searchInputRef}
                type="text"
                role="searchbox"
                className="search-input"
                placeholder="Search products by name, category, or fabric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-input"
                aria-label="Search products"
              />
              <button type="submit" className="btn btn-primary search-submit-btn">
                Search
              </button>
              <button
                type="button"
                className="search-close-btn"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="mobile-nav-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div className="mobile-nav-header">
              <span className="brand-text">ATELIER NORD</span>
              <button
                type="button"
                className="header-icon-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <ul className="mobile-nav-list">
              <li>
                <Link
                  to="/"
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Shop All Pieces
                </Link>
              </li>

              <li className="mobile-section-divider">
                <span className="mobile-section-label">Departments</span>
              </li>

              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className={`mobile-nav-sublink ${
                      location.search.includes(`category=${cat.slug}`) ? 'active' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}

              <li className="mobile-section-divider">
                <span className="mobile-section-label">Reductions</span>
              </li>

              <li>
                <Link
                  to="/shop?sale=1"
                  className="mobile-nav-link mobile-sale-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Seasonal Sale
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
