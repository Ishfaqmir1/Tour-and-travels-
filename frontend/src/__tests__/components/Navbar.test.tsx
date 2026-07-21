import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '@/components/Navbar';

// Mock auth context
const mockUseAuth = {
  user: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  logout: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  refreshUser: jest.fn(),
  loading: false,
};

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth,
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    mockUseAuth.user = null;
    mockUseAuth.isAuthenticated = false;
    mockUseAuth.isSuperAdmin = false;
  });

  it('renders the logo and brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('Voice Roy')).toBeInTheDocument();
    expect(screen.getByText(/Tour and Travels/)).toBeInTheDocument();
  });

  it('renders navigation links for unauthenticated users', () => {
    render(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Tour Guide')).toBeInTheDocument();
    expect(screen.getByText('Packages')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders login and register buttons for unauthenticated users', () => {
    render(<Navbar />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('renders profile button for authenticated users', () => {
    mockUseAuth.isAuthenticated = true;
    mockUseAuth.user = { id: 1, name: 'Test User', email: 'test@test.com' };
    render(<Navbar />);
    expect(screen.getByText(/Profile/)).toBeInTheDocument();
  });

  it('does not show login/register when authenticated', () => {
    mockUseAuth.isAuthenticated = true;
    mockUseAuth.user = { id: 1, name: 'Test User', email: 'test@test.com' };
    render(<Navbar />);
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('renders admin dashboard link for super admin', () => {
    mockUseAuth.isSuperAdmin = true;
    mockUseAuth.isAuthenticated = true;
    mockUseAuth.user = { id: 1, name: 'Admin', email: 'admin@test.com', is_super_admin: true };
    render(<Navbar />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('hamburger menu toggles on click', () => {
    render(<Navbar />);
    const hamburger = screen.getByLabelText('Open menu');
    fireEvent.click(hamburger);
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('has correct link hrefs', () => {
    render(<Navbar />);
    const homeLink = screen.getByText('Home').closest('a');
    const packagesLink = screen.getByText('Packages').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    expect(packagesLink).toHaveAttribute('href', '/packages');
  });
});
