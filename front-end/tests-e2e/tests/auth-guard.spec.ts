import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/login.page';

test.describe('Auth Guard — Protección de rutas', () => {
  test('sin sesión, /sistema redirige a /login', async ({ page }) => {
    await page.goto('/sistema/dashboard');
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('con sesión, permite acceder a /sistema', async ({ studentPage }) => {
    expect(studentPage.url()).toContain('/sistema');
    const shellEl = studentPage.locator('[data-testid="app-shell"]');
    await expect(shellEl).toBeVisible();
  });

  test('logout limpia sesión y redirige a /login', async ({ studentPage }) => {
    const shellPage = await import('../pages/shell.page').then((m) => new m.ShellPage(studentPage));
    await shellPage.logout();

    await studentPage.waitForURL('**/login', { timeout: 10000 });
    expect(studentPage.url()).toContain('/login');

    const token = await studentPage.evaluate(() => localStorage.getItem('insbapa_token'));
    expect(token).toBeNull();
  });

  test('token en localStorage persiste al recargar', async ({ studentPage }) => {
    const tokenBefore = await studentPage.evaluate(() => localStorage.getItem('insbapa_token'));
    expect(tokenBefore).toBeTruthy();

    await studentPage.reload();
    await studentPage.waitForURL('**/sistema/**', { timeout: 10000 });

    const tokenAfter = await studentPage.evaluate(() => localStorage.getItem('insbapa_token'));
    expect(tokenAfter).toBe(tokenBefore);
  });
});
