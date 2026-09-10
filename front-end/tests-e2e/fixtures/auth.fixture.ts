import { test as base, type Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ShellPage } from '../pages/shell.page';
import { TEST_USERS } from '../test-data';

type AuthFixtures = {
  loginPage: LoginPage;
  shellPage: ShellPage;
  studentPage: Page;
  teacherPage: Page;
  adminPage: Page;
};

async function loginAs(page: Page, user: (typeof TEST_USERS)[keyof typeof TEST_USERS]) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginWith(user.username, user.password, user.rolRadio);
  await page.waitForURL('**/sistema/**', { timeout: 10000 });
}

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  shellPage: async ({ page }, use) => {
    await use(new ShellPage(page));
  },

  studentPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, TEST_USERS.student);
    await use(page);
    await context.close();
  },

  teacherPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, TEST_USERS.teacher);
    await use(page);
    await context.close();
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, TEST_USERS.admin);
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
