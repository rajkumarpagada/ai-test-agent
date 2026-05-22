import { test, expect, Page } from "@playwright/test";

class SauceDemoPage {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    await this.page.goto("https://www.saucedemo.com");
    await this.page.fill("[data-test='username']", username);
    await this.page.fill("[data-test='password']", password);
    await this.page.click("[data-test='login-button']");
    await this.page.waitForURL("**/inventory.html");
  }

  async getCartBadgeCount(): Promise<string | null> {
    const badge = this.page.locator(".shopping_cart_badge");
    const count = await badge.count();
    if (count === 0) return null;
    return badge.textContent();
  }

  async clickFirstProductName() {
    await this.page.locator(".inventory_item_name").first().click();
  }

  async clickAddToCartOnDetailPage() {
    await this.page.click("[data-test='add-to-cart']");
  }

  async clickBackToProducts() {
    await this.page.click("[data-test='back-to-products']");
  }
}

test("TC001 - Successfully Add Product to Cart from Detail Page", async ({ page }) => {
  const saucePage = new SauceDemoPage(page);
  const username = process.env.SAUCE_USERNAME || "";
  const password = process.env.SAUCE_PASSWORD || "";

  await saucePage.login(username, password);
  await saucePage.clickFirstProductName();
  await page.waitForURL("**/inventory-item.html**");
  await saucePage.clickAddToCartOnDetailPage();

  const badgeCount = await saucePage.getCartBadgeCount();
  expect(badgeCount).toBe("1");
});

test("TC002 - Product Detail Page Displays Correct Information", async ({ page }) => {
  const saucePage = new SauceDemoPage(page);
  const username = process.env.SAUCE_USERNAME || "";
  const password = process.env.SAUCE_PASSWORD || "";

  await saucePage.login(username, password);

  const firstProductName = await page.locator(".inventory_item_name").first().textContent();

  await saucePage.clickFirstProductName();
  await page.waitForURL("**/inventory-item.html**");

  const detailName = page.locator(".inventory_details_name");
  const detailDescription = page.locator(".inventory_details_desc");
  const detailPrice = page.locator(".inventory_details_price");
  const addToCartButton = page.locator("[data-test='add-to-cart']");

  await expect(detailName).toBeVisible();
  await expect(detailDescription).toBeVisible();
  await expect(detailPrice).toBeVisible();
  await expect(addToCartButton).toBeVisible();

  const detailNameText = await detailName.textContent();
  expect(detailNameText).toBe(firstProductName);

  const priceText = await detailPrice.textContent();
  expect(priceText).toMatch(/^\$\d+\.\d{2}$/);

  const descriptionText = await detailDescription.textContent();
  expect(descriptionText).not.toBe("");
});

test("TC003 - Cart Persists After Returning to Inventory Page", async ({ page }) => {
  const saucePage = new SauceDemoPage(page);
  const username = process.env.SAUCE_USERNAME || "";
  const password = process.env.SAUCE_PASSWORD || "";

  await saucePage.login(username, password);
  await saucePage.clickFirstProductName();
  await page.waitForURL("**/inventory-item.html**");
  await saucePage.clickAddToCartOnDetailPage();

  const badgeOnDetailPage = await saucePage.getCartBadgeCount();
  expect(badgeOnDetailPage).toBe("1");

  await saucePage.clickBackToProducts();
  await page.waitForURL("**/inventory.html");

  const badgeOnInventoryPage = await saucePage.getCartBadgeCount();
  expect(badgeOnInventoryPage).toBe("1");
});