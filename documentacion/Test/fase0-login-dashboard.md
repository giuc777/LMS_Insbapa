# Test Fase 0 — Login, Dashboard, Perfil

**Fecha:** 2026-09-12
**Estado:** ✅ PASS

---

## Tests PowerShell (API)

**Script:** `tests/phase0/test-dashboard.ps1`

| # | Test | Endpoint | Resultado |
|---|------|----------|-----------|
| 1 | Login admin | `POST /api/auth/login` | ✅ PASS — Token JWT retornado |
| 2 | Login profesor | `POST /api/auth/login` | ✅ PASS — Token JWT retornado |
| 3 | Login estudiante | `POST /api/auth/login` | ✅ PASS — Token JWT retornado |
| 4 | Dashboard admin | `GET /api/dashboard` | ✅ PASS — Datos retornados |
| 5 | Dashboard profesor | `GET /api/dashboard` | ✅ PASS — Datos retornados |
| 6 | Dashboard estudiante | `GET /api/dashboard` | ✅ PASS — Datos retornados |
| 7 | Perfil | `GET /api/auth/perfil` | ✅ PASS — Datos del usuario |
| 8 | Sin token (401) | `GET /api/dashboard` | ✅ PASS — 401 retornado |

---

## Tests Playwright (E2E)

**Archivo:** `tests-e2e/tests/phase0-navigation.spec.ts`

| # | Test | Resultado |
|---|------|-----------|
| 1 | Login exitoso admin | ✅ PASS |
| 2 | Login exitoso profesor | ✅ PASS |
| 3 | Login exitoso estudiante | ✅ PASS |
| 4 | Login fallido muestra error | ✅ PASS |
| 5 | Dashboard carga para admin | ✅ PASS |
| 6 | Sidebar muestra menú correcto por rol | ✅ PASS |
| 7 | Logout redirige a login | ✅ PASS |

---

## Resumen

| Tipo | Total | Pass | Fail |
|------|-------|------|------|
| PowerShell | 8 | 8 | 0 |
| Playwright | 7 | 7 | 0 |
| **Total** | **15** | **15** | **0** |
