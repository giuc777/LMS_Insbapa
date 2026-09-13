import { test, expect } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../test-data';

test.describe('Fase 1 - Admin Cursos', () => {

  test.describe('Navegación y tabla', () => {

    test('admin puede navegar a cursos y ver tabla', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/cursos');
      await expect(adminPage.locator('h2')).toContainText('Gestión de Cursos');
      await expect(adminPage.locator('table.data-table')).toBeVisible({ timeout: 10000 });
    });

    test('admin puede buscar cursos por nombre', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/cursos');
      await adminPage.waitForSelector('table.data-table tbody tr', { timeout: 10000 });
      const searchInput = adminPage.locator('input[placeholder="Buscar materia..."]');
      await searchInput.fill('MATE');
      await searchInput.press('Enter');
      await adminPage.waitForTimeout(500);
    });

    test('admin puede filtrar por grado', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/cursos');
      await adminPage.waitForSelector('table.data-table', { timeout: 10000 });
      await adminPage.locator('select').first().selectOption({ index: 1 });
      await adminPage.waitForTimeout(500);
    });
  });

  test.describe('Modales', () => {

    test('abrir modal de crear curso', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/cursos');
      await adminPage.waitForSelector('table.data-table', { timeout: 10000 });
      await adminPage.getByRole('button', { name: /asignar curso/i }).click();
      await expect(adminPage.locator('.modal')).toBeVisible();
      await expect(adminPage.getByText('Asignar Curso')).toBeVisible();
    });

    test('cerrar modal con botón cancelar', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/cursos');
      await adminPage.waitForSelector('table.data-table', { timeout: 10000 });
      await adminPage.getByRole('button', { name: /asignar curso/i }).click();
      await expect(adminPage.locator('.modal')).toBeVisible();
      await adminPage.getByRole('button', { name: /cancelar/i }).click();
      await expect(adminPage.locator('.modal')).not.toBeVisible();
    });

    test('abrir modal de detalle', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/cursos');
      await adminPage.waitForSelector('table.data-table tbody tr', { timeout: 10000 });
      await adminPage.locator('table.data-table tbody tr').first().locator('button').first().click();
      await expect(adminPage.locator('.modal')).toBeVisible();
      await expect(adminPage.getByText('Detalle del Curso')).toBeVisible();
      await adminPage.getByRole('button', { name: /cerrar/i }).click();
      await expect(adminPage.locator('.modal')).not.toBeVisible();
    });
  });

  test.describe('Crear y eliminar', () => {

    test('crear nueva asignación de curso', async ({ adminPage }) => {
      await adminPage.goto('/sistema/admin/cursos');
      await adminPage.waitForSelector('table.data-table', { timeout: 10000 });
      await adminPage.getByRole('button', { name: /asignar curso/i }).click();

      // Seleccionar materia
      await adminPage.locator('.modal select').nth(0).selectOption({ index: 1 });
      // Seleccionar grado
      await adminPage.locator('.modal select').nth(1).selectOption({ index: 1 });
      // Seleccionar sección
      await adminPage.locator('.modal select').nth(2).selectOption({ index: 1 });
      // Seleccionar profesor
      await adminPage.locator('.modal select').nth(3).selectOption({ index: 1 });

      // Submit
      await adminPage.getByRole('button', { name: /asignar$/i }).last().click();
      await expect(adminPage.locator('.alert-success')).toBeVisible({ timeout: 5000 });
    });

    test('no puede acceder sin ser admin', async ({ studentPage }) => {
      await studentPage.goto('/sistema/admin/cursos');
      await studentPage.waitForTimeout(2000);
      const url = studentPage.url();
      expect(url).not.toContain('/sistema/admin/cursos');
    });
  });
});
