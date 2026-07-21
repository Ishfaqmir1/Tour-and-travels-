/**
 * Playwright E2E Test Helpers
 * ============================
 *
 * Shared utilities and configuration for end-to-end browser tests.
 * Provides reusable functions for navigation, authentication, and test data
 * that are used across all test spec files.
 *
 * Key Features:
 * - Pre-configured test user credentials matching backend seed data
 * - Safe navigation helper that waits for full page hydration
 * - Authentication helper that handles login form interaction and state cleanup
 *
 * @see prisma/seed.ts for the corresponding seed data credentials
 */

import { Page } from '@playwright/test';

// ════════════════════════════════════════════════════════════════════
//  TEST USER CREDENTIALS
// ════════════════════════════════════════════════════════════════════
// These credentials MUST match the users seeded by `prisma/seed.ts`.
// The backend must be running and seeded for login-dependent tests.
// ════════════════════════════════════════════════════════════════════

/** Standard test user — has regular (non-admin) role permissions */
export const TEST_USER = {
  email: 'user@viceroytravels.com',
  password: 'password123',
  name: 'Test User',
};

/** Admin test user — has super_admin role with full system access */
export const ADMIN_USER = {
  email: 'admin@viceroytravels.com',
  password: 'password123',
  name: 'Admin',
};

/** Slug of a package expected to exist in the seeded database */
export const PACKAGE_SLUG = 'kashmir-golden-tour';

/** Display title of the seeded test package */
export const PACKAGE_TITLE = 'Kashmir Golden Tour';

// ════════════════════════════════════════════════════════════════════
//  NAVIGATION HELPERS
// ════════════════════════════════════════════════════════════════════

/**
 * Navigate to a page and wait for it to be fully loaded and hydrated.
 *
 * Uses `networkidle` to ensure all XHR/fetch requests complete before
 * proceeding. This is critical for Next.js pages that fetch data from
 * the backend API on mount.
 *
 * @param page - Playwright Page instance
 * @param path - URL path to navigate to (e.g., '/packages', '/login')
 *
 * @example
 *   await visit(page, '/packages');  // Navigate to packages listing
 *   await visit(page, `/packages/${slug}/book`);  // Navigate to booking page
 */
export async function visit(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Log in as the standard test user via the login page UI.
 *
 * This helper:
 * 1. Clears any existing localStorage/sessionStorage auth state
 * 2. Navigates to /login
 * 3. Fills in the email and password fields
 * 4. Submits the form
 * 5. Waits for redirect to /profile or /admin
 *
 * IMPORTANT: The backend server must be running and seeded for this to work.
 *
 * @param page - Playwright Page instance
 *
 * @example
 *   await loginAsUser(page);
 *   await visit(page, '/profile');  // Now authenticated
 */
export async function loginAsUser(page: Page) {
  // ── Step 1: Clear any stale auth state from previous tests ──────────
  // localStorage holds JWT token and user data; sessionStorage may hold
  // temporary redirect params. Clearing both ensures a clean login flow.
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // ── Step 2: Navigate to the login page ─────────────────────────────
  await visit(page, '/login');

  // ── Step 3: Wait for the login form to fully render ────────────────
  // The login form is rendered client-side with framer-motion animations.
  // We wait for the email input to confirm the form is ready.
  await page.waitForSelector('input[placeholder="Email Address"]', { timeout: 10_000 });

  // ── Step 4: Fill in credentials ────────────────────────────────────
  await page.fill('input[placeholder="Email Address"]', TEST_USER.email);
  await page.fill('input[placeholder="Password"]', TEST_USER.password);

  // ── Step 5: Submit the login form ──────────────────────────────────
  await page.click('button[type="submit"]');

  // ── Step 6: Wait for successful login redirect ─────────────────────
  // On success, the app redirects to /profile (regular user) or /admin (admin).
  // If this times out, check that the backend is running and seeded.
  await page.waitForURL(/\/profile|\/admin/, { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Get the JWT auth token from localStorage after login.
 *
 * Useful for verifying that authentication was successful and the token
 * was properly stored by the app.
 *
 * @param page - Playwright Page instance
 * @returns The JWT token string, or null if not authenticated
 *
 * @example
 *   await loginAsUser(page);
 *   const token = await getAuthToken(page);
 *   expect(token).toBeTruthy();
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem('jwt_token'));
}
