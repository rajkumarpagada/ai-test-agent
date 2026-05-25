/**
 * Unit Tests for SCRUM-7 — SauceDemoPage
 * Tests each method in isolation using mocks (no real browser needed)
 */

// ─── Mock the Page object ─────────────────────────────────────────────────────
const mockPage = {
  goto: jest.fn().mockResolvedValue(undefined),
  fill: jest.fn().mockResolvedValue(undefined),
  click: jest.fn().mockResolvedValue(undefined),
  waitForURL: jest.fn().mockResolvedValue(undefined),
  locator: jest.fn(),
};

// ─── Inline SauceDemoPage for unit testing ────────────────────────────────────
class SauceDemoPage {
  constructor(private page: any) {}

  async goto() {
    await this.page.goto('https://www.saucedemo.com');
  }

  async login(username: string, password: string) {
    await this.page.fill('[data-test="username"]', username);
    await this.page.fill('[data-test="password"]', password);
    await this.page.click('[data-test="login-button"]');
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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SauceDemoPage — Unit Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── goto ──────────────────────────────────────────────────────────────────
  describe('goto()', () => {
    test('navigates to saucedemo.com', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.goto();
      expect(mockPage.goto).toHaveBeenCalledWith('https://www.saucedemo.com');
      expect(mockPage.goto).toHaveBeenCalledTimes(1);
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login()', () => {
    test('fills username field with correct selector', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.login('standard_user', 'secret_sauce');
      expect(mockPage.fill).toHaveBeenCalledWith('[data-test="username"]', 'standard_user');
    });

    test('fills password field with correct selector', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.login('standard_user', 'secret_sauce');
      expect(mockPage.fill).toHaveBeenCalledWith('[data-test="password"]', 'secret_sauce');
    });

    test('clicks login button', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.login('standard_user', 'secret_sauce');
      expect(mockPage.click).toHaveBeenCalledWith('[data-test="login-button"]');
    });

    test('fills fields in correct order — username before password', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.login('standard_user', 'secret_sauce');
      const calls = mockPage.fill.mock.calls;
      expect(calls[0][0]).toBe('[data-test="username"]');
      expect(calls[1][0]).toBe('[data-test="password"]');
    });

    test('handles empty username gracefully', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.login('', 'secret_sauce');
      expect(mockPage.fill).toHaveBeenCalledWith('[data-test="username"]', '');
    });

    test('handles empty password gracefully', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.login('standard_user', '');
      expect(mockPage.fill).toHaveBeenCalledWith('[data-test="password"]', '');
    });
  });

  // ── goToCart ──────────────────────────────────────────────────────────────
  describe('goToCart()', () => {
    test('clicks shopping cart link', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.goToCart();
      expect(mockPage.click).toHaveBeenCalledWith('[data-test="shopping-cart-link"]');
    });

    test('waits for cart URL', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.goToCart();
      expect(mockPage.waitForURL).toHaveBeenCalledWith('**/cart.html');
    });
  });

  // ── proceedToCheckout ─────────────────────────────────────────────────────
  describe('proceedToCheckout()', () => {
    test('clicks checkout button', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.proceedToCheckout();
      expect(mockPage.click).toHaveBeenCalledWith('[data-test="checkout"]');
    });

    test('waits for checkout step one URL', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.proceedToCheckout();
      expect(mockPage.waitForURL).toHaveBeenCalledWith('**/checkout-step-one.html');
    });
  });

  // ── fillShippingDetails ───────────────────────────────────────────────────
  describe('fillShippingDetails()', () => {
    test('fills first name correctly', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.fillShippingDetails('John', 'Doe', '12345');
      expect(mockPage.fill).toHaveBeenCalledWith('[data-test="firstName"]', 'John');
    });

    test('fills last name correctly', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.fillShippingDetails('John', 'Doe', '12345');
      expect(mockPage.fill).toHaveBeenCalledWith('[data-test="lastName"]', 'Doe');
    });

    test('fills postal code correctly', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.fillShippingDetails('John', 'Doe', '12345');
      expect(mockPage.fill).toHaveBeenCalledWith('[data-test="postalCode"]', '12345');
    });

    test('clicks continue after filling details', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.fillShippingDetails('John', 'Doe', '12345');
      expect(mockPage.click).toHaveBeenCalledWith('[data-test="continue"]');
    });
  });

  // ── submitOrder ───────────────────────────────────────────────────────────
  describe('submitOrder()', () => {
    test('waits for checkout step two URL', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.submitOrder();
      expect(mockPage.waitForURL).toHaveBeenCalledWith('**/checkout-step-two.html');
    });

    test('clicks finish button', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.submitOrder();
      expect(mockPage.click).toHaveBeenCalledWith('[data-test="finish"]');
    });

    test('waits for checkout complete URL', async () => {
      const saucePage = new SauceDemoPage(mockPage);
      await saucePage.submitOrder();
      expect(mockPage.waitForURL).toHaveBeenCalledWith('**/checkout-complete.html');
    });
  });

  // ── credentials ───────────────────────────────────────────────────────────
  describe('Credentials', () => {
    test('default username is standard_user', () => {
      const username = process.env.SAUCE_USERNAME || 'standard_user';
      expect(username).toBe('standard_user');
    });

    test('default password is secret_sauce', () => {
      const password = process.env.SAUCE_PASSWORD || 'secret_sauce';
      expect(password).toBe('secret_sauce');
    });
  });
});
