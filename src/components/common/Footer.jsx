import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories.js';
import './Footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        {/* Brand Column */}
        <div className="footer-column brand-column">
          <span className="footer-brand-title">ATELIER NORD</span>
          <p className="footer-description">
            Contemporary fashion rooted in Scandinavian minimalism, architectural tailoring,
            and honest natural fibers. Crafted with uncompromising attention to longevity and restraint.
          </p>
          <p className="footer-location">Stockholm — Copenhagen — Mumbai</p>
        </div>

        {/* Collections */}
        <div className="footer-column">
          <h4 className="footer-heading">Collections</h4>
          <ul className="footer-links">
            <li><Link to="/shop">All Collections</Link></li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link to={`/shop?category=${cat.slug}`}>{cat.name}</Link>
              </li>
            ))}
            <li><Link to="/shop?sale=1">Archive Sale</Link></li>
          </ul>
        </div>

        {/* Static Shipping Policy */}
        <div className="footer-column">
          <h4 className="footer-heading">Shipping Guidelines</h4>
          <p className="footer-static-text">
            Complimentary standard delivery on all orders above ₹2,999 across India.
            Ground orders are processed within 24–48 hours and typically arrive within 3–5 business days. Express priority courier delivery (1–2 business days) is available at checkout for ₹199.
          </p>
        </div>

        {/* Static Returns Policy */}
        <div className="footer-column">
          <h4 className="footer-heading">Studio Returns</h4>
          <p className="footer-static-text">
            We honor 14-day studio returns on unworn, unwashed garments with all original fabric tags intact. Domestic courier pickup is coordinated at no additional cost. Exchanges are processed promptly upon receipt at our studio.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="copyright-text">
            &copy; {currentYear} Atelier Nord. All rights reserved. Fictional concept demonstration.
          </p>
          <div className="footer-badge">
            <span>SCANDINAVIAN MINIMALISM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
