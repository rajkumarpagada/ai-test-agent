import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://kayosports.com.au/en-AU/welcome');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.locator('[data-test-id="EMAIL"]').click();
  await page.locator('[data-test-id="EMAIL"]').fill(process.env.KAYO_EMAIL!);
  await page.locator('[data-test-id="refined-button-signin"]').click();
  await page.locator('[data-test-id="PASSWORD"]').fill(process.env.KAYO_PASSWORD!);
  await page.locator('[data-test-id="refined-button-signin"]').click();
  await page.getByText('Create Profile').click();
  await page.getByRole('textbox').click();
  const profileName = 'Raj' + Date.now();
  await page.getByRole('textbox').fill(profileName);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
});