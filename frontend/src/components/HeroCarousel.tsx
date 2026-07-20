'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const slides = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1597432538815-1c262b1cf777?auto=format&fit=crop&w=1920&q=85',
    title: 'Dal Lake',
    location: 'Srinagar, Kashmir',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=1920&q=85',
    title: 'Gulmarg Gondola',
    location: 'Gulmarg, Kashmir',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1597432538361-a9b450880e3c?auto=format&fit=crop&w=1920&q=85',
    title: 'Betaab Valley',
    location: 'Pahalgam, Kashmir',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1586339949916-3e5457d58f1c?auto=format&fit=crop&w=1920&q=85',
    title: 'Thajiwas Glacier',
    location: 'Sonamarg, Kashmir',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1597131686427-35eefb6f7e7f?auto=format&fit=crop&w=1920&q=85',
    title: 'Pangong Tso',
    location: 'Ladakh',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1586104913497-33f91cafa70b?auto=format&fit=crop&w=1920&q=85',
    title: 'Nubra Valley',
    location: 'Ladakh',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1920&q=85',
    title: 'Houseboats',
    location: 'Dal Lake, Srinagar',
  },
];

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      skipSnaps: false,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <div className="hero-carousel">
      {/* Embla viewport */}
      <div className="hero-carousel-viewport" ref={emblaRef}>
        <div className="hero-carousel-container">
          {slides.map((slide) => (
            <div className="hero-carousel-slide" key={slide.id}>
              <div
                className="hero-carousel-image"
                style={{ backgroundImage: `url(${slide.src})` }}
              />
              <div className="hero-carousel-content">
                <h3 className="hero-carousel-title">{slide.title}</h3>
                <span className="hero-carousel-location">{slide.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        className="hero-carousel-arrow hero-carousel-arrow-prev"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Previous slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        className="hero-carousel-arrow hero-carousel-arrow-next"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Next slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dot navigation */}
      <div className="hero-carousel-dots">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`hero-carousel-dot ${index === selectedIndex ? 'is-selected' : ''}`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
