import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://kayosports.com.au/en-AU/welcome', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.locator('[data-test-id="EMAIL"]').waitFor({ timeout: 30000 });
  await page.locator('[data-test-id="EMAIL"]').fill(process.env.KAYO_EMAIL!);
  await page.locator('[data-test-id="refined-button-signin"]').click();

  await page.locator('[data-test-id="PASSWORD"]').waitFor({ timeout: 15000 });
  await page.locator('[data-test-id="PASSWORD"]').fill(process.env.KAYO_PASSWORD!);
  await page.locator('[data-test-id="refined-button-signin"]').click();

  // Wait for navigation after login
  await page.waitForTimeout(10000);

  // Take screenshot and log URL to see where we land
  console.log('Current URL after login:', page.url());
  await page.screenshot({ path: 'test-results/after-login.png', fullPage: true });

  // Log page title
  console.log('Page title:', await page.title());
  console.log('Page content snippet:', await page.locator('body').innerText().then(t => t.substring(0, 500)));
});
