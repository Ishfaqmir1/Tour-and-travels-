'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MapComponent from '@/components/MapComponent';
import { useDestination } from '@/lib/hooks';
import '../../../styles/destination-details.css';

export default function DestinationDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: destination, isLoading, error } = useDestination(slug);

  if (isLoading) {
    return (
      <div className="destination-details-page">
        <Navbar theme="dark" />
        <div className="destination-details-shell">
          <div className="destination-status-card">
            <h2>Loading destination...</h2>
            <p>Please wait while we load the destination details and local guide list.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="destination-details-page">
        <Navbar theme="dark" />
        <div className="destination-details-shell">
          <div className="destination-status-card">
            <h2>{(error as any)?.message || 'Destination not found'}</h2>
            <p>The place you are looking for is not available right now.</p>
            <Link href="/tourguide" className="destination-primary-btn">Back to Destinations</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="destination-details-page">
      <Navbar theme="dark" />
      <div className="destination-details-shell">
        <div className="destination-page-actions">
          <Link href="/tourguide" className="destination-back-link">← Back to Destinations</Link>
        </div>

        <section className="destination-hero-card">
          <div className="destination-hero-image-wrap">
            <img src={destination.image} alt={destination.title} />
          </div>
          <div className="destination-hero-content">
            <span className="destination-badge">{destination.country}</span>
            <h1>{destination.title}</h1>
            <p className="destination-location">📍 {destination.location_label}</p>
            <p className="destination-description">{destination.description}</p>
            <div className="destination-summary-row">
              <div className="destination-summary-card"><strong>{destination.duration}</strong><span>Suggested Stay</span></div>
              <div className="destination-summary-card"><strong>{destination.price}</strong><span>Starting Budget</span></div>
              <div className="destination-summary-card"><strong>{destination.guides?.length || destination.guides_count || 0}</strong><span>Matching Guides</span></div>
            </div>
          </div>
        </section>

        {/* Location Map Section */}
        <section className="destination-map-section" style={{ marginTop: '32px' }}>
          <div className="destination-guides-heading">
            <span className="guide-section-tag">📍 Location</span>
            <h2>Explore {destination.title} on Map</h2>
            <p>See the exact location of this destination and nearby attractions.</p>
          </div>
          <MapComponent
            locationName={`${destination.city}, ${destination.country}`}
            title={destination.title}
            height="400px"
          />
        </section>

        <section className="destination-guides-section">
          <div className="destination-guides-heading">
            <span className="guide-section-tag">Local Guide Selection</span>
            <h2>Tour Guides for {destination.city}</h2>
            <p>Customers can compare the local guide profiles below and choose the best match for this destination.</p>
          </div>

          {!destination.guides || destination.guides.length === 0 ? (
            <div className="destination-status-card">
              <h3>No guides available yet for {destination.city}</h3>
              <p>Add or seed more destination-specific guides to show them here.</p>
            </div>
          ) : (
            <div className="destination-guide-grid">
              {destination.guides.map((guide: any) => {
                const languages = (guide.languages || '').split(',').map((l: string) => l.trim()).filter(Boolean);
                const hireCost = Number(guide.hire_cost);
                const formattedCost = Number.isFinite(hireCost) ? `$${hireCost.toFixed(2)}/day` : 'Contact for pricing';
                return (
                  <article className="destination-guide-card" key={guide.id}>
                    <div className="destination-guide-image">
                      <img src={guide.photo || '/images/img.jpg'} alt={guide.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/img.jpg'; }} />
                    </div>
                    <div className="destination-guide-body">
                      <div className="destination-guide-topline">
                        <span>⭐ {guide.rating}/5</span>
                        <span>{guide.experience_years} yrs exp.</span>
                      </div>
                      <h3>{guide.name}</h3>
                      <p className="destination-guide-location">📍 {guide.location}</p>
                      <p className="destination-guide-description">{guide.description}</p>
                      <div className="destination-guide-language-list">
                        {languages.slice(0, 3).map((lang: string) => (<span key={`${guide.id}-${lang}`}>{lang}</span>))}
                      </div>
                      <div className="destination-guide-footer">
                        <strong>{formattedCost}</strong>
                        <div className="destination-guide-actions">
                          <Link href={`/guide/${guide.id}`} className="destination-secondary-btn">Guide Details</Link>
                          <Link href={`/payment/${guide.id}`} className="destination-primary-btn">Select Guide</Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
