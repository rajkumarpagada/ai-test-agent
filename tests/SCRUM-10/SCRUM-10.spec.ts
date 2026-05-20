import { test, expect, Page } from '@playwright/test';

class SauceDemoPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://www.saucedemo.com');
  }

  async login(username: string, password: string) {
    await this.page.fill('[data-test="username"]', username);
    await this.page.fill('[data-test="password"]', password);
    await this.page.click('[data-test="login-button"]');
  }

  async addProductToCartByIndex(index: number) {
    const addButtons = this.page.locator('[data-test^="add-to-cart"]');
    await addButtons.nth(index).click();
  }

  async getCartBadgeCount(): Promise<string> {
    return await this.page.locator('.shopping_cart_badge').innerText();
  }

  async openCart() {
    await this.page.click('.shopping_cart_link');
  }

  async removeFirstCartItem() {
    const removeButtons = this.page.locator('[data-test^="remove"]');
    await removeButtons.first().click();
  }

  async getCartItemCount(): Promise<number> {
    return await this.page.locator('.cart_item').count();
  }

  async proceedToCheckout() {
    await this.page.click('[data-test="checkout"]');
  }

  async fillCheckoutInfo(firstName: string, lastName: string, zip: string) {
    await this.page.fill('[data-test="firstName"]', firstName);
    await this.page.fill('[data-test="lastName"]', lastName);
    await this.page.fill('[data-test="postalCode"]', zip);
    await this.page.click('[data-test="continue"]');
  }

  async finishCheckout() {
    await this.page.click('[data-test="finish"]');
  }
}

test('TC001 - Successful Login and Navigation to Inventory Page', async ({ page }) => {
  const saucePage = new SauceDemoPage(page);
  const email = process.env.KAYO_EMAIL || 'standard_user';
  const password = process.env.KAYO_PASSWORD || 'secret_sauce';

  await saucePage.goto();
  await saucePage.login(email, password);

  await page.waitForURL('**/inventory.html');
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('.inventory_list')).toBeVisible();
});

test('TC002 - Add Two Products to Cart', async ({ page }) => {
  const saucePage = new SauceDemoPage(page);
  const email = process.env.KAYO_EMAIL || 'standard_user';
  const password = process.env.KAYO_PASSWORD || 'secret_sauce';

  await saucePage.goto();
  await saucePage.login(email, password);
  await page.waitForURL('**/inventory.html');

  await saucePage.addProductToCartByIndex(0);
  await saucePage.addProductToCartByIndex(1);

  const badgeCount = await saucePage.getCartBadgeCount();
  expect(badgeCount).toBe('2');
});

test('TC003 - Remove Item, Proceed to Checkout and Confirm Order', async ({ page }) => {
  const saucePage = new SauceDemoPage(page);
  const email = process.env.KAYO_EMAIL || 'standard_user';
  const password = process.env.KAYO_PASSWORD || 'secret_sauce';

  await saucePage.goto();
  await saucePage.login(email, password);
  await page.waitForURL('**/inventory.html');

  await saucePage.addProductToCartByIndex(0);
  await saucePage.addProductToCartByIndex(1);
  await saucePage.openCart();
  await page.waitForURL('**/cart.html');

  await saucePage.removeFirstCartItem();
  const remainingItems = await saucePage.getCartItemCount();
  expect(remainingItems).toBe(1);

  await saucePage.proceedToCheckout();
  await page.waitForURL('**/checkout-step-one.html');

  await saucePage.fillCheckoutInfo('John', 'Doe', '12345');
  await page.waitForURL('**/checkout-step-two.html');

  await saucePage.finishCheckout();
  await page.waitForURL('**/checkout-complete.html');

  await expect(page.locator('.complete-header')).toBeVisible();
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
});