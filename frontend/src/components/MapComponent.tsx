'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MapComponentProps {
  locationName: string;
  title?: string;
  height?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export default function MapComponent({ locationName, title, height = '300px' }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [geocoding, setGeocoding] = useState(true);
  const [geocodeError, setGeocodeError] = useState('');

  // Geocode the location name using Nominatim (OpenStreetMap free geocoder)
  useEffect(() => {
    if (!locationName) {
      setGeocoding(false);
      setGeocodeError('No location provided');
      return;
    }

    let cancelled = false;
    setGeocoding(true);
    setGeocodeError('');

    const geocodeLocation = async () => {
      try {
        const query = encodeURIComponent(`${locationName}${title ? ` ${title}` : ''}`);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&accept-language=en`,
          { headers: { 'User-Agent': 'ViceroyTravels/1.0' } }
        );
        const data = await response.json();
        if (cancelled) return;

        if (data && data.length > 0) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        } else {
          // Try with just the city/country name
          const fallbackResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1&accept-language=en`,
            { headers: { 'User-Agent': 'ViceroyTravels/1.0' } }
          );
          const fallbackData = await fallbackResponse.json();
          if (cancelled) return;

          if (fallbackData && fallbackData.length > 0) {
            setCoords({
              lat: parseFloat(fallbackData[0].lat),
              lng: parseFloat(fallbackData[0].lon),
            });
          } else {
            setGeocodeError(`Could not find location: ${locationName}`);
          }
        }
      } catch {
        if (!cancelled) setGeocodeError('Failed to load map location');
      } finally {
        if (!cancelled) setGeocoding(false);
      }
    };

    geocodeLocation();
    return () => { cancelled = true; };
  }, [locationName, title]);

  // Initialize and update the map when coordinates change
  useEffect(() => {
    if (!coords || !mapRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');

      // Fix default marker icon issue with bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Clean up previous map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (!mapRef.current) return;
      const map = L.map(mapRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng])
        .addTo(map)
        .bindPopup(`<b>${title || locationName}</b><br/>${locationName}`)
        .openPopup();

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size after render to fix rendering issues
      setTimeout(() => map.invalidateSize(), 200);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords, locationName, title]);

  if (geocoding) {
    return (
      <div
        style={{
          height,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffa726',
          fontSize: '14px',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '20px' }}>🗺️</span>
        <span>Loading map location...</span>
      </div>
    );
  }

  if (geocodeError) {
    return (
      <div
        style={{
          height,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9eb6c9',
          fontSize: '14px',
          gap: '8px',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '32px' }}>📍</span>
        <p><strong>{title || locationName}</strong></p>
        <p style={{ fontSize: '12px', opacity: 0.7 }}>{locationName}</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        zIndex: 1,
        position: 'relative',
      }}
      className="travel-map-container"
    />
  );
}
