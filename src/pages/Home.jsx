import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, RefreshCw, Percent } from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { FallbackImage } from '../components/common/FallbackImage.jsx';
import { getProductsByTag } from '../data/products.js';
import { categories } from '../data/categories.js';
import { siteImages } from '../data/siteImages.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './Home.css';

export function Home() {
  useDocumentTitle('Contemporary Scandinavian Fashion');

  const featuredProducts = getProductsByTag('featured').slice(0, 4);
  const bestsellerProducts = getProductsByTag('bestseller').slice(0, 4);

  return (
    <div className="home-page">
      {/* 1. Large Hero Section */}
      <section className="hero-section" aria-label="Hero Collection Showcase">
        <div className="hero-media-wrapper">
          <FallbackImage
            src={siteImages.hero}
            alt="Editorial fashion models in refined Scandinavian minimalist outerwear"
            aspectRatio="16/9"
            loading="eager"
            className="hero-image"
          />
          <div className="hero-overlay" />
        </div>

        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-eyebrow">Autumn / Winter Edition</span>
            <h1 className="hero-headline">
              Timeless Silhouettes, Modern Restraint
            </h1>
            <p className="hero-description">
              Rooted in Scandinavian design principles. Uncompromising natural textiles, architectural lines,
              and purposeful tailoring crafted for daily permanence.
            </p>
            <div className="hero-cta-group">
              <Link to="/shop" className="hero-btn">
                Explore The Collection <ArrowRight size={16} />
              </Link>
              <Link to="/shop?sale=1" className="hero-sale-btn">
                Shop The Sale <Percent size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Values Highlights */}
      <section className="brand-values-bar" aria-label="Brand Guarantees">
        <div className="container values-container">
          <div className="value-item">
            <Truck size={20} className="value-icon" />
            <div>
              <h4 className="value-title">Complimentary Delivery</h4>
              <p className="value-text">On domestic orders over ₹2,999</p>
            </div>
          </div>
          <div className="value-item">
            <Sparkles size={20} className="value-icon" />
            <div>
              <h4 className="value-title">Organic & Responsible</h4>
              <p className="value-text">100% certified natural textiles</p>
            </div>
          </div>
          <div className="value-item">
            <RefreshCw size={20} className="value-icon" />
            <div>
              <h4 className="value-title">14-Day Studio Returns</h4>
              <p className="value-text">Effortless domestic exchanges</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Section: 6 Official Categories */}
      <section className="categories-section section-spacing" aria-label="Shop By Category">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Curated Lines</span>
            <h2 className="section-title">Explore by Department</h2>
            <p className="section-subtitle">
              Six focused departments designed to assemble an enduring, interchangeable capsule wardrobe.
            </p>
          </div>

          <div className="category-cards-grid">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="category-card"
                aria-label={`Explore ${cat.name} collection`}
              >
                <div className="category-card-media">
                  <FallbackImage
                    src={siteImages.categories[cat.slug]}
                    alt={`${cat.name} collection showcase`}
                    aspectRatio="4/5"
                    className="category-card-img"
                  />
                  <div className="category-card-overlay" />
                </div>
                <div className="category-card-content">
                  <h3 className="category-card-title">{cat.name}</h3>
                  <p className="category-card-subtitle">{cat.description}</p>
                  <span className="category-card-link-text">
                    View Department <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Collection Section */}
      <section className="featured-section section-spacing" aria-label="Featured Products">
        <div className="container">
          <div className="section-header">
            <div className="section-header-row">
              <div>
                <span className="section-eyebrow">Selected Works</span>
                <h2 className="section-title">Featured Pieces</h2>
              </div>
              <Link to="/shop" className="section-header-link">
                View All <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <ProductGrid products={featuredProducts} columns={4} />
        </div>
      </section>

      {/* 4. Editorial Highlight Banner */}
      <section className="editorial-banner-section" aria-label="Editorial Highlight">
        <div className="container">
          <div className="editorial-banner-box">
            <div className="editorial-banner-media">
              <FallbackImage
                src={siteImages.editorial}
                alt="Artisanal wool and cotton knitwear crafted in Atelier Nord studio"
                aspectRatio="16/10"
                className="editorial-img"
              />
            </div>
            <div className="editorial-banner-content">
              <span className="editorial-eyebrow">Studio Craft & Provenance</span>
              <h2 className="editorial-title">Purity of Silhouette & Fabric</h2>
              <p className="editorial-text">
                Every garment is cut from responsibly sourced materials — extrafine merino wool, French flax linen,
                and heavyweight organic ring-spun cotton. We build clothing for years of deliberate wear.
              </p>
              <Link to="/shop" className="btn btn-secondary">
                Read Philosophy & Shop <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bestsellers Section */}
      <section className="bestsellers-section section-spacing" aria-label="Bestselling Garments">
        <div className="container">
          <div className="section-header">
            <div className="section-header-row">
              <div>
                <span className="section-eyebrow">Studio Staples</span>
                <h2 className="section-title">Most Coveted Pieces</h2>
              </div>
              <Link to="/shop" className="section-header-link">
                View All <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <ProductGrid products={bestsellerProducts} columns={4} />
        </div>
      </section>
    </div>
  );
}

export default Home;
