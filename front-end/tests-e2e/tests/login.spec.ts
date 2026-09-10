import { test, expect } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../test-data';

test.describe('Módulo Login', () => {
  test.describe('Página de login', () => {
    test('debería mostrar la página de login con todos los elementos', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.expectVisible();
    });

    test('selector de rol debería cambiar entre opciones', async ({ loginPage, page }) => {
      await loginPage.goto();

      await loginPage.selectRole('profesor');
      await expect(page.locator('[data-testid="role-profesor"]')).toBeChecked();

      await loginPage.selectRole('administrador');
      await expect(page.locator('[data-testid="role-administrador"]')).toBeChecked();

      await loginPage.selectRole('estudiante');
      await expect(page.locator('[data-testid="role-estudiante"]')).toBeChecked();
    });

    test('credenciales demo son visibles', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.expectDemoCredentials();
    });
  });

  test.describe('Login exitoso', () => {
    test('login exitoso como estudiante', async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.loginWith(
        TEST_USERS.student.username,
        TEST_USERS.student.password,
        TEST_USERS.student.rolRadio,
      );

      await page.waitForURL('**/sistema/**', { timeout: 10000 });
      expect(page.url()).toContain('/sistema');

      const token = await page.evaluate(() => localStorage.getItem('insbapa_token'));
      expect(token).toBeTruthy();
    });

    test('login exitoso como profesor', async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.loginWith(
        TEST_USERS.teacher.username,
        TEST_USERS.teacher.password,
        TEST_USERS.teacher.rolRadio,
      );

      await page.waitForURL('**/sistema/**', { timeout: 10000 });
      expect(page.url()).toContain('/sistema');

      const token = await page.evaluate(() => localStorage.getItem('insbapa_token'));
      expect(token).toBeTruthy();
    });

    test('login exitoso como administrador', async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.loginWith(
        TEST_USERS.admin.username,
        TEST_USERS.admin.password,
        TEST_USERS.admin.rolRadio,
      );

      await page.waitForURL('**/sistema/**', { timeout: 10000 });
      expect(page.url()).toContain('/sistema');

      const token = await page.evaluate(() => localStorage.getItem('insbapa_token'));
      expect(token).toBeTruthy();
    });
  });

  test.describe('Login fallido', () => {
    test('login con credenciales inválidas muestra error', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.loginWith('usuario_inexistente', 'password_mala', 'estudiante');
      await loginPage.expectError();
    });

    test('login con usuario correcto pero rol incorrecto muestra error', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.loginWith(
        TEST_USERS.student.username,
        TEST_USERS.student.password,
        'administrador',
      );
      await loginPage.expectError();
    });

    test('login con campos vacíos muestra validación', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.submit();
      await loginPage.expectError();
    });
  });

  test.describe('Estado de carga', () => {
    test('login muestra estado de carga durante verificación', async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.selectRole('estudiante');
      await loginPage.fillUsername(TEST_USERS.student.username);
      await loginPage.fillPassword(TEST_USERS.student.password);

      await loginPage.submit();

      await expect(loginPage.submitButton).toBeDisabled();
    });
  });
});
