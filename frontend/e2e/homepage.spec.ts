/**
 * Homepage End-to-End Tests
 * =========================
 *
 * Validates the public-facing homepage renders correctly with all key sections:
 * - Hero section with branding and CTA buttons
 * - Navigation to the tour guide discovery page
 * - Footer with company information and social links
 *
 * These tests require only the frontend dev server (no backend needed) since
 * the homepage is primarily static content with client-side animations.
 */

import { test, expect } from '@playwright/test';
import { visit } from './helpers';

test.describe('Homepage Flow', () => {
  /**
   * Verifies the hero section renders with the company branding and
   * a visible heading. The hero is the first thing users see and must
   * convey the brand identity immediately.
   */
  test('should display the homepage and hero section', async ({ page }) => {
    await visit(page, '/');

    // The main heading should be visible (part of the animated hero)
    await expect(page.locator('h1')).toBeVisible();

    // Brand name must appear prominently in the hero content area
    // This text is rendered by the <p> tag below the h1 heading
    await expect(page.locator('text=THE VICEROY TOUR & TRAVELS')).toBeVisible();
  });

  /**
   * Tests the primary CTA (Call to Action) on the homepage.
   * "Find a Guide" is the main conversion button — clicking it should
   * navigate users to the tour guide selection page where they can
   * browse destinations and hire local guides.
   *
   * Uses Promise.all to click and wait for navigation simultaneously,
   * preventing race conditions between the click action and URL change.
   */
  test('should have working navigation to tour guide page', async ({ page }) => {
    await visit(page, '/');

    // Locate the primary CTA button in the hero section
    const findGuideBtn = page.locator('a:has-text("Find a Guide")').first();
    await expect(findGuideBtn).toBeVisible();

    // Click and wait for navigation to complete
    await Promise.all([
      page.waitForURL('/tourguide', { timeout: 10_000 }),
      findGuideBtn.click(),
    ]);

    // Verify we actually landed on the tour guide page
    await expect(page).toHaveURL(/\/tourguide/);
  });

  /**
   * Validates the footer section renders with company branding.
   * The footer contains essential information: company name, navigation
   * links, social media, and contact details.
   *
   * We scroll to the bottom first since the footer is below the fold
   * and may not be in the initial viewport.
   */
  test('footer should have company info and social links', async ({ page }) => {
    await visit(page, '/');

    // Scroll to the bottom of the page to ensure footer is in view
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Verify core brand information appears in the footer
    await expect(page.locator('footer')).toContainText('VICEROY');
    await expect(page.locator('footer')).toContainText('TOUR & TRAVELS');
  });
});
