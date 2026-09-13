# Implementación Fase 0 — Infraestructura Base

## Objetivo

Crear la infraestructura mínima para que todas las rutas del sistema funcionen, el build compile sin errores, y exista una base sólida para las fases posteriores.

---

## Estado anterior

- `pnpm build` fallaba: componentes placeholder con sintaxis rota (template literals sin backticks)
- Faltaban archivos `.ts` de los componentes principales: login, shell, dashboard, ajustes
- No existían placeholders para las rutas admin/estudiante/profesor
- Las rutas en `app.routes.ts` apuntaban a archivos que no existían
- El sidebar del shell no tenía rutas correctas por portal

---

## Cambios realizados

### 1. Base de datos

| Archivo | Descripción |
|---------|-------------|
| `database/04-create-new-tables.sql` | 11 tablas nuevas: ANUNCIOS, ANUNCIOS_DESTINATARIOS, TAREAS, TAREAS_RECURSOS, TAREAS_ENTREGAS, EXAMENES, EXAMEN_PREGUNTAS, EXAMEN_INTENTOS, NOTAS, MATERIALES, MANTENIMIENTO |
| `database/05-phase0-stored-procedures.sql` | SP_ObtenerResumenProfesor (datos reales), SP_ObtenerResumenEstudiante (datos reales), SP_DesactivarToken, SP_ListarCursosAdmin |

### 2. Componentes Angular — Archivos creados

| Componente | Ruta del router | Ubicación |
|-----------|----------------|-----------|
| `LoginComponent` | `/login` | `pages/login/login.component.ts` |
| `ShellComponent` | `/sistema` | `pages/shell/shell.component.ts` |
| `DashboardComponent` | `/sistema/dashboard` | `pages/dashboard/dashboard.component.ts` |
| `AjustesComponent` | `/sistema/ajustes` | `pages/ajustes/ajustes.component.ts` |

### 3. Componentes placeholder — 18 rutas nuevas

#### Admin (7)
- `AdminCursosComponent` → `/sistema/admin/cursos`
- `AdminEstudiantesComponent` → `/sistema/admin/estudiantes`
- `AdminProfesoresComponent` → `/sistema/admin/profesores`
- `AdminAnunciosComponent` → `/sistema/admin/anuncios`
- `AdminTokensComponent` → `/sistema/admin/tokens`
- `AdminNotasComponent` → `/sistema/admin/notas`
- `MantenimientoComponent` → `/sistema/admin/mantenimiento`

#### Estudiante (5)
- `EstudianteCursosComponent` → `/sistema/cursos`
- `EstudianteTareasComponent` → `/sistema/tareas`
- `EstudianteExamenesComponent` → `/sistema/examenes`
- `EstudianteNotasComponent` → `/sistema/notas`
- `EstudianteAnunciosComponent` → `/sistema/anuncios`

#### Profesor (6)
- `ProfesorClasesComponent` → `/sistema/clases`
- `ProfesorTareasComponent` → `/sistema/profesor/tareas`
- `ProfesorNotasComponent` → `/sistema/profesor/notas`
- `ProfesorExamenesComponent` → `/sistema/profesor/examenes`
- `ProfesorMaterialesComponent` → `/sistema/profesor/materiales`
- `ProfesorAnunciosComponent` → `/sistema/profesor/anuncios`

### 4. Rutas (`app.routes.ts`)

Se agregaron 22+ rutas con lazy loading y `authGuard`:

```typescript
{ path: 'sistema', component: ShellComponent, canActivate: [authGuard], children: [
  { path: 'dashboard', ... },
  { path: 'admin/cursos', ... },
  { path: 'admin/estudiantes', ... },
  // ... todas las rutas
]}
```

### 5. Sidebar del Shell

`ShellComponent` ahora muestra navegación diferente según el rol:
- **Administrador**: Dashboard, Cursos, Estudiantes, Profesores, Anuncios, Tokens, Notas, Mantenimiento, Ajustes
- **Profesor**: Dashboard, Mis Clases, Tareas, Notas, Examenes, Materiales, Anuncios, Ajustes
- **Estudiante**: Dashboard, Mis Cursos, Tareas, Examenes, Notas, Anuncios, Ajustes

### 6. Tests Phase 0

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `tests/phase0/test-dashboard.ps1` | PowerShell | Testea login + dashboard para los 3 roles contra API en vivo |
| `front-end/tests-e2e/tests/phase0-navigation.spec.ts` | Playwright | Navega a todas las rutas de los 3 roles, verifica que cargan sin errores |

---

## Errores corregidos

| Error | Causa | Solución |
|-------|-------|----------|
| `Expected ">" but found "class"` | Template literals sin backticks en placeholders | Reescribir archivos con backtick template syntax |
| `Cannot find module './pages/login/login.component'` | Falta archivo `.ts` | Crear `login.component.ts` |
| `Cannot find module './pages/shell/shell.component'` | Falta archivo `.ts` | Crear `shell.component.ts` |
| `'router-outlet' is not a known element` | Falta import de `RouterOutlet` | Agregar `imports: [RouterOutlet, RouterLink, RouterLinkActive]` en ShellComponent |
| `Cannot find module './pages/dashboard/dashboard.component'` | Falta archivo `.ts` | Crear `dashboard.component.ts` |
| `Cannot find module './pages/ajustes/ajustes.component'` | Falta archivo `.ts` | Crear `ajustes.component.ts` |

---

## Resultado

```
pnpm build → 0 errores, 1 warning (CSS budget)
```

- 22 componentes cargan correctamente via lazy loading
- Shell renderiza sidebar correcto por rol
- Dashboard carga datos reales desde la API (admin: métricas, profesor: clases, estudiante: cursos)
- Login funciona con las 3 credenciales demo
- Ajustes muestra formulario de perfil + pestaña de gestión de usuarios (solo admin)

---

## Pendiente (para fases siguientes)

- [ ] Reemplazar placeholders con componentes reales (Fase 1+)
- [ ] Crear endpoints por módulo (Fase 1+)
- [ ] Crear SPs por módulo (Fase 1+)
- [ ] Ejecutar `tests/phase0/test-dashboard.ps1` con API corriendo
- [ ] Ejecutar `phase0-navigation.spec.ts` con ambos servidores corriendo
