/**
 * Destination Details Page - Unit Tests
 * =======================================
 * Tests the dynamic destination detail page ([slug] route):
 * - Destination title, description, and summary cards (duration, price, guides)
 * - Back-to-destinations navigation link
 * - Map component rendering
 * - Guide selection section with Local Guide Selection heading
 * - Individual guide cards with names, experience years, and action links
 * - Guide Details and Select Guide links with correct IDs
 * - Country badge display
 *
 * The useDestination hook is mocked with a complete destination object
 * including guide data. MapComponent is mocked for isolated testing.
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/components/MapComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="map-component">Map</div>,
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  useParams: () => ({ slug: 'srinagar' }),
  usePathname: () => '/destinations/srinagar',
  useSearchParams: () => new URLSearchParams(),
}));

const mockDestination = {
  id: 1,
  slug: 'srinagar',
  title: 'Srinagar - The Jewel of Kashmir',
  image: 'https://example.com/srinagar.jpg',
  country: 'India',
  city: 'Srinagar',
  location_label: 'Srinagar, Jammu and Kashmir',
  description: 'Explore the beautiful Dal Lake, Mughal Gardens, and houseboats.',
  duration: '3-5 Days',
  price: '₹5,000',
  rating: 4.7,
  guides_count: 3,
  guides: [
    {
      id: 1,
      name: 'Mohammad Ali',
      photo: 'https://example.com/ali.jpg',
      location: 'Srinagar, Kashmir',
      rating: 4.8,
      experience_years: 8,
      description: 'Expert local guide with deep knowledge of Kashmir.',
      languages: 'English, Hindi, Urdu',
      hire_cost: 2500,
    },
    {
      id: 2,
      name: 'Fatima Begum',
      photo: 'https://example.com/fatima.jpg',
      location: 'Srinagar, Kashmir',
      rating: 4.9,
      experience_years: 6,
      description: 'Specializes in cultural tours and heritage walks.',
      languages: 'English, Urdu, Kashmiri',
      hire_cost: 2000,
    },
  ],
};

jest.mock('@/lib/hooks', () => ({
  useDestination: () => ({
    data: mockDestination,
    isLoading: false,
    error: null,
  }),
}));

const DestinationDetailsPage = jest.requireActual('@/app/destinations/[slug]/page').default;

describe('Destination Details Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders destination title and description', () => {
    render(React.createElement(DestinationDetailsPage));
    expect(screen.getByText('Srinagar - The Jewel of Kashmir')).toBeInTheDocument();
    expect(screen.getByText(/Explore the beautiful Dal Lake/)).toBeInTheDocument();
  });

  it('renders destination summary cards', () => {
    render(React.createElement(DestinationDetailsPage));
    expect(screen.getByText('3-5 Days')).toBeInTheDocument();
    expect(screen.getByText('₹5,000')).toBeInTheDocument();
    expect(screen.getByText('Matching Guides')).toBeInTheDocument();
  });

  it('renders back to destinations link', () => {
    render(React.createElement(DestinationDetailsPage));
    const backLink = screen.getByText(/Back to Destinations/);
    expect(backLink.closest('a')).toHaveAttribute('href', '/tourguide');
  });

  it('renders the map component', () => {
    render(React.createElement(DestinationDetailsPage));
    expect(screen.getByTestId('map-component')).toBeInTheDocument();
    expect(screen.getByText(/Explore.*on Map/)).toBeInTheDocument();
  });

  it('renders guides section heading', () => {
    render(React.createElement(DestinationDetailsPage));
    expect(screen.getByText(/Local Guide Selection/)).toBeInTheDocument();
    expect(screen.getByText(/Tour Guides for Srinagar/)).toBeInTheDocument();
  });

  it('renders guide cards with names and details', () => {
    render(React.createElement(DestinationDetailsPage));
    expect(screen.getByText('Mohammad Ali')).toBeInTheDocument();
    expect(screen.getByText('Fatima Begum')).toBeInTheDocument();
    expect(screen.getByText(/8 yrs exp/)).toBeInTheDocument();
    expect(screen.getByText(/6 yrs exp/)).toBeInTheDocument();
  });

  it('renders guide action links', () => {
    render(React.createElement(DestinationDetailsPage));
    const guideDetailsLinks = screen.getAllByText('Guide Details');
    expect(guideDetailsLinks.length).toBe(2);
    expect(guideDetailsLinks[0].closest('a')).toHaveAttribute('href', '/guide/1');

    const selectGuideLinks = screen.getAllByText('Select Guide');
    expect(selectGuideLinks.length).toBe(2);
    expect(selectGuideLinks[0].closest('a')).toHaveAttribute('href', '/payment/1');
  });

  it('renders country badge', () => {
    render(React.createElement(DestinationDetailsPage));
    expect(screen.getByText('India')).toBeInTheDocument();
  });

  it('renders the navbar', () => {
    render(React.createElement(DestinationDetailsPage));
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });
});
