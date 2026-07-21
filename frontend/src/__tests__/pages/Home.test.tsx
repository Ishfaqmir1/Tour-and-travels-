import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isSuperAdmin: false,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/components/HeroCarousel', () => ({
  __esModule: true,
  default: () => <div data-testid="hero-carousel">HeroCarousel</div>,
}));

const HomePage = jest.requireActual('@/app/page').default;

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the hero section', () => {
    render(React.createElement(HomePage));
    expect(screen.getByText(/Traveling opens the door/)).toBeInTheDocument();
    expect(screen.getByTestId('hero-carousel')).toBeInTheDocument();
  });

  it('renders services section', () => {
    render(React.createElement(HomePage));
    expect(screen.getByText('Weather Insights')).toBeInTheDocument();
    expect(screen.getByText('Expert Tour Guides')).toBeInTheDocument();
  });

  it('renders why choose us section with all cards', () => {
    render(React.createElement(HomePage));
    expect(screen.getByText('Expert Planning')).toBeInTheDocument();
    expect(screen.getByText('24/7 Support')).toBeInTheDocument();
    expect(screen.getByText('Best Price Guarantee')).toBeInTheDocument();
    expect(screen.getByText('Premium Experiences')).toBeInTheDocument();
  });

  it('renders travel tips section', () => {
    render(React.createElement(HomePage));
    expect(screen.getByText('Plan Ahead')).toBeInTheDocument();
    expect(screen.getByText('Pack Smart')).toBeInTheDocument();
  });

  it('renders gallery section', () => {
    render(React.createElement(HomePage));
    expect(screen.getByRole('heading', { name: /travel stories/i })).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    render(React.createElement(HomePage));
    expect(screen.getByText(/Ready to Start Your Journey/)).toBeInTheDocument();
  });

  it('renders newsletter section', () => {
    render(React.createElement(HomePage));
    expect(screen.getByText(/Subscribe for Travel Tips/)).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(React.createElement(HomePage));
    const discoverHeadings = screen.getAllByText('Discover');
    expect(discoverHeadings.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
  });

  it('has Find a Guide CTA in hero', () => {
    render(React.createElement(HomePage));
    const findGuideBtn = screen.getByText('Find a Guide');
    expect(findGuideBtn.closest('a')).toHaveAttribute('href', '/tourguide');
  });
});
