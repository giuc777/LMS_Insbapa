# Test Fase 1 — Admin Cursos

**Fecha:** 2026-09-13
**Estado:** ✅ PASS

---

## Tests PowerShell (API)

**Script:** `tests/phase1/test-cursos.ps1`

| # | Test | Endpoint | Resultado |
|---|------|----------|-----------|
| 1 | Login admin | `POST /api/auth/login` | ✅ PASS — Token JWT retornado |
| 2 | Listar cursos | `GET /api/admin/cursos` | ✅ PASS — 3 cursos encontrados |
| 3 | Catálogo de cursos | `GET /api/admin/cursos/catalogo` | ✅ PASS — Cursos activos |
| 4 | Catálogo de profesores | `GET /api/admin/cursos/profesores-catalogo` | ✅ PASS — Profesores activos |
| 5 | Crear asignación | `POST /api/admin/cursos` | ✅ PASS — ID: 4 retornado |
| 6 | Verificar creación | `GET /api/admin/cursos` | ✅ PASS — Asignación encontrada |
| 7 | Actualizar asignación | `PUT /api/admin/cursos/{id}` | ✅ PASS — Mensaje de éxito |
| 8 | Eliminar asignación | `DELETE /api/admin/cursos/{id}` | ✅ PASS — Eliminado |
| 9 | Verificar eliminación | `GET /api/admin/cursos` | ✅ PASS — Ya no existe |
| 10 | Sin token (401) | `GET /api/admin/cursos` | ✅ PASS — 401 retornado |
| 11 | Sin rol admin (403) | `GET /api/admin/cursos` | ✅ PASS — 403 retornado |

---

## Tests Playwright (E2E)

**Archivo:** `tests-e2e/tests/phase1-cursos.spec.ts`

| # | Test | Resultado |
|---|------|-----------|
| 1 | Admin navega a cursos y ve tabla | ✅ PASS |
| 2 | Buscar cursos por nombre | ✅ PASS |
| 3 | Filtrar por grado | ✅ PASS |
| 4 | Abrir modal de crear | ✅ PASS |
| 5 | Cerrar modal con cancelar | ✅ PASS |
| 6 | Abrir modal de detalle | ✅ PASS |
| 7 | Crear nueva asignación | ✅ PASS |
| 8 | No puede acceder sin ser admin | ✅ PASS |

---

## Resumen

| Tipo | Total | Pass | Fail |
|------|-------|------|------|
| PowerShell | 11 | 11 | 0 |
| Playwright | 8 | 8 | 0 |
| **Total** | **19** | **19** | **0** |

---

## Archivos involucrados

| Capa | Archivo |
|------|---------|
| DB | `database/fase1-cursos.sql` |
| .NET | `Endpoints/AdminCursosEndpoints.cs` |
| Angular | `services/admin.service.ts` |
| Angular | `pages/admin/cursos/admin-cursos.component.ts/html/css` |
| Tests | `tests/phase1/test-cursos.ps1` |
| Tests | `tests-e2e/tests/phase1-cursos.spec.ts` |
