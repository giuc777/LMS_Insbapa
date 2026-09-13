import { test, expect } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../test-data';

test.describe('Fase 3 - Admin Profesores', () => {

  test.describe('Navegación y tabla', () => {

    test('admin puede navegar a profesores y ver tabla', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/profesores');
      await expect(adminPage.locator('h2')).toContainText('Gestión de Profesores');
      await expect(adminPage.locator('table.data-table')).toBeVisible({ timeout: 10000 });
    });

    test('admin puede buscar profesor por nombre', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/profesores');
      await adminPage.waitForSelector('table.data-table tbody tr', { timeout: 10000 });
      const searchInput = adminPage.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('Garcia');
      await searchInput.press('Enter');
      await adminPage.waitForTimeout(500);
    });
  });

  test.describe('Modales', () => {

    test('abrir modal de perfil del profesor', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/profesores');
      await adminPage.waitForSelector('table.data-table tbody tr', { timeout: 10000 });
      await adminPage.locator('table.data-table tbody tr').first().locator('button').first().click();
      await expect(adminPage.locator('.modal')).toBeVisible();
      await expect(adminPage.getByText('Perfil del Profesor')).toBeVisible();
      await adminPage.getByRole('button', { name: /cerrar/i }).click();
      await expect(adminPage.locator('.modal')).not.toBeVisible();
    });

    test('perfil muestra clases asignadas', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/profesores');
      await adminPage.waitForSelector('table.data-table tbody tr', { timeout: 10000 });
      await adminPage.locator('table.data-table tbody tr').first().locator('button').first().click();
      await expect(adminPage.locator('.modal')).toBeVisible();
      // Verificar que se muestra la sección de clases
      await expect(adminPage.getByText('Clases Asignadas')).toBeVisible();
      await adminPage.getByRole('button', { name: /cerrar/i }).click();
    });

    test('abrir modal de edición', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/profesores');
      await adminPage.waitForSelector('table.data-table tbody tr', { timeout: 10000 });
      await adminPage.locator('table.data-table tbody tr').first().locator('button').nth(1).click();
      await expect(adminPage.locator('.modal')).toBeVisible();
      await expect(adminPage.getByText('Editar Profesor')).toBeVisible();
      await adminPage.getByRole('button', { name: /cancelar/i }).click();
      await expect(adminPage.locator('.modal')).not.toBeVisible();
    });
  });

  test.describe('Seguridad', () => {

    test('estudiante no puede acceder a gestión de profesores', async ({ studentPage }) => {
      await studentPage.goto('/sistema/admin/profesores');
      await studentPage.waitForTimeout(2000);
      const url = studentPage.url();
      expect(url).not.toContain('/sistema/admin/profesores');
    });
  });
});
