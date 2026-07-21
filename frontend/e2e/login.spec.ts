/**
 * Login Flow End-to-End Tests
 * ============================
 *
 * Tests all authentication scenarios for the login page:
 * - Form rendering with email/password fields and submit button
 * - Client-side validation (React Hook Form + Zod) on empty submission
 * - Successful login with valid credentials (requires seeded backend)
 * - Error state display with invalid credentials
 * - Navigation links to forgot-password and sign-up pages
 *
 * Dependencies:
 * - Backend API must be running on port 8080 for login submission tests
 * - Database must be seeded with the test user credentials
 */

import { test, expect } from '@playwright/test';
import { visit, TEST_USER, ADMIN_USER } from './helpers';

test.describe('Login Flow', () => {
  /**
   * Verifies the login page renders with all required form elements
   * including the heading, email input, password input, and submit button.
   */
  test('should display the login page with form fields', async ({ page }) => {
    await visit(page, '/login');

    // Check heading
    await expect(page.locator('h2')).toContainText('Welcome Back');

    // Form fields must be present and interactive
    await expect(page.locator('input[placeholder="Email Address"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Login');
  });

  /**
   * Tests client-side form validation by submitting an empty form.
   * React Hook Form with Zod resolver should show validation errors
   * synchronously without making any API calls.
   */
  test('should show validation errors with empty form submission', async ({ page }) => {
    await visit(page, '/login');

    // Submit the form without any input
    await page.click('button[type="submit"]');

    // Validation errors render synchronously via Zod + React Hook Form
    await page.waitForSelector('.error-message, .error-text, .has-error', { timeout: 3_000 });
    const hasValidationError = await page.locator('.error-message, .error-text, .has-error').count();
    expect(hasValidationError).toBeGreaterThanOrEqual(1);
  });

  /**
   * Tests the full login flow with valid credentials.
   * After successful login:
   * - User is redirected to /profile (regular user) or /admin (admin)
   * - JWT token is stored in localStorage for subsequent API calls
   *
   * NOTE: Requires running backend with seeded test user.
   */
  test('should successfully login as a regular user', async ({ page }) => {
    // Clear any existing auth state to start fresh
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await visit(page, '/login');

    // Fill in valid credentials from seed data
    await page.fill('input[placeholder="Email Address"]', TEST_USER.email);
    await page.fill('input[placeholder="Password"]', TEST_USER.password);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for redirect to profile page (success indicator)
    await page.waitForURL(/\/profile|\/admin/, { timeout: 15_000 });
    await page.waitForLoadState('networkidle');

    // Verify JWT token was persisted to localStorage by the auth service
    const token = await page.evaluate(() => localStorage.getItem('jwt_token'));
    expect(token).toBeTruthy();
  });

  /**
   * Tests the error state when invalid credentials are submitted.
   * The backend should return a 401 error, and the frontend should
   * display an error message alert to the user.
   *
   * NOTE: Requires running backend (will respond with auth error).
   */
  test('should show error with invalid credentials', async ({ page }) => {
    // Clear any existing state
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await visit(page, '/login');

    // Fill in credentials that don't exist in the database
    await page.fill('input[placeholder="Email Address"]', 'wrong@email.com');
    await page.fill('input[placeholder="Password"]', 'wrongpassword');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for the error alert to appear (backend responds with error message)
    await page.waitForSelector('.login-alert, .alert', { timeout: 10_000 });
    const hasError = await page.locator('.login-alert, .alert').count();
    expect(hasError).toBeGreaterThanOrEqual(1);
  });

  /**
   * Tests that the login page provides navigation to auxiliary pages:
   * - Forgot Password: for password recovery flow
   * - Sign Up: for new user registration
   *
   * These links are critical for user experience and should go directly
   * to the correct routes.
   */
  test('should have navigation to forgot password and sign up pages', async ({ page }) => {
    await visit(page, '/login');

    // Verify forgot password link exists and points to correct route
    const forgotLink = page.locator('a:has-text("Forgot Password")');
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute('href', '/forgot-password');

    // Verify sign up link exists and points to correct route
    const signUpLink = page.locator('a:has-text("Sign Up")');
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute('href', '/signup');
  });
});
