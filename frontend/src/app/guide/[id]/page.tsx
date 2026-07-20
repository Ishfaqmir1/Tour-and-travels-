'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MapComponent from '@/components/MapComponent';
import { useTourGuide } from '@/lib/hooks';
import '../../../styles/guide-details.css';

export default function GuideDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const numericId = Number(id);
  const { data: guide, isLoading, error } = useTourGuide(numericId);

  const safeRating = Math.max(0, Math.min(5, guide?.rating || 0));
  const languages = (guide?.languages || '').split(',').map((l: string) => l.trim()).filter(Boolean);
  const localKnowledge = Math.min(98, 70 + (guide?.experience_years || 0) * 3);
  const communication = Math.min(96, 65 + safeRating * 6);
  const planning = Math.min(95, 60 + (guide?.experience_years || 0) * 4 + safeRating * 2);
  const hasPhone = (guide?.phone || '').trim().length > 0;
  const hasEmail = (guide?.email || '').trim().length > 0;
  const displayPhone = hasPhone ? guide!.phone! : 'Not provided';
  const displayEmail = hasEmail ? guide!.email! : 'Not provided';
  const safePhoneHref = hasPhone ? `tel:${guide!.phone!.replace(/[^\d+]/g, '')}` : '#';
  const hireCost = Number(guide?.hire_cost);
  const hasHireCost = guide?.hire_cost !== undefined && guide?.hire_cost !== null && Number.isFinite(hireCost);
  const formattedHireCost = hasHireCost ? `$${hireCost.toFixed(2)}` : 'Not set';

  if (isLoading) {
    return (
      <div className="guide-details-page">
        <Navbar theme="dark" />
        <div className="guide-details-shell">
          <div className="guide-loading-card"><h2>Loading Guide Details...</h2><p>Please wait while we fetch this guide from the database.</p></div>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="guide-details-page">
        <Navbar theme="dark" />
        <div className="guide-details-shell">
          <div className="guide-error-card">
            <h2>{(error as any)?.message || 'Guide not found'}</h2>
            <p>We could not load this tour guide profile right now.</p>
            <Link href="/tourguide" className="guide-btn secondary">Back to Destinations</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guide-details-page">
      <Navbar theme="dark" />
      <div className="guide-details-shell">
        <div className="guide-page-actions">
          <Link href="/tourguide" className="guide-back-link">← Back to Destinations</Link>
        </div>

        <article className="guide-profile-card">
          <div className="guide-profile-head">
            <div className="guide-photo-wrap">
              <img src={guide.photo || '/images/img.jpg'} alt={guide.name}
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/img.jpg'; }} />
            </div>
            <div className="guide-primary">
              <h1>{guide.name}</h1>
              <p className="guide-location">📍 {guide.location}</p>
              <div className="guide-rating">
                <div className="guide-stars">
                  {Array.from({ length: safeRating }).map((_, i) => (<span key={`f-${i}`}>★</span>))}
                  {Array.from({ length: 5 - safeRating }).map((_, i) => (<span key={`e-${i}`} className="star-muted">★</span>))}
                </div>
                <span className="guide-rating-label">{safeRating.toFixed(1)} / 5</span>
              </div>
              <div className="guide-meta-chips">
                <span>{guide.experience_years} Years Experience</span>
                <span>{languages.length || 1} Language{(languages.length || 1) > 1 ? 's' : ''}</span>
                <span>Hire Cost: {formattedHireCost}{hasHireCost ? ' / day' : ''}</span>
              </div>
              <div className="guide-cta-row">
                <Link href={`/payment/${guide.id}`} className="guide-btn primary">Hire & Pay</Link>
                {hasEmail ? <a href={`mailto:${displayEmail}`} className="guide-btn secondary">Email Guide</a> : <span className="guide-btn disabled">Email Not Available</span>}
                {hasPhone ? <a href={safePhoneHref} className="guide-btn secondary">Call Guide</a> : <span className="guide-btn disabled">Phone Not Available</span>}
              </div>
            </div>
          </div>

          <section className="guide-section">
            <h2>About</h2>
            <p>{guide.description}</p>
          </section>

          <section className="guide-section">
            <h2>Languages</h2>
            <div className="guide-language-list">
              {(languages.length ? languages : ['Not provided']).map((lang: string) => (
                <span key={lang} className="guide-language-chip">{lang}</span>
              ))}
            </div>
          </section>

          {/* Guide Location Map */}
          <section className="guide-section">
            <h2>📍 Service Area</h2>
            <p>{guide.name} is based in <strong>{guide.location}</strong> and serves travelers in this region.</p>
            <MapComponent
              locationName={guide.location}
              title={guide.name}
              height="320px"
            />
          </section>

          <section className="guide-section">
            <h2>Contact & Hire Details</h2>
            <div className="guide-contact-grid">
              <div className="guide-contact-item">
                <span className="contact-label">Phone</span>
                {hasPhone ? <a href={safePhoneHref}>{displayPhone}</a> : <strong>{displayPhone}</strong>}
              </div>
              <div className="guide-contact-item">
                <span className="contact-label">Email</span>
                {hasEmail ? <a href={`mailto:${displayEmail}`}>{displayEmail}</a> : <strong>{displayEmail}</strong>}
              </div>
              <div className="guide-contact-item">
                <span className="contact-label">Hire Cost</span>
                <strong>{formattedHireCost}{hasHireCost ? ' / day' : ''}</strong>
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h2>Professional Highlights</h2>
            <div className="guide-skill">
              <div className="guide-skill-row"><span>Local Knowledge</span><span>{localKnowledge}%</span></div>
              <div className="guide-skill-track"><div className="guide-skill-fill" style={{ width: `${localKnowledge}%` }} /></div>
            </div>
            <div className="guide-skill">
              <div className="guide-skill-row"><span>Communication</span><span>{communication}%</span></div>
              <div className="guide-skill-track"><div className="guide-skill-fill" style={{ width: `${communication}%` }} /></div>
            </div>
            <div className="guide-skill">
              <div className="guide-skill-row"><span>Tour Planning</span><span>{planning}%</span></div>
              <div className="guide-skill-track"><div className="guide-skill-fill" style={{ width: `${planning}%` }} /></div>
            </div>
          </section>

          <div className="guide-footer-note">
            Looking for another destination or local expert? <Link href="/tourguide">Browse all destinations</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
