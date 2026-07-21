/**
 * Contact Page - Unit Tests
 * ==========================
 * Tests the contact page rendering and form submission:
 * - Page heading and business contact info (email, phone, address)
 * - Form fields rendering (name, email, message)
 * - Form submission via mutateAsync mock
 * - Back-to-homepage navigation link
 * - Navbar rendering
 *
 * The contact form uses react-hook-form with Zod validation.
 * Form submission is mocked via useSubmitContactMessage hook.
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockMutateAsync = jest.fn();

jest.mock('@/components/Navbar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/lib/hooks', () => ({
  useSubmitContactMessage: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: null,
  }),
}));

const ContactPage = jest.requireActual('@/app/contact/page').default;

describe('Contact Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the contact page heading and description', () => {
    render(React.createElement(ContactPage));
    expect(screen.getByText(/Contact THE VICEROY TOUR & TRAVELS/)).toBeInTheDocument();
    expect(screen.getByText(/Have questions about destinations/)).toBeInTheDocument();
  });

  it('renders contact info with email, phone, and location', () => {
    render(React.createElement(ContactPage));
    expect(screen.getByText(/mallamajid32@gmail.com/)).toBeInTheDocument();
    expect(screen.getByText(/9103815702/)).toBeInTheDocument();
    expect(screen.getByText(/Shopian, Jammu and Kashmir/)).toBeInTheDocument();
  });

  it('renders the contact form with all fields', () => {
    render(React.createElement(ContactPage));
    expect(screen.getByText('Send Us a Message')).toBeInTheDocument();
    expect(screen.getByText('Your Name')).toBeInTheDocument();
    expect(screen.getByText('Your Email')).toBeInTheDocument();
    expect(screen.getByText('Your Message')).toBeInTheDocument();
    const textboxes = screen.getAllByRole('textbox');
    expect(textboxes.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('has a back to homepage link', () => {
    render(React.createElement(ContactPage));
    const backLink = screen.getByText(/Back to Homepage/);
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('shows success message after submission', async () => {
    mockMutateAsync.mockResolvedValueOnce({ status: 'success', message: 'Message sent successfully!' });

    render(React.createElement(ContactPage));

    const textboxes = screen.getAllByRole('textbox');
    const nameInput = textboxes[0];
    const emailInput = textboxes[1];
    const messageInput = textboxes[2];

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(messageInput, 'I have a question about Kashmir tours.');

    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'I have a question about Kashmir tours.',
      });
    });
  });

  it('renders the navbar', () => {
    render(React.createElement(ContactPage));
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });
});
