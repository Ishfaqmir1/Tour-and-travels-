import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isSuperAdmin: false,
    loading: false,
  }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

const mockPackages = [
  {
    id: 1,
    slug: 'kashmir-golden-tour',
    title: 'Kashmir Golden Tour',
    image: 'https://example.com/kashmir.jpg',
    location: 'Srinagar, Kashmir',
    country: 'India',
    duration: '5 Days / 4 Nights',
    price: 15000,
    discount_percent: 10,
    rating: 4.8,
    review_count: 24,
    is_featured: true,
  },
  {
    id: 2,
    slug: 'ladakh-adventure',
    title: 'Ladakh Adventure',
    image: 'https://example.com/ladakh.jpg',
    location: 'Leh, Ladakh',
    country: 'India',
    duration: '7 Days / 6 Nights',
    price: 25000,
    discount_percent: 0,
    rating: 4.9,
    review_count: 18,
    is_featured: false,
  },
];

jest.mock('@/lib/hooks', () => ({
  usePackages: () => ({
    data: { data: mockPackages, pagination: null },
    isLoading: false,
    error: null,
  }),
}));

const PackagesPage = jest.requireActual('@/app/packages/page').default;

describe('Packages Listing Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page heading', () => {
    render(React.createElement(PackagesPage));
    expect(screen.getByRole('heading', { name: /travel packages/i })).toBeInTheDocument();
  });

  it('renders all package cards', () => {
    render(React.createElement(PackagesPage));
    expect(screen.getByText('Kashmir Golden Tour')).toBeInTheDocument();
    expect(screen.getByText('Ladakh Adventure')).toBeInTheDocument();
  });

  it('renders package prices', () => {
    render(React.createElement(PackagesPage));
    expect(screen.getByText(/15,000/)).toBeInTheDocument();
    expect(screen.getByText(/25,000/)).toBeInTheDocument();
  });

  it('renders discount badges', () => {
    render(React.createElement(PackagesPage));
    expect(screen.getByText(/-10%/)).toBeInTheDocument();
  });

  it('renders featured badges', () => {
    render(React.createElement(PackagesPage));
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('has details links', () => {
    render(React.createElement(PackagesPage));
    const detailsLinks = screen.getAllByText('Details');
    expect(detailsLinks.length).toBe(2);
    expect(detailsLinks[0].closest('a')).toHaveAttribute('href', '/packages/kashmir-golden-tour');
  });

  it('has book now buttons', () => {
    render(React.createElement(PackagesPage));
    const bookNowBtns = screen.getAllByText('Book Now');
    expect(bookNowBtns.length).toBe(2);
  });
});
