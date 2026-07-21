/**
 * Tour Guide (Destinations) Page - Unit Tests
 * ============================================
 * Tests the destination listing page that helps users find tour guides:
 * - Hero section with heading and stats cards
 * - Destination cards with titles, descriptions, and locations
 * - Guide availability counts
 * - View Destination links with correct slug-based URLs
 * - Section headings for "Destination Based Booking"
 *
 * The useDestinations hook is mocked with sample Kashmir destinations.
 * Navbar is mocked to simplify rendering.
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

const mockDestinations = [
  {
    id: 1,
    slug: 'srinagar',
    title: 'Srinagar - The Jewel of Kashmir',
    image: 'https://example.com/srinagar.jpg',
    country: 'India',
    location_label: 'Srinagar, Jammu and Kashmir',
    short_description: 'Explore the beautiful Dal Lake and Mughal Gardens.',
    duration: '3-5 Days',
    price: '₹5,000',
    rating: 4.7,
    guides_count: 4,
  },
  {
    id: 2,
    slug: 'gulmarg',
    title: 'Gulmarg - Meadow of Flowers',
    image: 'https://example.com/gulmarg.jpg',
    country: 'India',
    location_label: 'Gulmarg, Jammu and Kashmir',
    short_description: 'Famous for skiing and breathtaking meadows.',
    duration: '2-4 Days',
    price: '₹6,500',
    rating: 4.9,
    guides_count: 3,
  },
];

jest.mock('@/lib/hooks', () => ({
  useDestinations: () => ({
    data: mockDestinations,
    isLoading: false,
    error: null,
  }),
}));

const TourGuidePage = jest.requireActual('@/app/tourguide/page').default;

describe('Tour Guide (Destinations) Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the hero section with heading', () => {
    render(React.createElement(TourGuidePage));
    expect(screen.getByText('Choose Your Destination')).toBeInTheDocument();
    expect(screen.getByText(/6 Tour Places/)).toBeInTheDocument();
  });

  it('renders destination cards', () => {
    render(React.createElement(TourGuidePage));
    expect(screen.getByText('Srinagar - The Jewel of Kashmir')).toBeInTheDocument();
    expect(screen.getByText('Gulmarg - Meadow of Flowers')).toBeInTheDocument();
  });

  it('renders destination meta info', () => {
    render(React.createElement(TourGuidePage));
    expect(screen.getByText(/Srinagar, Jammu and Kashmir/)).toBeInTheDocument();
    expect(screen.getByText('4 guides available')).toBeInTheDocument();
    expect(screen.getByText('3 guides available')).toBeInTheDocument();
  });

  it('has view destination links', () => {
    render(React.createElement(TourGuidePage));
    const viewLinks = screen.getAllByText('View Destination');
    expect(viewLinks.length).toBe(2);
    expect(viewLinks[0].closest('a')).toHaveAttribute('href', '/destinations/srinagar');
    expect(viewLinks[1].closest('a')).toHaveAttribute('href', '/destinations/gulmarg');
  });

  it('renders stats cards', () => {
    render(React.createElement(TourGuidePage));
    expect(screen.getByText('2')).toBeInTheDocument(); // destinations length
    expect(screen.getByText('Tour Places')).toBeInTheDocument();
    expect(screen.getByText('Guides Per Destination')).toBeInTheDocument();
  });

  it('renders the section heading', () => {
    render(React.createElement(TourGuidePage));
    expect(screen.getByText(/Destination Based Booking/)).toBeInTheDocument();
    expect(screen.getByText(/Select a Place/)).toBeInTheDocument();
  });

  it('renders the navbar', () => {
    render(React.createElement(TourGuidePage));
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });
});
