/**
 * Profile Page - Unit Tests
 * =========================
 * Tests the ProfilePageContent component (bypassing the dynamic import wrapper):
 * - User name display in header
 * - Personal information section (name, email, phone, address)
 * - Package bookings list with status badges
 * - Hired tour guides section
 * - Change password and logout buttons
 * - Edit button for personal info
 *
 * All API hooks (useMyProfile, useMyPayments, useMyBookings) are mocked
 * to return controlled test data. Auth state is mocked as authenticated.
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

const mockLogout = jest.fn();
const mockUseAuth = {
  user: { id: 1, name: 'Test User', email: 'test@test.com' },
  isAuthenticated: true,
  isSuperAdmin: false,
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: mockLogout,
  refreshUser: jest.fn(),
};

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => '/profile',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/lib/hooks', () => ({
  useMyProfile: () => ({
    data: {
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      phone: '+911234567890',
      address: 'Test Address, Kashmir',
    },
    isLoading: false,
    error: null,
  }),
  useMyPayments: () => ({
    data: [
      {
        id: 1,
        guide: { name: 'Guide Ali', location: 'Srinagar' },
        days: 3,
        amount: 5000,
        status: 'completed',
        paid_at: '2026-06-15T10:00:00Z',
        transaction_id: 'TXN001',
      },
    ],
    isLoading: false,
  }),
  useMyBookings: () => ({
    data: [
      {
        id: 1,
        package: { title: 'Kashmir Golden Tour' },
        travel_date: '2026-07-20T00:00:00Z',
        status: 'confirmed',
        created_at: '2026-06-10T10:00:00Z',
        travelers: 2,
        amount: 30000,
        transaction_id: 'TXN002',
      },
    ],
    isLoading: false,
  }),
  useUpdateProfile: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useChangePassword: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

jest.mock('react-hot-toast', () => ({
  default: { success: jest.fn(), error: jest.fn() },
  success: jest.fn(),
  error: jest.fn(),
  Toaster: () => null,
}));

const ProfilePageContent = jest.requireActual('@/app/profile/ProfilePageContent').default;

describe('Profile Page Content', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.isAuthenticated = true;
    mockUseAuth.user = { id: 1, name: 'Test User', email: 'test@test.com' };
  });

  it('renders the user name in the header', () => {
    render(React.createElement(ProfilePageContent));
    const nameElements = screen.getAllByText('Test User');
    expect(nameElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders personal information section', () => {
    render(React.createElement(ProfilePageContent));
    expect(screen.getByText(/Personal Information/)).toBeInTheDocument();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
    expect(screen.getByText('+911234567890')).toBeInTheDocument();
    expect(screen.getByText('Test Address, Kashmir')).toBeInTheDocument();
  });

  it('renders package bookings section', () => {
    render(React.createElement(ProfilePageContent));
    expect(screen.getByText(/Package Bookings/)).toBeInTheDocument();
    expect(screen.getByText('Kashmir Golden Tour')).toBeInTheDocument();
  });

  it('renders hired tour guides section', () => {
    render(React.createElement(ProfilePageContent));
    expect(screen.getByText(/Hired Tour Guides/)).toBeInTheDocument();
    expect(screen.getByText('Guide Ali')).toBeInTheDocument();
  });

  it('shows change password and logout buttons', () => {
    render(React.createElement(ProfilePageContent));
    expect(screen.getByText(/Change Password/)).toBeInTheDocument();
    expect(screen.getByText(/Logout/)).toBeInTheDocument();
  });

  it('renders the navbar', () => {
    render(React.createElement(ProfilePageContent));
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('shows edit button for personal info', () => {
    render(React.createElement(ProfilePageContent));
    const editBtn = screen.getByText('Edit');
    expect(editBtn).toBeInTheDocument();
  });

  it('renders booking status badges', () => {
    render(React.createElement(ProfilePageContent));
    expect(screen.getByText('confirmed')).toBeInTheDocument();
  });
});
