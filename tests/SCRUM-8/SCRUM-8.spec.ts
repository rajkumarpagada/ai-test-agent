import { test, expect, Page } from '@playwright/test';

class SauceDemoPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://www.saucedemo.com');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-test="username"]', email);
    await this.page.fill('[data-test="password"]', password);
    await this.page.click('[data-test="login-button"]');
    await this.page.waitForURL('**/inventory.html');
  }

  async sortByPriceLowToHigh() {
    await this.page.selectOption('[data-test="product-sort-container"]', 'lohi');
  }

  async getProductPrices(): Promise<number[]> {
    const priceElements = await this.page.locator('.inventory_item_price').all();
    const prices: number[] = [];
    for (const el of priceElements) {
      const text = await el.textContent();
      if (text) {
        prices.push(parseFloat(text.replace('$', '')));
      }
    }
    return prices;
  }

  async getProductNames(): Promise<string[]> {
    const nameElements = await this.page.locator('.inventory_item_name').all();
    const names: string[] = [];
    for (const el of nameElements) {
      const text = await el.textContent();
      if (text) {
        names.push(text.trim());
      }
    }
    return names;
  }
}

test('TC001 - Successful Login and Sort Products by Price Low to High', async ({ page }) => {
  const saucePage = new SauceDemoPage(page);

  await saucePage.navigate();
  await saucePage.login(
    process.env.KAYO_EMAIL || 'standard_user',
    process.env.KAYO_PASSWORD || 'secret_sauce'
  );

  await expect(page).toHaveURL(/.*inventory.html/);

  await saucePage.sortByPriceLowToHigh();

  const prices = await saucePage.getProductPrices();
  expect(prices.length).toBeGreaterThan(0);

  for (let i = 0; i < prices.length - 1; i++) {
    expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
  }
});

test('TC002 - Product Order Persists After Sorting', async ({ page }) => {
  const saucePage = new SauceDemoPage(page);

  await saucePage.navigate();
  await saucePage.login(
    process.env.KAYO_EMAIL || 'standard_user',
    process.env.KAYO_PASSWORD || 'secret_sauce'
  );

  await expect(page).toHaveURL(/.*inventory.html/);

  await saucePage.sortByPriceLowToHigh();

  const prices = await saucePage.getProductPrices();
  expect(prices.length).toBeGreaterThan(0);

  const lowestPrice = prices[0];
  const highestPrice = prices[prices.length - 1];

  expect(lowestPrice).toBeLessThanOrEqual(highestPrice);

  for (let i = 1; i < prices.length; i++) {
    expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
  }

  const sortDropdown = page.locator('[data-test="product-sort-container"]');
  await expect(sortDropdown).toHaveValue('lohi');
});

test('TC003 - Sort Applied Across Multiple Products', async ({ page }) => {
  const saucePage = new SauceDemoPage(page);

  await saucePage.navigate();
  await saucePage.login(
    process.env.KAYO_EMAIL || 'standard_user',
    process.env.KAYO_PASSWORD || 'secret_sauce'
  );

  await expect(page).toHaveURL(/.*inventory.html/);

  const inventoryItems = page.locator('.inventory_item');
  const itemCount = await inventoryItems.count();
  expect(itemCount).toBeGreaterThan(1);

  await saucePage.sortByPriceLowToHigh();

  const prices = await saucePage.getProductPrices();
  expect(prices.length).toEqual(itemCount);

  const sortedPrices = [...prices].sort((a, b) => a - b);
  expect(prices).toEqual(sortedPrices);

  for (let i = 0; i < prices.length - 1; i++) {
    expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
  }

  const names = await saucePage.getProductNames();
  expect(names.length).toEqual(itemCount);
});