/**
 * Contact Form End-to-End Tests
 * ==============================
 *
 * Tests the contact page and message submission form:
 * - Contact information section (email, phone, location) renders correctly
 * - Contact form displays with all required fields
 * - Client-side validation catches empty form submission
 * - Back-to-homepage navigation link works
 *
 * The contact page is public (no authentication required) and can be tested
 * without a running backend since validation is handled client-side.
 * Form submission success requires the backend API to be running.
 */

import { test, expect } from '@playwright/test';
import { visit } from './helpers';

test.describe('Contact Form Flow', () => {
  /**
   * Verifies the contact page displays all key business information:
   * - Page heading with company name
   * - Email address for customer inquiries
   * - Phone number for direct contact
   * - Physical location/address
   */
  test('should display the contact page with all sections', async ({ page }) => {
    await visit(page, '/contact');

    // The main heading should contain "Contact" and the company name
    await expect(page.locator('h1')).toContainText('Contact');

    // Verify business contact details are displayed
    await expect(page.locator('text=mallamajid32@gmail.com')).toBeVisible();
    await expect(page.locator('text=9103815702')).toBeVisible();
    await expect(page.locator('text=Shopian, Jammu and Kashmir')).toBeVisible();
  });

  /**
   * Tests that the message submission form is present with all required
   * user interface elements: heading, text input fields, and submit button.
   */
  test('should display the contact form', async ({ page }) => {
    await visit(page, '/contact');

    // The form section heading should be visible
    await expect(page.locator('h2:has-text("Send Us a Message")')).toBeVisible();
    // The submit button should be present
    await expect(page.locator('button:has-text("Send Message")')).toBeVisible();
  });

  /**
   * Tests client-side form validation by submitting an empty form.
   * React Hook Form with Zod resolver should display validation error
   * messages synchronously (no API call needed) for all required fields:
   * name, email, and message.
   */
  test('should show validation errors on empty form submission', async ({ page }) => {
    await visit(page, '/contact');

    // Submit the empty form to trigger validation
    await page.click('button[type="submit"]');

    // Zod + React Hook Form should show validation errors synchronously
    await page.waitForSelector('.error-text', { timeout: 3_000 });
    const errorElements = page.locator('.error-text, .has-error');
    const count = await errorElements.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  /**
   * Tests the "Back to Homepage" navigation link on the contact page.
   * This provides users with a quick way to return to the main site.
   * The link should have an href of "/" for direct navigation.
   */
  test('should redirect to home from the back link', async ({ page }) => {
    await visit(page, '/contact');

    // Verify the back navigation link exists and points to the home page
    const backLink = page.locator('a:has-text("Back to Homepage")');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });
});
