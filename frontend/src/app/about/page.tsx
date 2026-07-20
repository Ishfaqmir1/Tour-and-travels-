'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CountUp from 'react-countup';
import '../../styles/about.css';

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function AboutPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });

  const coreValues = [
    { icon: '🌍', title: 'Sustainable Travel', desc: 'We promote eco-friendly tourism that respects local cultures and protects natural environments.' },
    { icon: '🤝', title: 'Community First', desc: 'We partner with local businesses and communities to ensure our travelers create positive impacts.' },
    { icon: '💎', title: 'Quality Assurance', desc: 'Every tour is carefully vetted to meet our high standards for safety, comfort, and authenticity.' },
    { icon: '❤️', title: 'Customer Love', desc: 'Your satisfaction is our priority. We\'re dedicated to creating memorable experiences for every traveler.' },
  ];

  const milestones = [
    { year: '2020', title: 'Founded', desc: 'THE VICEROY TOUR & TRAVELS was established with a vision to transform travel experiences.' },
    { year: '2021', title: 'First 100 Guides', desc: 'Built our network of passionate local guides across 20 countries.' },
    { year: '2022', title: '10K Travelers', desc: 'Helped over 10,000 travelers discover amazing destinations worldwide.' },
    { year: '2023', title: 'Global Expansion', desc: 'Expanded to 50+ countries with 300+ expert local guides.' },
    { year: '2024', title: 'Innovation Award', desc: 'Received the Travel Innovation Award for our personalized itinerary platform.' },
    { year: '2025', title: 'Sustainable Future', desc: 'Launched carbon-neutral travel packages and eco-conscious tourism initiatives.' },
  ];

  const teamMembers = [
    { name: 'Sarah Johnson', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
    { name: 'Michael Chen', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Emma Williams', role: 'Lead Travel Designer', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80' },
    { name: 'David Rodriguez', role: 'Guide Coordinator', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  ];

  const testimonials = [
    { name: 'Alice Thompson', quote: 'THE VICEROY TOUR & TRAVELS transformed my vacation into an unforgettable journey. The guides were exceptional, and every moment felt personalized to my interests.', location: 'New York, USA' },
    { name: 'Marco Silva', quote: 'As a solo traveler, I was nervous about my first international trip. THE VICEROY TOUR & TRAVELS connected me with an amazing local guide who made all the difference.', location: 'São Paulo, Brazil' },
    { name: 'Sophie Anderson', quote: 'The sustainable tourism focus resonated with me. We not only explored beautiful places but also contributed positively to local communities.', location: 'London, UK' },
    { name: 'James Kim', quote: 'From the stunning landscapes to the authentic cultural experiences, every detail was perfectly orchestrated. Truly a premium travel experience!', location: 'Seoul, South Korea' },
    { name: 'Elena Petrov', quote: 'I\'ve traveled with many agencies, but THE VICEROY TOUR & TRAVELS\'s attention to detail and personal touch is unmatched. Already planning my next adventure!', location: 'Moscow, Russia' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="about-page">
      <Navbar theme="about" />

      <section className="about-hero">
        <div className="hero-bg-gradient"></div>
        <div className="hero-particles">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <motion.div className="hero-content-wrapper" initial="hidden" animate="visible" variants={staggerContainer}>            <motion.span className="hero-badge" variants={fadeUp}>About THE VICEROY TOUR & TRAVELS</motion.span>
          <motion.h1 className="hero-title-main" variants={fadeUp}>
            Discover the World <br /><span className="highlight-text">With Confidence</span>
          </motion.h1>
          <motion.p className="hero-subtitle-main" variants={fadeUp}>
            Creating unforgettable journeys since 2020. We connect travelers with passionate local experts for authentic experiences worldwide.
          </motion.p>
          <motion.div className="hero-cta-group" variants={fadeUp}>
            <Link href="/tourguide" className="btn-primary-about">Explore Tours <span className="btn-arrow">→</span></Link>
            <Link href="/contact" className="btn-secondary-about">Contact Us</Link>
          </motion.div>
        </motion.div>
        <motion.div className="scroll-indicator" animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <div className="scroll-mouse"><div className="scroll-wheel"></div></div>
        </motion.div>
      </section>

      <section className="our-story-section">
        <div className="container">
          <div className="story-grid">
            <motion.div className="story-content" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <span className="section-tag">Our Story</span>
              <h2 className="section-title-main">A Journey of <span className="accent">Passion</span> & Purpose</h2>
              <p className="story-text">THE VICEROY TOUR & TRAVELS was born from a simple belief: travel should be transformative, not just transactional. Founded in 2020 by a team of passionate travelers, we set out to create something different— a travel experience that connects people with places, cultures, and communities in meaningful ways.</p>
              <p className="story-text">What started as a small operation with just a handful of local guides has grown into a global network of over 300 expert guides across 50+ countries. But our mission remains the same: to make every journey an unforgettable story.</p>
              <p className="story-text">We believe that the best travel experiences come from understanding— not just seeing. That's why we partner exclusively with local experts who share their hometowns from a perspective no guidebook can offer.</p>
            </motion.div>
            <motion.div className="story-images" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="story-image-card">
                <img src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=600&q=80" alt="Travel journey" />
              </div>
              <div className="story-image-accent"></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="our-values-section">
        <div className="container">
          <motion.div className="section-header-main" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="section-tag">What We Believe</span>
            <h2 className="section-title-main">Our <span className="accent">Core Values</span></h2>
            <p className="section-subtitle-main">The principles that guide every journey we create</p>
          </motion.div>
          <div className="values-grid">
            {coreValues.map((value, index) => (
              <motion.div key={index} className="value-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -10, scale: 1.02 }}>
                <span className="value-icon">{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="milestones-section">
        <div className="container">
          <motion.div className="section-header-main" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="section-tag">Our Journey</span>
            <h2 className="section-title-main">Company <span className="accent">Milestones</span></h2>
            <p className="section-subtitle-main">Key moments that shaped who we are today</p>
          </motion.div>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <motion.div key={index} className="timeline-item" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <div className="timeline-year">{milestone.year}</div>
                <div className="timeline-content">
                  <h3>{milestone.title}</h3>
                  <p>{milestone.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-content-section">
        <div className="container">
          <div className="about-grid">
            <motion.div className="about-text-content" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <span className="section-tag">Our Mission</span>
              <h2 className="section-title-main">Crafting <span className="accent">Unforgettable</span> Journeys</h2>
              <p className="about-description-text">At <strong>THE VICEROY TOUR & TRAVELS</strong>, we believe travel is more than just visiting places — it's about <span className="highlight">connecting</span> with cultures, <span className="highlight">creating</span> lasting memories, and <span className="highlight">exploring</span> responsibly.</p>
              <p className="about-description-text secondary">We partner with trusted local guides who share our passion for authentic experiences. Our commitment to sustainable tourism ensures that every journey benefits both travelers and the communities they visit.</p>
              <div className="about-features-grid">
                <div className="feature-box"><span className="feature-icon">🌍</span><span>Authentic Experiences</span></div>
                <div className="feature-box"><span className="feature-icon">♻️</span><span>Sustainable Tourism</span></div>
                <div className="feature-box"><span className="feature-icon">🎯</span><span>Personalized Journeys</span></div>
              </div>
            </motion.div>
            <motion.div className="about-image-content" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="image-card">
                <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80" alt="Travelers exploring landscape" />
                <div className="image-accent-card"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="stats-section-main" ref={statsRef}>
        <div className="stats-bg-overlay"></div>
        <div className="container">
          <div className="stats-grid">
            <motion.div className="stat-card-main" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="stat-number-main">
                {statsInView && <CountUp start={0} end={5000} duration={2.5} separator="," />}
                <span className="plus">+</span>
              </div>
              <p className="stat-label-main">Happy Travelers</p>
            </motion.div>
            <motion.div className="stat-card-main" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="stat-number-main">
                {statsInView && <CountUp start={0} end={120} duration={2} />}
                <span className="plus">+</span>
              </div>
              <p className="stat-label-main">Destinations</p>
            </motion.div>
            <motion.div className="stat-card-main" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}>
              <div className="stat-number-main">
                {statsInView && <CountUp start={0} end={300} duration={2} />}
                <span className="plus">+</span>
              </div>
              <p className="stat-label-main">Expert Guides</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="team-section-main">
        <div className="container">
          <motion.div className="section-header-main" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="section-tag">Our Team</span>
            <h2 className="section-title-main">Meet the <span className="accent">Experts</span></h2>
            <p className="section-subtitle-main">The passionate people behind your perfect journey</p>
          </motion.div>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <motion.div key={index} className="team-card-main" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -15 }}>
                <div className="team-image-main"><img src={member.image} alt={member.name} /></div>
                <div className="team-info-main"><h3>{member.name}</h3><p>{member.role}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section-main">
        <div className="testimonials-bg"></div>
        <div className="container">
          <motion.div className="section-header-main" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title-main">What Our <span className="accent">Travelers</span> Say</h2>
            <p className="section-subtitle-main">Real stories from our amazing travel community</p>
          </motion.div>
          <div className="testimonials-container-main">
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial} className="testimonial-card-main" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }}>
                <div className="quote-icon-main">"</div>
                <p className="testimonial-quote-main">{testimonials[activeTestimonial].quote}</p>
                <div className="testimonial-author-main">
                  <h4>{testimonials[activeTestimonial].name}</h4>
                  <span>{testimonials[activeTestimonial].location}</span>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="testimonial-dots-main">
              {testimonials.map((_, index) => (
                <button key={index} className={`dot-main ${index === activeTestimonial ? 'active' : ''}`} onClick={() => setActiveTestimonial(index)} aria-label={`Go to testimonial ${index + 1}`}></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section-main">
        <div className="cta-bg-main">
          <div className="cta-particles-main"><span></span><span></span><span></span><span></span><span></span></div>
        </div>
        <motion.div className="cta-content-main" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2>Ready to Begin Your <span className="accent">Adventure</span>?</h2>
          <p>Join thousands of travelers who have discovered the world with THE VICEROY TOUR & TRAVELS</p>
          <Link href="/signup" className="glow-button-main">Get Started Today</Link>
        </motion.div>
      </section>

      <footer className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand-main">
              <div className="footer-logo-main">
                <span className="logo-icon-main">🌍</span>
                <span className="logo-text-main"><span className="travel">Voice</span><span className="world">Roy</span></span>
              </div>
              <p className="footer-desc">Connecting travelers with the world since 2020. Your adventure starts here.</p>
              <div className="footer-social-main">
                <a href="#" aria-label="Facebook" className="social-link-main">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" aria-label="Twitter" className="social-link-main">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className="social-link-main">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" aria-label="YouTube" className="social-link-main">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
              </div>
            </div>
            <div className="footer-links-main">
              <h4>Quick Links</h4>
              <Link href="/">Home</Link>
              <Link href="/about">About Us</Link>
              <Link href="/tourguide">Tour Guides</Link>
              <Link href="/contact">Contact</Link>
            </div>
            <div className="footer-links-main">
              <h4>Support</h4>
              <Link href="/login">Login</Link>
              <Link href="/signup">Register</Link>
              <Link href="/forgot-password">Help Center</Link>
              <Link href="#">Privacy Policy</Link>
            </div>
            <div className="footer-contact-main">
              <h4>Contact</h4>
              <p>📍 123 Travel Street</p>
              <p>📧 hello@viceroytravels.com</p>
              <p>📞 +1 234 567 890</p>
            </div>
          </div>
          <div className="footer-bottom-main">
            <p>© 2026 THE VICEROY TOUR & TRAVELS. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
