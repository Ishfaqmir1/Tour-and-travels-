'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { usePackage } from '@/lib/hooks';
import '../../../styles/package-detail.css';

export default function PackageDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: pkg, isLoading, error } = usePackage(slug);

  if (isLoading) {
    return (
      <div className="pkg-detail-page">
        <Navbar theme="dark" />
        <div className="pkg-detail-shell">
          <div className="pkg-loading"><h2>Loading package...</h2><p>Please wait.</p></div>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="pkg-detail-page">
        <Navbar theme="dark" />
        <div className="pkg-detail-shell">
          <div className="pkg-error">
            <h2>Package not found</h2>
            <p>{(error as any)?.message || 'The package you are looking for is not available.'}</p>
            <Link href="/packages" className="pkg-btn-primary">← Back to Packages</Link>
          </div>
        </div>
      </div>
    );
  }

  const disc = pkg.discount_percent || 0;
  const originalPrice = pkg.price || 0;
  const discountedPrice = disc > 0 ? originalPrice - (originalPrice * disc / 100) : originalPrice;
  const highlights = Array.isArray(pkg.highlights) ? pkg.highlights : [];
  const included = Array.isArray(pkg.included) ? pkg.included : [];
  const excluded = Array.isArray(pkg.excluded) ? pkg.excluded : [];
  const days = Array.isArray(pkg.days) ? pkg.days : [];
  const faqs = Array.isArray(pkg.faqs) ? pkg.faqs : [];

  return (
    <div className="pkg-detail-page">
      <Navbar theme="dark" />
      <div className="pkg-detail-shell">
        <div className="pkg-breadcrumb">
          <Link href="/packages">← All Packages</Link>
        </div>

        {/* Hero Section */}
        <section className="pkg-hero-card">
          <div className="pkg-hero-image">
            {pkg.image ? (
              <img src={pkg.image} alt={pkg.title} />
            ) : (
              <div className="pkg-hero-placeholder">🌍</div>
            )}
            {disc > 0 && <span className="pkg-discount-badge">-{disc}% Off</span>}
          </div>
          <div className="pkg-hero-content">
            <div className="pkg-meta-top">
              <span className="pkg-category-badge">{pkg.category || 'Tour'}</span>
              <span className="pkg-rating">⭐ {pkg.rating || 'N/A'}</span>
            </div>
            <h1>{pkg.title}</h1>
            <p className="pkg-location">📍 {pkg.location || pkg.country || 'Location not specified'}</p>
            <p className="pkg-duration-label">📅 {pkg.duration || 'Flexible'}</p>
            <div className="pkg-price-section">
              {disc > 0 ? (
                <>
                  <span className="pkg-price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
                  <span className="pkg-price-current">₹{Math.round(discountedPrice).toLocaleString('en-IN')}</span>
                  <span className="pkg-price-save">Save {disc}%</span>
                </>
              ) : (
                <span className="pkg-price-current">₹{originalPrice.toLocaleString('en-IN')}</span>
              )}
              <span className="pkg-price-per">/ person</span>
            </div>
            <Link href={`/packages/${pkg.slug}/book`} className="pkg-book-btn">
              Book This Package →
            </Link>
          </div>
        </section>

        {/* Overview */}
        <section className="pkg-section">
          <h2>Overview</h2>
          <p className="pkg-overview-text">{pkg.overview || 'No description available.'}</p>
        </section>

        {/* Highlights */}
        {highlights.length > 0 && (
          <section className="pkg-section">
            <h2>✨ Highlights</h2>
            <div className="pkg-highlights-list">
              {highlights.map((h: string, i: number) => (
                <motion.div key={i} className="pkg-highlight-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <span className="pkg-highlight-icon">⭐</span>
                  <span>{h}</span>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Day-wise Itinerary */}
        {days.length > 0 && (
          <section className="pkg-section">
            <h2>📅 Itinerary</h2>
            <div className="pkg-days-list">
              {days.map((day: any) => (
                <motion.div key={day.id || day.day_number} className="pkg-day-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <div className="pkg-day-number">Day {day.day_number}</div>
                  <div className="pkg-day-content">
                    <h3>{day.title || `Day ${day.day_number}`}</h3>
                    <p>{day.description}</p>
                    {Array.isArray(day.activities) && day.activities.length > 0 && (
                      <div className="pkg-day-activities">
                        {day.activities.map((act: string, ai: number) => (
                          <span key={ai} className="pkg-activity-tag">🎯 {act}</span>
                        ))}
                      </div>
                    )}
                    {(day.meals || day.hotel) && (
                      <div className="pkg-day-meta">
                        {day.meals && <span>🍽️ {day.meals}</span>}
                        {day.hotel && <span>🏨 {day.hotel}</span>}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Included / Excluded */}
        <div className="pkg-incl-excl-grid">
          {included.length > 0 && (
            <section className="pkg-section pkg-included">
              <h2>✅ Included</h2>
              <ul className="pkg-incl-list">
                {included.map((item: string, i: number) => (
                  <li key={i}>✅ {item}</li>
                ))}
              </ul>
            </section>
          )}
          {excluded.length > 0 && (
            <section className="pkg-section pkg-excluded">
              <h2>❌ Excluded</h2>
              <ul className="pkg-excl-list">
                {excluded.map((item: string, i: number) => (
                  <li key={i}>❌ {item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="pkg-section">
            <h2>❓ FAQs</h2>
            <div className="pkg-faqs-list">
              {faqs.map((faq: any) => (
                <details key={faq.id} className="pkg-faq-item">
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="pkg-cta-section">
          <div className="pkg-cta-card">
            <h2>Ready to Book This Package?</h2>
            <p>Secure your spot now and get ready for an unforgettable journey.</p>
            <Link href={`/packages/${pkg.slug}/book`} className="pkg-cta-btn">Book Now ✈️</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
