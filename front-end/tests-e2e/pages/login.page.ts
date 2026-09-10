import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly pageEl: Locator;
  readonly roleSelect: Locator;
  readonly roleEstudiante: Locator;
  readonly roleProfesor: Locator;
  readonly roleAdministrador: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly demoCredentials: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageEl = page.locator('[data-testid="login-page"]');
    this.roleSelect = page.locator('[data-testid="role-select"]');
    this.roleEstudiante = page.locator('label.role-card', { has: page.locator('[data-testid="role-estudiante"]') });
    this.roleProfesor = page.locator('label.role-card', { has: page.locator('[data-testid="role-profesor"]') });
    this.roleAdministrador = page.locator('label.role-card', { has: page.locator('[data-testid="role-administrador"]') });
    this.usernameInput = page.locator('[data-testid="login-username"]');
    this.passwordInput = page.locator('[data-testid="login-password"]');
    this.submitButton = page.locator('[data-testid="login-submit"]');
    this.errorMessage = page.locator('[data-testid="login-error"]');
    this.demoCredentials = page.locator('[data-testid="demo-credentials"]');
  }

  async goto() {
    await this.page.goto('/login');
    await this.pageEl.waitFor({ state: 'visible' });
  }

  async selectRole(role: 'estudiante' | 'profesor' | 'administrador') {
    const label = { estudiante: this.roleEstudiante, profesor: this.roleProfesor, administrador: this.roleAdministrador }[role];
    await label.click();
  }

  async fillUsername(value: string) {
    await this.usernameInput.fill(value);
  }

  async fillPassword(value: string) {
    await this.passwordInput.fill(value);
  }

  async submit() {
    await this.submitButton.click();
  }

  async loginWith(username: string, password: string, role: 'estudiante' | 'profesor' | 'administrador') {
    await this.selectRole(role);
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submit();
  }

  async expectVisible() {
    await expect(this.pageEl).toBeVisible();
    await expect(this.roleSelect).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectError(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectNoError() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectLoading() {
    await expect(this.submitButton).toBeDisabled();
    await expect(this.submitButton).toContainText('Verificando...');
  }

  async expectDemoCredentials() {
    await expect(this.demoCredentials).toBeVisible();
    await expect(this.demoCredentials).toContainText('estudiante');
    await expect(this.demoCredentials).toContainText('profesor');
    await expect(this.demoCredentials).toContainText('admin');
  }
}
