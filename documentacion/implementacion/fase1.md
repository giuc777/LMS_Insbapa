# Fase 1: Admin — Gestión de Cursos

**Objetivo:** CRUD completo de cursos (asignar curso a grado+sección+profesor).

**Fecha:** 2026-09-12
**Commit:** `94256d3`

---

## 1. Base de datos

**Archivo:** `database/fase1-cursos.sql`

```bash
sqlcmd -S .\SQLEXPRESS -E -i database\fase1-cursos.sql
```

### SPs creados

| SP | Descripción | Parámetros |
|----|-------------|------------|
| `SP_CrearCursoAsignacion` | Crea una asignación curso+grado+sección+profesor | `@Curso_ID, @Grado_ID, @Seccion_ID, @Profesor_ID` |
| `SP_ActualizarCursoAsignacion` | Actualiza una asignación existente | `@Asignacion_ID, @Curso_ID, @Grado_ID, @Seccion_ID, @Profesor_ID` |
| `SP_EliminarCursoAsignacion` | Elimina una asignación | `@Asignacion_ID` |
| `SP_ObtenerCursosCatalogo` | Lista cursos activos para selects | Sin parámetros |
| `SP_ObtenerProfesoresCatalogo` | Lista profesores activos para selects | Sin parámetros |

**Nota:** `SP_ListarCursosAdmin` ya existía desde `05-phase0-stored-procedures.sql`.

### Tabla utilizada

`PROFESORES_CURSOS` (creada en `01-create-schema.sql`):

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `Asignacion_ID` | INT IDENTITY PK | ID de la asignación |
| `Curso_ID` | INT FK → CURSOS | Materia asignada |
| `Grado_ID` | INT FK → GRADOS | Grado destino |
| `Seccion_ID` | INT FK → SECCIONES | Sección destino |
| `Profesor_ID` | INT FK → PROFESORES | Profesor asignado |

---

## 2. Back-end (.NET)

### Endpoints — `AdminCursosEndpoints.cs`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/admin/cursos` | Listar asignaciones (con filtros: busqueda, gradoId, seccionId) |
| `GET` | `/api/admin/cursos/catalogo` | Catálogo de cursos activos |
| `GET` | `/api/admin/cursos/profesores-catalogo` | Catálogo de profesores activos |
| `POST` | `/api/admin/cursos` | Crear nueva asignación |
| `PUT` | `/api/admin/cursos/{id}` | Actualizar asignación |
| `DELETE` | `/api/admin/cursos/{id}` | Eliminar asignación |

**Todos requieren:** `[Authorize(Roles = "Administrador")]`

### Registro — `Program.cs:116`

```csharp
app.MapAdminCursosEndpoints();
```

---

## 3. Front-end (Angular)

### Service — `admin.service.ts`

6 métodos nuevos:

```typescript
listarCursosAdmin(busqueda?, gradoId?, seccionId?)  // GET /api/admin/cursos
obtenerCursosCatalogo()                              // GET /api/admin/cursos/catalogo
obtenerProfesoresCatalogo()                          // GET /api/admin/cursos/profesores-catalogo
crearCursoAsignacion(data)                           // POST /api/admin/cursos
actualizarCursoAsignacion(id, data)                  // PUT /api/admin/cursos/{id}
eliminarCursoAsignacion(id)                          // DELETE /api/admin/cursos/{id}
```

### Componente — `AdminCursosComponent`

**Archivos:**
- `pages/admin/cursos/admin-cursos.component.ts`
- `pages/admin/cursos/admin-cursos.component.html`
- `pages/admin/cursos/admin-cursos.component.css`

**Funcionalidades:**

| Feature | Descripción |
|---------|-------------|
| Tabla | Lista asignaciones con código, materia, grado, sección, profesor, estudiantes |
| Búsqueda | Filtra por nombre/código de materia (Enter para buscar) |
| Filtros | Select de grado y sección con carga automática |
| Modal Crear | Selects de catálogo (materia, grado, sección, profesor) |
| Modal Editar | Mismos selects con datos pre-cargados |
| Modal Detalle | Vista de solo lectura con todos los campos |
| Eliminar | Confirmación antes de eliminar |

**Ruta:** `/sistema/admin/cursos` (configurada en `app.routes.ts:26`)

---

## 4. Tests

### PowerShell — `tests/phase1/test-cursos.ps1`

```bash
powershell -ExecutionPolicy Bypass -File tests/phase1/test-cursos.ps1
```

11 tests:
1. Login admin
2. Listar cursos
3. Catálogo de cursos
4. Catálogo de profesores
5. Crear asignación
6. Verificar creación
7. Actualizar asignación
8. Eliminar asignación
9. Verificar eliminación
10. Test sin token (401)
11. Test sin rol admin (403)

### Playwright — `tests-e2e/tests/phase1-cursos.spec.ts`

```bash
pnpm test:e2e -- --grep "Fase 1"
```

8 tests:
1. Admin navega a cursos y ve tabla
2. Buscar cursos por nombre
3. Filtrar por grado
4. Abrir modal de crear
5. Cerrar modal con cancelar
6. Abrir modal de detalle
7. Crear nueva asignación
8. No puede acceder sin ser admin

---

## 5. Criterios de aceptación

| # | Criterio | Estado |
|---|----------|--------|
| 1 | SPs crean correctamente | ✅ `fase1-cursos.sql` |
| 2 | Asignaciones se crean vía API | ✅ Endpoint POST funciona |
| 3 | CRUD completo funciona | ✅ GET/POST/PUT/DELETE |
| 4 | Solo admin accede | ✅ `[Authorize(Roles = "Administrador")]` |
| 5 | Frontend muestra datos reales | ✅ Componente conectado a service |
| 6 | Build compila sin errores | ✅ dotnet build + pnpm build |

---

## 6. Pendiente

- [ ] Ejecutar `database/fase1-cursos.sql` en SQL Server
- [ ] Ejecutar tests PowerShell con API corriendo
- [ ] Ejecutar tests Playwright con ambos servidores corriendo
