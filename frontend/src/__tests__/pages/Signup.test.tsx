import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockRegister = jest.fn();
const mockUseAuth = {
  user: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  loading: false,
  login: jest.fn(),
  register: mockRegister,
  logout: jest.fn(),
  refreshUser: jest.fn(),
};

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => '/signup',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

const SignupPage = jest.requireActual('@/app/signup/page').default;

describe('Signup Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.isAuthenticated = false;
  });

  it('renders the registration form', () => {
    render(React.createElement(SignupPage));
    expect(screen.getByText(/Create Account/)).toBeInTheDocument();
  });

  it('has link to login page', () => {
    render(React.createElement(SignupPage));
    const loginLink = screen.getByText('Login');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
