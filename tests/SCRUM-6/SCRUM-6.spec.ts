import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://kayosports.com.au/en-AU/welcome');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.locator('[data-test-id="EMAIL"]').click();
  await page.locator('[data-test-id="EMAIL"]').fill(process.env.KAYO_EMAIL!);
  await page.locator('[data-test-id="refined-button-signin"]').click();
  await page.locator('[data-test-id="PASSWORD"]').fill(process.env.KAYO_PASSWORD!);
  await page.locator('[data-test-id="refined-button-signin"]').click();

  // Wait for Who's Watching screen
  await page.waitForSelector('text=Who\'s Watching', { timeout: 30000 });

  // Click Create Profile
  await page.getByText('Create Profile').click();

  // Wait for profile creation form
  await page.waitForSelector('input[type="text"]', { timeout: 10000 });
  await page.getByRole('textbox').click();
  const profileName = 'Raj' + Date.now();
  await page.getByRole('textbox').fill(profileName);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Done' }).click();

  // Verify profile appears on Who's Watching screen
  await page.waitForSelector('text=Who\'s Watching', { timeout: 15000 });
  await expect(page.getByText(profileName)).toBeVisible();
});
