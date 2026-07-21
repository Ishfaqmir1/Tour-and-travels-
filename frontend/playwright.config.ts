/**
 * Playwright End-to-End Test Configuration
 * =========================================
 *
 * This configuration defines the E2E testing setup for the Viceroy Tour & Travels
 * frontend application. Tests simulate real user interactions across critical flows:
 * browsing packages, login/authentication, booking, and contact form submission.
 *
 * Test Environment:
 * - Requires the Next.js dev server running on port 3000
 * - Requires the backend NestJS API running on port 8080 (for authenticated flows)
 * - Runs tests across both Desktop Chrome and Mobile Chrome (Pixel 5) viewports
 *
 * Usage:
 *   npm run test:e2e          - Run all tests headlessly
 *   npm run test:e2e:headed   - Run with visible browser for debugging
 *   npm run test:e2e:ui       - Open Playwright UI mode for interactive debugging
 *
 * @see https://playwright.dev/docs/test-configuration
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  // ── Test Discovery ───────────────────────────────────────────────
  // All test files live in the `e2e/` directory and follow the *.spec.ts pattern
  testDir: './e2e',

  // Run tests sequentially (not in parallel) to avoid auth state conflicts
  // since login/session state is shared across tests via localStorage
  fullyParallel: false,

  // Fail CI if any test file has test.only() — prevents accidental focused tests
  forbidOnly: !!process.env.CI,

  // Retry flaky tests: 2 retries in CI, 1 retry locally
  retries: process.env.CI ? 2 : 1,

  // Only 1 worker to ensure sequential login state doesn't conflict
  workers: 1,

  // ── Reporting ────────────────────────────────────────────────────
  reporter: [
    // HTML report with visual diffs and screenshots
    ['html', { outputFolder: 'playwright-report' }],
    // Console list reporter for real-time feedback
    ['list'],
  ],

  // ── Timeouts ─────────────────────────────────────────────────────
  // Per-test timeout (includes all actions within a single test)
  timeout: 60_000,

  // Timeout for individual expect() assertions
  expect: {
    timeout: 10_000,
  },

  // ── Shared Test Options ──────────────────────────────────────────
  use: {
    // Base URL for the Next.js frontend — override via PLAYWRIGHT_BASE_URL env var
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Capture Playwright trace on first retry for debugging failures
    trace: 'on-first-retry',

    // Automatically screenshot the page when a test fails
    screenshot: 'only-on-failure',
  },

  // ── Test Projects ────────────────────────────────────────────────
  // Each project runs ALL tests in isolation with its own browser context
  projects: [
    {
      // Desktop Chrome — standard 1280×800 viewport
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      // Mobile Chrome — Pixel 5 viewport (393×851) for responsive testing
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
});
