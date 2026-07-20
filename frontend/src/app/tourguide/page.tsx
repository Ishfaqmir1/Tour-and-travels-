'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useDestinations } from '@/lib/hooks';
import '../../styles/tourguide.css';

export default function TourGuidePage() {
  const { data: destinations, isLoading, error } = useDestinations();

  return (
    <div className="tourguide-page">
      <Navbar theme="dark" />
      <section className="tourguide-hero">
        <div className="tourguide-hero-overlay"></div>
        <div className="tourguide-hero-content">
          <span className="tourguide-eyebrow">Choose Your Destination</span>
          <h1>6 Tour Places, Local Guides, Better Travel Decisions</h1>
          <p>Pick a destination first, then open a dedicated page for that place. Customers can view the destination image, description, and the local guide list fetched directly from the database.</p>
          <div className="tourguide-stats">
            <div className="tourguide-stat-card"><strong>{isLoading ? '...' : destinations?.length || 0}</strong><span>Tour Places</span></div>
            <div className="tourguide-stat-card"><strong>3+</strong><span>Guides Per Destination</span></div>
            <div className="tourguide-stat-card"><strong>DB</strong><span>Live Destination Data</span></div>
          </div>
        </div>
      </section>

      <section className="tourguide-destinations-section">
        <div className="tourguide-section-heading">
          <span className="section-tag">Destination Based Booking</span>
          <h2>Select a Place, Then Open the Full Destination Page</h2>
          <p>Each card below opens a separate page where customers can see the destination details and the available tour guides for that exact location.</p>
        </div>

        {error && <div className="tourguide-inline-alert"><strong>Destination data could not be loaded.</strong><span>{(error as any)?.message || 'Failed to load destinations.'}</span></div>}

        <div className="destination-grid">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <article className="destination-select-card" key={`loading-${index}`}>
                <div className="destination-select-image"></div>
                <div className="destination-select-body">
                  <div className="destination-select-topline"><span>Loading</span><span>...</span></div>
                  <h3>Loading destination...</h3>
                  <p>Please wait while we load destination data from the database.</p>
                </div>
              </article>
            ))
          ) : !destinations || destinations.length === 0 ? (
            <div className="tourguide-preview-status">
              <h4>No destinations found</h4>
              <p>Run the destination and guide seeders so the page can show the database data.</p>
            </div>
          ) : (
            destinations.map((destination: any) => (
              <article className="destination-select-card" key={destination.id}>
                <div className="destination-select-image">
                  <img src={destination.image} alt={destination.title} />
                  <div className="destination-select-badge">⭐ {destination.rating}</div>
                </div>
                <div className="destination-select-body">
                  <div className="destination-select-topline">
                    <span>{destination.country}</span>
                    <span>{destination.duration}</span>
                  </div>
                  <h3>{destination.title}</h3>
                  <p>{destination.short_description}</p>
                  <div className="destination-select-meta">
                    <span>📍 {destination.location_label}</span>
                    <span>{destination.guides_count || 0} guide{destination.guides_count === 1 ? '' : 's'} available</span>
                  </div>
                  <div className="destination-select-actions">
                    <Link href={`/destinations/${destination.slug}`} className="btn-contact">View Destination</Link>
                    <span className="destination-price">{destination.price}</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-wrapper">
          <div className="footer-box">
            <h2 className="footer-logo">VOICE<span>ROY</span></h2>
            <p>Pick the right place. Meet the right guide. Travel with confidence.</p>
            <div className="footer-social"><a href="#">Y</a><a href="#">T</a><a href="#">F</a><a href="#">I</a></div>
          </div>
          <div className="footer-box"><h3>Destinations</h3><ul><li>Srinagar</li><li>Gulmarg</li><li>Leh-Ladakh</li></ul></div>
          <div className="footer-box"><h3>Guide Flow</h3><ul><li>Choose a place</li><li>Compare local guides</li><li>Select and book</li></ul></div>
          <div className="footer-box"><h3>Contact</h3><ul><li>📍 Shopian, Jammu and Kashmir</li><li>📧 mallamajid32@gmail.com</li><li>📞 9103815702</li></ul></div>
        </div>
        <div className="footer-bottom">© 2026 THE VICEROY TOUR & TRAVELS. All Rights Reserved<br /><span style={{ opacity: 0.8, fontSize: '0.85rem' }}>Developed by Ishfaq Mir — mirishfaq01@gmail.com</span></div>
      </footer>
    </div>
  );
}
