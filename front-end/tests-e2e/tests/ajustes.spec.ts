import { test, expect } from '../fixtures/auth.fixture';

test.describe('Módulo Ajustes', () => {
  test('admin puede ver ajustes con ambas pestañas', async ({ adminPage }) => {
    await adminPage.goto('/sistema/ajustes');
    const ajustesPage = adminPage.locator('[data-testid="ajustes-page"]');
    await expect(ajustesPage).toBeVisible();

    const perfilTab = adminPage.locator('button.tab', { hasText: 'Mi Perfil' });
    await expect(perfilTab).toBeVisible();

    const usuariosTab = adminPage.locator('button.tab', { hasText: 'Gestión de Usuarios' });
    await expect(usuariosTab).toBeVisible();
  });

  test('estudiante puede ver ajustes con formulario de perfil', async ({ studentPage }) => {
    await studentPage.goto('/sistema/ajustes');
    const ajustesPage = studentPage.locator('[data-testid="ajustes-page"]');
    await expect(ajustesPage).toBeVisible();

    const profileForm = studentPage.locator('[data-testid="profile-form"]');
    await expect(profileForm).toBeVisible();

    const passwordForm = studentPage.locator('[data-testid="password-form"]');
    await expect(passwordForm).toBeVisible();
  });

  test('formulario de perfil muestra datos del usuario', async ({ studentPage }) => {
    await studentPage.goto('/sistema/ajustes');

    const primerNombreInput = studentPage.locator('[data-testid="profile-form"] input').first();
    const value = await primerNombreInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });
});
