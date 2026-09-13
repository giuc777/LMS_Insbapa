import { test, expect } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../test-data';

test.describe('Fase 2 - Admin Estudiantes', () => {

  test.describe('Navegación y tabla', () => {

    test('admin puede navegar a estudiantes y ver tabla', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/estudiantes');
      await expect(adminPage.locator('h2')).toContainText('Gestión de Estudiantes');
      await expect(adminPage.locator('table.data-table')).toBeVisible({ timeout: 10000 });
    });

    test('admin puede buscar estudiante por nombre', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/estudiantes');
      await adminPage.waitForSelector('table.data-table tbody tr', { timeout: 10000 });
      const searchInput = adminPage.locator('input[placeholder*="Buscar"]');
      await searchInput.fill('Maria');
      await searchInput.press('Enter');
      await adminPage.waitForTimeout(500);
    });

    test('admin puede filtrar por grado', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/estudiantes');
      await adminPage.waitForSelector('table.data-table', { timeout: 10000 });
      await adminPage.locator('select').first().selectOption({ index: 1 });
      await adminPage.waitForTimeout(500);
    });
  });

  test.describe('Modales', () => {

    test('abrir modal de registrar estudiante', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/estudiantes');
      await adminPage.waitForSelector('table.data-table', { timeout: 10000 });
      await adminPage.getByRole('button', { name: /registrar estudiante/i }).click();
      await expect(adminPage.locator('.modal')).toBeVisible();
      await expect(adminPage.getByText('Registrar Estudiante')).toBeVisible();
    });

    test('cerrar modal con cancelar', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/estudiantes');
      await adminPage.waitForSelector('table.data-table', { timeout: 10000 });
      await adminPage.getByRole('button', { name: /registrar estudiante/i }).click();
      await expect(adminPage.locator('.modal')).toBeVisible();
      await adminPage.getByRole('button', { name: /cancelar/i }).click();
      await expect(adminPage.locator('.modal')).not.toBeVisible();
    });

    test('abrir modal de perfil del estudiante', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/estudiantes');
      await adminPage.waitForSelector('table.data-table tbody tr', { timeout: 10000 });
      await adminPage.locator('table.data-table tbody tr').first().locator('button').first().click();
      await expect(adminPage.locator('.modal')).toBeVisible();
      await expect(adminPage.getByText('Perfil del Estudiante')).toBeVisible();
      await adminPage.getByRole('button', { name: /cerrar/i }).click();
      await expect(adminPage.locator('.modal')).not.toBeVisible();
    });

    test('abrir modal de edición', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/estudiantes');
      await adminPage.waitForSelector('table.data-table tbody tr', { timeout: 10000 });
      await adminPage.locator('table.data-table tbody tr').first().locator('button').nth(1).click();
      await expect(adminPage.locator('.modal')).toBeVisible();
      await expect(adminPage.getByText('Editar Estudiante')).toBeVisible();
      await adminPage.getByRole('button', { name: /cancelar/i }).click();
      await expect(adminPage.locator('.modal')).not.toBeVisible();
    });
  });

  test.describe('Seguridad', () => {

    test('estudiante no puede acceder a gestión de estudiantes', async ({ studentPage }) => {
      await studentPage.goto('/sistema/admin/estudiantes');
      await studentPage.waitForTimeout(2000);
      const url = studentPage.url();
      expect(url).not.toContain('/sistema/admin/estudiantes');
    });
  });
});
