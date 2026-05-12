import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Go to welcome page and click Sign In
  await page.goto('https://kayosports.com.au/en-AU/welcome', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Click Sign In button
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for email field
  await page.locator('[data-test-id="EMAIL"]').waitFor({ timeout: 30000 });
  await page.locator('[data-test-id="EMAIL"]').fill(process.env.KAYO_EMAIL!);
  await page.locator('[data-test-id="refined-button-signin"]').click();

  // Wait for password field
  await page.locator('[data-test-id="PASSWORD"]').waitFor({ timeout: 15000 });
  await page.locator('[data-test-id="PASSWORD"]').fill(process.env.KAYO_PASSWORD!);
  await page.locator('[data-test-id="refined-button-signin"]').click();

  // Wait for Who's Watching screen
  await page.waitForSelector('text=Who\'s Watching', { timeout: 30000 });

  // Click Create Profile
  await page.getByText('Create Profile').click();

  // Fill profile name
  await page.waitForSelector('input[type="text"]', { timeout: 10000 });
  const profileName = 'Raj' + Date.now();
  await page.getByRole('textbox').fill(profileName);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Done' }).click();

  // Verify profile appears
  await page.waitForSelector('text=Who\'s Watching', { timeout: 15000 });
  await expect(page.getByText(profileName)).toBeVisible();
});
