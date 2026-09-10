import { type Page, type Locator, expect } from '@playwright/test';

export class ShellPage {
  readonly page: Page;
  readonly shellEl: Locator;
  readonly sidebarNav: Locator;
  readonly sidebarUser: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.shellEl = page.locator('[data-testid="app-shell"]');
    this.sidebarNav = page.locator('[data-testid="sidebar-nav"]');
    this.sidebarUser = page.locator('[data-testid="sidebar-user"]');
    this.logoutButton = page.locator('[data-testid="logout-btn"]');
  }

  async expectVisible() {
    await expect(this.shellEl).toBeVisible();
    await expect(this.sidebarNav).toBeVisible();
  }

  async getNavItems() {
    return this.sidebarNav.locator('.nav-item').all();
  }

  async getNavLabels() {
    const items = await this.getNavItems();
    const labels: string[] = [];
    for (const item of items) {
      const text = await item.textContent();
      if (text) labels.push(text.trim());
    }
    return labels;
  }

  async navigateTo(label: string) {
    await this.sidebarNav.locator('.nav-item', { hasText: label }).click();
  }

  async expectUserVisible() {
    await expect(this.sidebarUser).toBeVisible();
  }

  async getUserName() {
    return (await this.sidebarUser.locator('.user-name').textContent()) ?? '';
  }

  async getUserRole() {
    return (await this.sidebarUser.locator('.user-role').textContent()) ?? '';
  }

  async logout() {
    await this.logoutButton.click();
  }
}
