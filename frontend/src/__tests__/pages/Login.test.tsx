import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockLogin = jest.fn();
const mockUseAuth = {
  user: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  loading: false,
  login: mockLogin,
  register: jest.fn(),
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
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

const LoginPage = jest.requireActual('@/app/login/page').default;

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.isAuthenticated = false;
    mockUseAuth.user = null;
  });

  it('renders the login form with all fields', () => {
    render(React.createElement(LoginPage));
    expect(screen.getByText(/Welcome Back/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('shows login button', () => {
    render(React.createElement(LoginPage));
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls login with credentials on submit', async () => {
    mockLogin.mockResolvedValueOnce({
      status: 'success',
      user: { id: 1, email: 'test@test.com', is_super_admin: false },
      authorisation: { token: 'fake-token' },
    });

    render(React.createElement(LoginPage));

    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('has a link to forgot password', () => {
    render(React.createElement(LoginPage));
    const forgotLink = screen.getByText(/Forgot Password/);
    expect(forgotLink.closest('a')).toHaveAttribute('href', '/forgot-password');
  });

  it('has a link to sign up page', () => {
    render(React.createElement(LoginPage));
    const signupLink = screen.getByText('Sign Up');
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });
});
