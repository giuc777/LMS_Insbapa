import { test, expect } from '../fixtures/auth.fixture';
import { TEST_USERS } from '../test-data';

test.describe('Fase 0 — Navegación por rutas', () => {

  test.describe('Admin — todas las rutas responden', () => {
    const adminRoutes = [
      { label: 'Dashboard', path: '/sistema/dashboard' },
      { label: 'Cursos', path: '/sistema/admin/cursos' },
      { label: 'Estudiantes', path: '/sistema/admin/estudiantes' },
      { label: 'Profesores', path: '/sistema/admin/profesores' },
      { label: 'Anuncios', path: '/sistema/admin/anuncios' },
      { label: 'Tokens', path: '/sistema/admin/tokens' },
      { label: 'Notas', path: '/sistema/admin/notas' },
      { label: 'Mantenimiento', path: '/sistema/admin/mantenimiento' },
      { label: 'Ajustes', path: '/sistema/ajustes' },
    ];

    for (const route of adminRoutes) {
      test(`admin → ${route.label} carga sin error`, async ({ adminPage }) => {
        await adminPage.goto(route.path);
        await expect(adminPage.locator('body')).not.toContainText('Cannot find module');
        await expect(adminPage.locator('body')).not.toContainText('error');
      });
    }
  });

  test.describe('Estudiante — todas las rutas responden', () => {
    const estudianteRoutes = [
      { label: 'Dashboard', path: '/sistema/dashboard' },
      { label: 'Mis Cursos', path: '/sistema/cursos' },
      { label: 'Tareas', path: '/sistema/tareas' },
      { label: 'Examenes', path: '/sistema/examenes' },
      { label: 'Notas', path: '/sistema/notas' },
      { label: 'Anuncios', path: '/sistema/anuncios' },
      { label: 'Ajustes', path: '/sistema/ajustes' },
    ];

    for (const route of estudianteRoutes) {
      test(`estudiante → ${route.label} carga sin error`, async ({ studentPage }) => {
        await studentPage.goto(route.path);
        await expect(studentPage.locator('body')).not.toContainText('Cannot find module');
      });
    }
  });

  test.describe('Profesor — todas las rutas responden', () => {
    const profesorRoutes = [
      { label: 'Dashboard', path: '/sistema/dashboard' },
      { label: 'Mis Clases', path: '/sistema/clases' },
      { label: 'Tareas', path: '/sistema/profesor/tareas' },
      { label: 'Notas', path: '/sistema/profesor/notas' },
      { label: 'Examenes', path: '/sistema/profesor/examenes' },
      { label: 'Materiales', path: '/sistema/profesor/materiales' },
      { label: 'Anuncios', path: '/sistema/profesor/anuncios' },
      { label: 'Ajustes', path: '/sistema/ajustes' },
    ];

    for (const route of profesorRoutes) {
      test(`profesor → ${route.label} carga sin error`, async ({ teacherPage }) => {
        await teacherPage.goto(route.path);
        await expect(teacherPage.locator('body')).not.toContainText('Cannot find module');
      });
    }
  });

  test.describe('Ruta inválida redirige al login', () => {
    test('ruta no existente redirige a login', async ({ page }) => {
      await page.goto('/sistema/ruta-que-no-existe');
      await page.waitForURL('**/login', { timeout: 5000 });
      expect(page.url()).toContain('/login');
    });
  });
});
