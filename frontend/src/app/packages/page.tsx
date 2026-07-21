'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { usePackages } from '@/lib/hooks';
import '../../styles/packages.css';

export default function PackagesPage() {
  const { data, isLoading, error } = usePackages({ limit: '50' });
  const packages = data?.data || [];

  return (
    <div className="packages-page">
      <Navbar theme="dark" />
      
      {/* Hero */}
      <section className="packages-hero">
        <div className="packages-hero-bg"></div>
        <motion.div className="packages-hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <span className="packages-badge">Explore Our Tours</span>
          <h1>Travel <span>Packages</span></h1>
          <p>Handpicked tour packages designed to give you the best travel experience across Kashmir and Ladakh.</p>
        </motion.div>
      </section>

      {/* Packages Grid */}
      <section className="packages-section">
        {error && (
          <div className="packages-error">
            <p>{(error as any)?.message || 'Failed to load packages.'}</p>
          </div>
        )}

        {isLoading ? (
          <div className="packages-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="package-skeleton">Loading...</div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="packages-empty">
            <h3>No packages available yet</h3>
            <p>Check back soon for exciting tour packages.</p>
            <Link href="/tourguide" className="packages-cta-btn">Browse Destinations</Link>
          </div>
        ) : (
          <div className="packages-grid">
            {packages.map((pkg: any, index: number) => {
              const disc = pkg.discount_percent || 0;
              const originalPrice = pkg.price || 0;
              const discountedPrice = disc > 0 ? originalPrice - (originalPrice * disc / 100) : originalPrice;
              const category = pkg.category || 'Tour';

              return (
                <motion.article
                  key={pkg.id}
                  className="package-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link href={`/packages/${pkg.slug}`} className="package-card-link">
                    <div className="package-card-image">
                      {pkg.image ? (
                        <img src={pkg.image} alt={pkg.title} loading="lazy" />
                      ) : (
                        <div className="package-card-image-placeholder">🌍</div>
                      )}
                      {disc > 0 && <span className="package-discount-badge">-{disc}%</span>}
                      {pkg.is_featured && <span className="package-featured-badge">Featured</span>}
                    </div>
                    <div className="package-card-body">
                      <div className="package-card-topline">
                        <span className="package-category-tag">{category}</span>
                        <span className="package-rating">⭐ {pkg.rating || 'N/A'}</span>
                      </div>
                      <h3>{pkg.title}</h3>
                      <p className="package-location">📍 {pkg.location || pkg.country}</p>
                      <p className="package-duration">📅 {pkg.duration || 'Flexible'}</p>
                      <div className="package-card-footer">
                        <div className="package-price">
                          {disc > 0 ? (
                            <>
                              <span className="package-price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
                              <span className="package-price-discounted">₹{Math.round(discountedPrice).toLocaleString('en-IN')}</span>
                            </>
                          ) : (
                            <span className="package-price-current">₹{originalPrice.toLocaleString('en-IN')}</span>
                          )}
                          <span className="package-price-per">/person</span>
                        </div>
                        <div className="package-card-actions">
                          <Link href={`/packages/${pkg.slug}`} className="package-view-btn">Details</Link>
                          <Link href={`/packages/${pkg.slug}/book`} className="package-book-btn">Book Now</Link>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="packages-footer">
        <div className="packages-footer-inner">
          <p>© {new Date().getFullYear()} THE VICEROY TOUR & TRAVELS. All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
