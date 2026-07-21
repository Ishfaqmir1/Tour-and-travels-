/**
 * Admin Dashboard Page - Unit Tests
 * ===================================
 * Tests the admin dashboard landing page (admin/page.tsx):
 * - Welcome section with "Dashboard Overview" and agency name
 * - All 6 stats cards (Packages, Destinations, Bookings, Messages, Users, Testimonials)
 * - Stats card links to correct admin sections
 * - Quick Actions section with all 6 action links
 * - Action link hrefs point to correct admin routes
 *
 * Tests the AdminPage component directly (without the AdminLayout wrapper)
 * to focus on the dashboard content without side navigation complexity.
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Admin User', email: 'admin@test.com', is_super_admin: true },
    isAuthenticated: true,
    isSuperAdmin: true,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

// Directly test AdminPage, not the layout wrapper
const AdminPage = jest.requireActual('@/app/admin/page').default;

describe('Admin Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome section', () => {
    render(React.createElement(AdminPage));
    expect(screen.getByText(/Dashboard Overview/)).toBeInTheDocument();
    expect(screen.getByText(/Welcome Back/)).toBeInTheDocument();
  });

  it('renders the agency name', () => {
    render(React.createElement(AdminPage));
    expect(screen.getByText(/THE VICEROY TOUR & TRAVELS/)).toBeInTheDocument();
  });

  it('renders all stats cards', () => {
    render(React.createElement(AdminPage));
    expect(screen.getByText('Total Packages')).toBeInTheDocument();
    expect(screen.getByText('Destinations')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
  });

  it('stats cards link to correct admin sections', () => {
    render(React.createElement(AdminPage));
    const packagesLink = screen.getByText('Total Packages').closest('a');
    expect(packagesLink).toHaveAttribute('href', '/admin/packages');

    const bookingsLink = screen.getByText('Bookings').closest('a');
    expect(bookingsLink).toHaveAttribute('href', '/admin/bookings');
  });

  it('renders quick actions section', () => {
    render(React.createElement(AdminPage));
    expect(screen.getByText(/Quick Actions/)).toBeInTheDocument();
  });

  it('renders all quick action links', () => {
    render(React.createElement(AdminPage));
    expect(screen.getByText('Add Package')).toBeInTheDocument();
    expect(screen.getByText('Add Destination')).toBeInTheDocument();
    expect(screen.getByText('Add Hotel')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Website Settings')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('quick action links navigate correctly', () => {
    render(React.createElement(AdminPage));
    const addPackageLink = screen.getByText('Add Package').closest('a');
    expect(addPackageLink).toHaveAttribute('href', '/admin/packages');

    const settingsLink = screen.getByText('Website Settings').closest('a');
    expect(settingsLink).toHaveAttribute('href', '/admin/website-settings');
  });
});
