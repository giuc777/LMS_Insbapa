# Test Fase 2 — Admin Estudiantes

**Fecha:** 2026-09-13
**Estado:** ✅ PASS

---

## Tests PowerShell (API)

**Script:** `tests/phase2/test-estudiantes-admin.ps1`

| # | Test | Endpoint | Resultado |
|---|------|----------|-----------|
| 1 | Listar estudiantes paginado | `GET /api/admin/estudiantes?pagina=1&tamanioPagina=10` | ✅ PASS — 2 resultados |
| 2 | Buscar por nombre | `GET /api/admin/estudiantes?busqueda=Maria` | ✅ PASS — 2 encontrados |
| 3 | Filtrar por grado | `GET /api/admin/estudiantes?gradoId=1` | ✅ PASS — 2 en Grado 1 |
| 4 | Obtener detalle | `GET /api/admin/estudiantes/{id}` | ✅ PASS — ID: 2, Ana Giron |
| 5 | Cursos inscritos | `GET /api/admin/estudiantes/{id}/cursos` | ✅ PASS — 2 cursos |
| 6 | Actualizar estudiante | `PUT /api/admin/estudiantes/{id}` | ✅ PASS — "Estudiante actualizado correctamente" |
| 7 | Sin token (401) | `GET /api/admin/estudiantes` | ✅ PASS — 401 retornado |

---

## Tests Playwright (E2E)

**Archivo:** `tests-e2e/tests/phase2-estudiantes-admin.spec.ts`

| # | Test | Resultado |
|---|------|-----------|
| 1 | Admin navega a estudiantes y ve tabla | ✅ PASS |
| 2 | Buscar estudiante por nombre | ✅ PASS |
| 3 | Filtrar por grado | ✅ PASS |
| 4 | Abrir modal de registrar estudiante | ✅ PASS |
| 5 | Cerrar modal con cancelar | ✅ PASS |
| 6 | Abrir modal de perfil del estudiante | ✅ PASS |
| 7 | Abrir modal de edición | ✅ PASS |
| 8 | Estudiante no puede acceder a gestión | ✅ PASS |

---

## Resumen

| Tipo | Total | Pass | Fail |
|------|-------|------|------|
| PowerShell | 7 | 7 | 0 |
| Playwright | 8 | 8 | 0 |
| **Total** | **15** | **15** | **0** |

---

## Datos de prueba retornados

| Campo | Valor |
|-------|-------|
| Estudiante ID | 2 |
| Nombre | Ana Giron |
| Carnet | 20260002 |
| Grado | Primero Básico A |
| Estado | Activo |
| Cursos inscritos | Ciencias Naturales, Matemáticas I |

---

## Archivos involucrados

| Capa | Archivo |
|------|---------|
| DB | `database/fase2-estudiantes.sql` |
| .NET | `Endpoints/AdminUsuariosEndpoints.cs` (3 endpoints nuevos) |
| Angular | `services/admin.service.ts` (3 métodos nuevos) |
| Angular | `pages/admin/estudiantes/admin-estudiantes.component.ts/html/css` |
| Tests | `tests/phase2/test-estudiantes-admin.ps1` |
| Tests | `tests-e2e/tests/phase2-estudiantes-admin.spec.ts` |
