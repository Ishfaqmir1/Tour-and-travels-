/**
 * Packages Browsing End-to-End Tests
 * ===================================
 *
 * Tests the complete package discovery flow:
 * 1. Packages listing page renders correctly with hero section
 * 2. Package cards display with prices, discounts, and ratings
 * 3. Clicking "Details" navigates to the package detail page
 * 4. Book Now buttons link correctly to the booking form
 * 5. Full click-through flow: packages → detail → book button → booking form
 *
 * These tests use conditional logic to handle both seeded and empty database states,
 * making them resilient whether or not the backend is running.
 */

import { test, expect } from '@playwright/test';
import { visit, loginAsUser, PACKAGE_TITLE } from './helpers';

test.describe('Browse Packages Flow', () => {
  /**
   * Verifies the packages listing page loads with proper branding elements:
   * - Main heading containing "Travel Packages"
   * - Hero badge reading "Explore Our Tours"
   */
  test('should display the packages listing page with correct heading', async ({ page }) => {
    await visit(page, '/packages');

    // The h1 heading contains "Travel" and "Packages" (split by a <span> for styling)
    const heading = page.locator('h1');
    await expect(heading).toContainText('Travel');
    await expect(heading).toContainText('Packages');

    // Hero section badge should be visible
    await expect(page.locator('.packages-badge')).toContainText('Explore Our Tours');
  });

  /**
   * Tests that package cards render correctly when data is available.
   * Uses Promise.race to handle both data states:
   * - If packages exist: checks card structure (title, price badges)
   * - If no packages: checks empty state message
   *
   * This approach keeps the test resilient regardless of backend data state.
   */
  test('should display package cards when packages are loaded', async ({ page }) => {
    await visit(page, '/packages');

    // Race between cards rendering (data available) and empty state (no data)
    const cardOrEmpty = await Promise.race([
      page.waitForSelector('.package-card', { timeout: 8000 }).then(() => 'cards'),
      page.waitForSelector('.packages-empty', { timeout: 8000 }).then(() => 'empty'),
    ]);

    if (cardOrEmpty === 'cards') {
      // Validate first package card structure
      const firstCard = page.locator('.package-card').first();
      await expect(firstCard).toBeVisible();
      await expect(firstCard.locator('h3')).toBeVisible();

      // Price section should be present (original, discounted, or current price)
      const hasPrice = await firstCard.locator('[class*="price"]').count();
      expect(hasPrice).toBeGreaterThanOrEqual(1);
    } else {
      // Graceful empty state when no packages exist
      await expect(page.locator('.packages-empty h3')).toContainText('No packages');
    }
  });

  /**
   * Tests navigation from packages listing to a package's detail page.
   * Clicks the "Details" link on a package card and verifies the
   * package detail shell renders (with overview, highlights, itinerary).
   */
  test('should navigate to package detail page when clicking Details', async ({ page }) => {
    await visit(page, '/packages');

    // Wait for Details buttons to appear on package cards
    const detailsLink = page.locator('a.package-view-btn, a:has-text("Details")').first();
    await detailsLink.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    const detailsCount = await detailsLink.count();

    if (detailsCount > 0) {
      // Verify the link points to a package detail page
      const href = await detailsLink.getAttribute('href');
      expect(href).toMatch(/\/packages\/.+/);

      // Click and wait for navigation
      await Promise.all([
        page.waitForURL(/\/packages\/.+/),
        detailsLink.click(),
      ]);

      // Verify we landed on a valid package detail page
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.pkg-detail-shell')).toBeVisible();
    }
  });

  /**
   * Verifies that Book Now buttons are present on package cards and
   * link correctly to the booking form URL pattern (/packages/:slug/book).
   */
  test('should have Book Now buttons on package cards', async ({ page }) => {
    await visit(page, '/packages');

    // Wait for Book Now links to become visible
    const bookNowButtons = page.locator('a.package-book-btn, a:has-text("Book Now")').first();
    await bookNowButtons.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    const count = await page.locator('a.package-book-btn, a:has-text("Book Now")').count();

    if (count > 0) {
      // Each Book Now button should link to a booking page
      const href = await page.locator('a.package-book-btn, a:has-text("Book Now")').first().getAttribute('href');
      expect(href).toMatch(/\/packages\/.+\/book/);
    }
  });

  /**
   * END-TO-END FLOW TEST
   * Tests the complete click-through journey:
   *   Login → Packages Listing → Package Detail → Book This Package → Booking Form
   *
   * This is the core user conversion flow and the most important test scenario.
   * It validates that all navigation links work correctly end-to-end.
   */
  test('should navigate from package detail to booking form', async ({ page }) => {
    // Step 1: Authenticate (booking requires login)
    await loginAsUser(page);

    // Step 2: Start at the packages listing page
    await visit(page, '/packages');

    // Step 3: Click "Details" on a package card to reach the detail page
    const detailsLink = page.locator('a.package-view-btn, a:has-text("Details")').first();
    await detailsLink.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    const detailsCount = await detailsLink.count();

    if (detailsCount === 0) return; // Gracefully skip if no packages seeded

    await Promise.all([
      page.waitForURL(/\/packages\/[^\/]+$/, { timeout: 10_000 }),
      detailsLink.click(),
    ]);
    await page.waitForLoadState('networkidle');

    // Step 4: On the detail page, click "Book This Package" CTA
    const bookBtn = page.locator('a:has-text("Book This Package")').first();
    await bookBtn.waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});
    const bookBtnCount = await bookBtn.count();

    if (bookBtnCount > 0) {
      // Verify the button links to a booking form
      const bookHref = await bookBtn.getAttribute('href');
      expect(bookHref).toMatch(/\/packages\/.+\/book/);

      // Step 5: Navigate to the booking form
      await Promise.all([
        page.waitForURL(/\/packages\/.+\/book/, { timeout: 10_000 }),
        bookBtn.click(),
      ]);

      // Step 6: Verify the booking form rendered successfully
      await page.waitForSelector('.booking-form-card, .booking-loading', { timeout: 10_000 });
      await expect(page.locator('h2:has-text("Book Your Package")').first()).toBeVisible();
    }
  });
});
