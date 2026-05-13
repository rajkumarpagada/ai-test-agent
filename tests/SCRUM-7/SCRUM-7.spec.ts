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

  async addFirstProductToCart() {
    const addButton = this.page.locator('[data-test^="add-to-cart"]').first();
    const productName = await this.page.locator('.inventory_item_name').first().textContent();
    await addButton.click();
    return productName;
  }

  async goToCart() {
    await this.page.click('[data-test="shopping-cart-link"]');
    await this.page.waitForURL('**/cart.html');
  }

  async proceedToCheckout() {
    await this.page.click('[data-test="checkout"]');
    await this.page.waitForURL('**/checkout-step-one.html');
  }

  async fillShippingDetails(firstName: string, lastName: string, postalCode: string) {
    await this.page.fill('[data-test="firstName"]', firstName);
    await this.page.fill('[data-test="lastName"]', lastName);
    await this.page.fill('[data-test="postalCode"]', postalCode);
    await this.page.click('[data-test="continue"]');
  }

  async submitOrder() {
    await this.page.waitForURL('**/checkout-step-two.html');
    await this.page.click('[data-test="finish"]');
    await this.page.waitForURL('**/checkout-complete.html');
  }
}

const EMAIL = process.env.SAUCE_USERNAME || 'standard_user';;
const PASSWORD = process.env.SAUCE_PASSWORD || 'secret_sauce';;

test('TC001 - Successful Login with Valid Credentials', async ({ page }) => {
  const saucePage = new SauceDemoPage(page);
  await saucePage.goto();
  await saucePage.login(EMAIL, PASSWORD);
  await page.waitForURL('**/inventory.html');
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.locator('.inventory_list')).toBeVisible();
});

test('TC002 - Add Product to Cart and Verify', async ({ page }) => {
  const saucePage = new SauceDemoPage(page);
  await saucePage.goto();
  await saucePage.login(EMAIL, PASSWORD);
  await page.waitForURL('**/inventory.html');

  const productName = await saucePage.addFirstProductToCart();
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

  await saucePage.goToCart();
  await expect(page.locator('.cart_item')).toBeVisible();
  const cartProductName = await page.locator('.inventory_item_name').first().textContent();
  expect(cartProductName).toBe(productName);
});

test('TC003 - Complete Checkout and Confirm Order', async ({ page }) => {
  const saucePage = new SauceDemoPage(page);
  await saucePage.goto();
  await saucePage.login(EMAIL, PASSWORD);
  await page.waitForURL('**/inventory.html');

  await saucePage.addFirstProductToCart();
  await saucePage.goToCart();
  await saucePage.proceedToCheckout();
  await saucePage.fillShippingDetails('John', 'Doe', '12345');
  await saucePage.submitOrder();

  await expect(page).toHaveURL(/checkout-complete\.html/);
  await expect(page.locator('[data-test="complete-header"]')).toBeVisible();
  await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
});