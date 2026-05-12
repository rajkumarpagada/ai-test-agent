import { test, expect, Page, BrowserContext } from '@playwright/test';

class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://kayosports.com.au/login');
    await this.page.waitForSelector('input[type="email"], input[name="email"], [data-testid="email-input"]', { timeout: 10000 });
  }

  async fillEmail(email: string) {
    const emailInput = this.page.locator('input[type="email"], input[name="email"], [data-testid="email-input"]').first();
    await emailInput.fill(email);
  }

  async fillPassword(password: string) {
    const passwordInput = this.page.locator('input[type="password"], input[name="password"], [data-testid="password-input"]').first();
    await passwordInput.fill(password);
  }

  async checkRememberMe() {
    const rememberMe = this.page.locator('input[type="checkbox"][name*="remember"], [data-testid="remember-me"], label:has-text("Remember")').first();
    await rememberMe.check();
  }

  async clickLogin() {
    const loginBtn = this.page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), [data-testid="login-button"]').first();
    await loginBtn.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async getErrorMessage() {
    const errorLocator = this.page.locator('[class*="error"], [data-testid*="error"], [role="alert"], [class*="alert"]').first();
    await errorLocator.waitFor({ timeout: 8000 });
    return errorLocator;
  }
}

test.describe('Positive', () => {
  test('TC001 - Successful Login with Valid Credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.KAYO_EMAIL!, process.env.KAYO_PASSWORD!);
    await page.waitForURL(/\/(home|dashboard|sport|my-account|browse)/, { timeout: 15000 });
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    const welcomeIndicator = page.locator('[data-test-id="HEADER-PROFILE-ICON"], [class*="profile"], [class*="avatar"]').first();
await expect(welcomeIndicator).toBeAttached({ timeout: 10000 });
  });

  test('TC002 - Successful Login with Remember Me Option', async ({ browser }) => {
    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillEmail(process.env.KAYO_EMAIL!);
    await loginPage.fillPassword(process.env.KAYO_PASSWORD!);
    await loginPage.checkRememberMe();
    await loginPage.clickLogin();
    await page.waitForURL(/\/(home|dashboard|sport|my-account|browse)/, { timeout: 15000 });
    expect(page.url()).not.toContain('/login');
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c =>
      c.name.toLowerCase().includes('session') ||
      c.name.toLowerCase().includes('token') ||
      c.name.toLowerCase().includes('auth') ||
      c.name.toLowerCase().includes('remember')
    );
    expect(sessionCookie).toBeDefined();
    await context.close();

    const newContext: BrowserContext = await browser.newContext({ storageState: undefined });
    const newPage: Page = await newContext.newPage();
    await newContext.addCookies(cookies);
    await newPage.goto('https://kayosports.com.au');
    const loggedInIndicator = newPage.locator('[class*="profile"], [data-testid*="user"], [aria-label*="account"], [class*="avatar"]').first();
    await expect(loggedInIndicator).toBeVisible({ timeout: 10000 });
    await newContext.close();
  });
});

test.describe('Negative', () => {
  test('TC003 - Login Fails with Invalid Password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.KAYO_EMAIL!, 'InvalidPassword!@#123');
    const errorMsg = await loginPage.getErrorMessage();
    await expect(errorMsg).toBeVisible();
    expect(page.url()).toContain('/login');
  });

  test('TC004 - Login Fails with Unregistered Email', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('unregistered_user_xyz_404@notexist.com', 'SomePassword123!');
    const errorMsg = await loginPage.getErrorMessage();
    await expect(errorMsg).toBeVisible();
    expect(page.url()).toContain('/login');
  });

  test('TC005 - Login Fails with Empty Fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.clickLogin();
    const emailInput = page.locator('input[type="email"], input[name="email"], [data-testid="email-input"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"], [data-testid="password-input"]').first();
    const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    const passwordValidation = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    const hasNativeValidation = emailValidation !== '' || passwordValidation !== '';
    if (!hasNativeValidation) {
      const errorMessages = page.locator('[class*="error"], [data-testid*="error"], [role="alert"]');
      await expect(errorMessages.first()).toBeVisible({ timeout: 8000 });
    } else {
      expect(hasNativeValidation).toBe(true);
    }
    expect(page.url()).toContain('/login');
  });
});

test.describe('Edge Cases', () => {
  test('TC006 - Login with Maximum Length Credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const maxEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
    const maxPassword = 'A'.repeat(64) + '1!';
    await loginPage.fillEmail(maxEmail);
    await loginPage.fillPassword(maxPassword);
    await loginPage.clickLogin();
    await page.waitForTimeout(5000);
    const errorMsg = page.locator('[class*="error"], [data-testid*="error"], [role="alert"]').first();
    const isErrorVisible = await errorMsg.isVisible().catch(() => false);
    if (!isErrorVisible) {
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/error');
    } else {
      const errorText = await errorMsg.textContent();
      expect(errorText).not.toMatch(/crash|unexpected|500/i);
    }
  });

  test('TC007 - Login with SQL Injection Input', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillEmail("' OR '1'='1");
    await loginPage.fillPassword("' OR '1'='1' --");
    await loginPage.clickLogin();
    await page.waitForTimeout(5000);
    expect(page.url()).toContain('/login');
    const errorMsg = await loginPage.getErrorMessage();
    await expect(errorMsg).toBeVisible();
  });

  test('TC008 - Login After Multiple Failed Attempts (Account Lockout)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    for (let i = 0; i < 5; i++) {
      await loginPage.fillEmail(process.env.KAYO_EMAIL!);
      await loginPage.fillPassword(`WrongPassword${i}!`);
      await loginPage.clickLogin();
      await page.waitForTimeout(2000);
    }
    await loginPage.fillEmail(process.env.KAYO_EMAIL!);
    await loginPage.fillPassword(process.env.KAYO_PASSWORD!);
    await loginPage.clickLogin();
    await page.waitForTimeout(5000);
    const lockoutMsg = page.locator('[class*="error"], [data-testid*="error"], [role="alert"], [class*="lockout"], [class*="blocked"]').first();
    await expect(lockoutMsg).toBeVisible({ timeout: 8000 });
    const lockoutText = await lockoutMsg.textContent();
    expect(lockoutText).toMatch(/lock|block|suspend|attempt|try again|too many|exceed/i);
  });
});
