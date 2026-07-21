import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockCreateBooking = jest.fn();

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@test.com' },
    isAuthenticated: true,
    isSuperAdmin: false,
    loading: false,
  }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/lib/hooks', () => ({
  usePackage: () => ({
    data: {
      id: 1,
      slug: 'test-package',
      title: 'Test Package',
      image: 'https://example.com/img.jpg',
      location: 'Test Location',
      country: 'Test Country',
      duration: '3 Days',
      price: 10000,
      discount_percent: 20,
      overview: 'A test package',
    },
    isLoading: false,
  }),
  useCreateBooking: () => ({
    mutateAsync: mockCreateBooking,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  useParams: () => ({ slug: 'test-package' }),
  usePathname: () => '/packages/test-package/book',
  useSearchParams: () => new URLSearchParams(),
}));

const BookingPage = jest.requireActual('@/app/packages/[slug]/book/page').default;

describe('Booking Form Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders booking form', () => {
    render(React.createElement(BookingPage));
    expect(screen.getByText(/Book Your Package/)).toBeInTheDocument();
  });

  it('shows order summary with package details', () => {
    render(React.createElement(BookingPage));
    const packageNames = screen.getAllByText('Test Package');
    expect(packageNames.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Booking Summary/)).toBeInTheDocument();
  });

  it('shows discount in summary when applicable', () => {
    render(React.createElement(BookingPage));
    expect(screen.getByText(/-20%/)).toBeInTheDocument();
  });

  it('shows breadcrumb navigation', () => {
    render(React.createElement(BookingPage));
    expect(screen.getByText(/All Packages/)).toBeInTheDocument();
  });
});
