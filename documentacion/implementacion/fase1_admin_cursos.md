# Fase 1: Admin — Gestión de Cursos

**Objetivo:** CRUD completo de cursos (asignar curso a grado+sección+profesor).

---

## 1. Stored Procedures

### 1.1 SP_ListarCursosAdmin

```sql
CREATE PROCEDURE SP_ListarCursosAdmin
    @Busqueda NVARCHAR(100) = NULL,
    @Grado_ID INT = NULL,
    @Seccion_ID INT = NULL
AS
BEGIN
    SELECT
        pc.Asignacion_ID,
        c.Curso_ID,
        c.Codigo,
        c.Nombre AS Materia,
        c.Area,
        g.Grado_ID,
        g.Nombre AS Grado,
        s.Seccion_ID,
        s.Nombre AS Seccion,
        p.PrimerNombre + ' ' + ISNULL(p.SegundoNombre, '') + ' ' + p.PrimerApellido + ' ' + ISNULL(p.SegundoApellido, '') AS Profesor,
        p.Profesor_ID,
        (SELECT COUNT(*) FROM ESTUDIANTES e WHERE e.Grado_ID = g.Grado_ID AND e.Seccion_ID = s.Seccion_ID) AS Estudiantes
    FROM PROFESORES_CURSOS pc
    INNER JOIN CURSOS c ON pc.Curso_ID = c.Curso_ID
    INNER JOIN GRADOS g ON pc.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON pc.Seccion_ID = s.Seccion_ID
    INNER JOIN PROFESORES pr ON pc.Profesor_ID = pr.Profesor_ID
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    WHERE c.Activo = 1
        AND (@Busqueda IS NULL OR c.Nombre LIKE '%' + @Busqueda + '%' OR c.Codigo LIKE '%' + @Busqueda + '%')
        AND (@Grado_ID IS NULL OR g.Grado_ID = @Grado_ID)
        AND (@Seccion_ID IS NULL OR s.Seccion_ID = @Seccion_ID)
    ORDER BY g.Orden, s.Nombre, c.Nombre;
END;
```

### 1.2 SP_CrearCursoAsignacion

```sql
CREATE PROCEDURE SP_CrearCursoAsignacion
    @Curso_ID INT,
    @Grado_ID INT,
    @Seccion_ID INT,
    @Profesor_ID INT
AS
BEGIN
    -- Verificar que no exista ya la asignación
    IF EXISTS (SELECT 1 FROM PROFESORES_CURSOS WHERE Curso_ID = @Curso_ID AND Grado_ID = @Grado_ID AND Seccion_ID = @Seccion_ID)
    BEGIN
        SELECT 0 AS Asignacion_ID, 'Ya existe esta asignación de curso' AS Mensaje;
        RETURN;
    END

    INSERT INTO PROFESORES_CURSOS (Curso_ID, Grado_ID, Seccion_ID, Profesor_ID)
    VALUES (@Curso_ID, @Grado_ID, @Seccion_ID, @Profesor_ID);

    SELECT SCOPE_IDENTITY() AS Asignacion_ID, 'Curso asignado correctamente' AS Mensaje;
END;
```

### 1.3 SP_ActualizarCursoAsignacion

```sql
CREATE PROCEDURE SP_ActualizarCursoAsignacion
    @Asignacion_ID INT,
    @Curso_ID INT,
    @Grado_ID INT,
    @Seccion_ID INT,
    @Profesor_ID INT
AS
BEGIN
    -- Verificar que no exista otra asignación igual (excluyendo la actual)
    IF EXISTS (SELECT 1 FROM PROFESORES_CURSOS WHERE Curso_ID = @Curso_ID AND Grado_ID = @Grado_ID AND Seccion_ID = @Seccion_ID AND Asignacion_ID != @Asignacion_ID)
    BEGIN
        SELECT 0 AS Resultado, 'Ya existe esta asignación de curso' AS Mensaje;
        RETURN;
    END

    UPDATE PROFESORES_CURSOS
    SET Curso_ID = @Curso_ID, Grado_ID = @Grado_ID, Seccion_ID = @Seccion_ID, Profesor_ID = @Profesor_ID
    WHERE Asignacion_ID = @Asignacion_ID;

    SELECT 1 AS Resultado, 'Curso actualizado correctamente' AS Mensaje;
END;
```

### 1.4 SP_EliminarCursoAsignacion (soft delete)

```sql
CREATE PROCEDURE SP_EliminarCursoAsignacion
    @Asignacion_ID INT
AS
BEGIN
    DELETE FROM PROFESORES_CURSOS WHERE Asignacion_ID = @Asignacion_ID;
    SELECT 1 AS Resultado, 'Curso eliminado correctamente' AS Mensaje;
END;
```

### 1.5 SP_ObtenerCursosCatalogo

```sql
CREATE PROCEDURE SP_ObtenerCursosCatalogo
AS
BEGIN
    SELECT Curso_ID, Codigo, Nombre, Area
    FROM CURSOS
    WHERE Activo = 1
    ORDER BY Nombre;
END;
```

### 1.6 SP_ObtenerProfesoresCatalogo

```sql
CREATE PROCEDURE SP_ObtenerProfesoresCatalogo
AS
BEGIN
    SELECT
        pr.Profesor_ID,
        pr.CodigoProfesor,
        p.PrimerNombre + ' ' + ISNULL(p.SegundoNombre, '') + ' ' + p.PrimerApellido AS Nombre
    FROM PROFESORES pr
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    INNER JOIN USUARIOS u ON pr.Usuario_ID = u.Usuario_ID
    WHERE u.Activo = 1
    ORDER BY p.PrimerApellido;
END;
```

---

## 2. Endpoints (.NET)

### 2.1 Crear archivo `Endpoints/AdminCursosEndpoints.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using System.Data;

namespace API_LMS.Endpoints;

public static class AdminCursosEndpoints
{
    public static void MapAdminCursosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin/cursos")
            .RequireAuthorization()
            .WithTags("Admin");

        group.MapGet("/", [Authorize(Roles = "Administrador")] async (
            string? busqueda, int? gradoId, int? seccionId, DbService db) =>
        {
            var param = new Dictionary<string, object?>();
            if (!string.IsNullOrEmpty(busqueda)) param["@Busqueda"] = busqueda;
            if (gradoId.HasValue) param["@Grado_ID"] = gradoId;
            if (seccionId.HasValue) param["@Seccion_ID"] = seccionId;
            var result = await db.EjecutarSpAsync("SP_ListarCursosAdmin", param);
            return Results.Ok(result);
        })
        .WithName("ListarCursosAdmin")
        .Produces(200);

        group.MapGet("/catalogo", [Authorize(Roles = "Administrador")] async (DbService db) =>
        {
            var result = await db.EjecutarSpAsync("SP_ObtenerCursosCatalogo");
            return Results.Ok(result);
        })
        .WithName("ObtenerCursosCatalogo")
        .Produces(200);

        group.MapGet("/profesores-catalogo", [Authorize(Roles = "Administrador")] async (DbService db) =>
        {
            var result = await db.EjecutarSpAsync("SP_ObtenerProfesoresCatalogo");
            return Results.Ok(result);
        })
        .WithName("ObtenerProfesoresCatalogo")
        .Produces(200);

        group.MapPost("/", [Authorize(Roles = "Administrador")] async (
            CrearCursoAsignacionRequest request, DbService db) =>
        {
            var param = new Dictionary<string, object?>
            {
                ["@Curso_ID"] = request.CursoId,
                ["@Grado_ID"] = request.GradoId,
                ["@Seccion_ID"] = request.SeccionId,
                ["@Profesor_ID"] = request.ProfesorId
            };
            var result = await db.EjecutarSpAsync("SP_CrearCursoAsignacion", param);
            if (result.Count == 0) return Results.BadRequest(new { error = "Error al crear curso" });
            var first = result[0];
            if (Convert.ToInt32(first["Asignacion_ID"]) == 0)
                return Results.BadRequest(new { error = first["Mensaje"]?.ToString() });
            return Results.Ok(new { asignacionId = first["Asignacion_ID"], message = first["Mensaje"]?.ToString() });
        })
        .WithName("CrearCursoAsignacion")
        .Produces(200)
        .Produces(400);

        group.MapPut("/{id}", [Authorize(Roles = "Administrador")] async (
            int id, CrearCursoAsignacionRequest request, DbService db) =>
        {
            var param = new Dictionary<string, object?>
            {
                ["@Asignacion_ID"] = id,
                ["@Curso_ID"] = request.CursoId,
                ["@Grado_ID"] = request.GradoId,
                ["@Seccion_ID"] = request.SeccionId,
                ["@Profesor_ID"] = request.ProfesorId
            };
            var result = await db.EjecutarSpAsync("SP_ActualizarCursoAsignacion", param);
            if (result.Count == 0) return Results.BadRequest(new { error = "Error al actualizar" });
            var first = result[0];
            if (Convert.ToInt32(first["Resultado"]) == 0)
                return Results.BadRequest(new { error = first["Mensaje"]?.ToString() });
            return Results.Ok(new { message = first["Mensaje"]?.ToString() });
        })
        .WithName("ActualizarCursoAsignacion")
        .Produces(200)
        .Produces(400);

        group.MapDelete("/{id}", [Authorize(Roles = "Administrador")] async (
            int id, DbService db) =>
        {
            var param = new Dictionary<string, object?> { ["@Asignacion_ID"] = id };
            var result = await db.EjecutarSpAsync("SP_EliminarCursoAsignacion", param);
            return Results.Ok(new { message = "Curso eliminado" });
        })
        .WithName("EliminarCursoAsignacion")
        .Produces(200);
    }
}

public record CrearCursoAsignacionRequest(
    int CursoId, int GradoId, int SeccionId, int ProfesorId
);
```

### 2.2 Registrar en `Program.cs`

Agregar después de `MapAdminUsuariosEndpoints()`:

```csharp
app.MapAdminCursosEndpoints();
```

---

## 3. Tests PowerShell

Crear archivo `tests/phase1/test-cursos.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

# Login admin
$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $loginResp.token
$headers = @{ Authorization = "Bearer $token" }

Write-Host "=== Fase 1: Tests de Cursos ==="

# 1. Listar cursos existentes
Write-Host "`n--- Listar Cursos ---"
$cursos = Invoke-RestMethod -Uri "$BaseUrl/api/admin/cursos" -Method GET -Headers $headers
Write-Host "Cursos encontrados: $($cursos.Count)"
$cursos | ForEach-Object { Write-Host "  $($_.Codigo) - $($_.Materia) ($($_.Grado) $($_.Seccion)) - Prof: $($_.Profesor)" }

# 2. Obtener catálogo de cursos
Write-Host "`n--- Catálogo de Cursos ---"
$catalogo = Invoke-RestMethod -Uri "$BaseUrl/api/admin/cursos/catalogo" -Method GET -Headers $headers
Write-Host "Cursos en catálogo: $($catalogo.Count)"
$catalogo | ForEach-Object { Write-Host "  $($_.Codigo) - $($_.Nombre)" }

# 3. Obtener catálogo de profesores
Write-Host "`n--- Catálogo de Profesores ---"
$profes = Invoke-RestMethod -Uri "$BaseUrl/api/admin/cursos/profesores-catalogo" -Method GET -Headers $headers
Write-Host "Profesores: $($profes.Count)"
$profes | ForEach-Object { Write-Host "  $($_.CodigoProfesor) - $($_.Nombre)" }

# 4. Crear nueva asignación de curso
Write-Host "`n--- Crear Asignación ---"
$curso = $catalogo[0]  # Primer curso del catálogo
$nuevaAsignacion = @{
    cursoId = $curso.Curso_ID
    gradoId = 1  # Primero Básico
    seccionId = 1  # Sección A
    profesorId = $profes[0].Profesor_ID
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$BaseUrl/api/admin/cursos" -Method POST -ContentType "application/json" -Headers $headers -Body $nuevaAsignacion
Write-Host "Resultado: $($result | ConvertTo-Json -Compress)"

# 5. Verificar que la asignación se creó
Write-Host "`n--- Verificar Creación ---"
$cursosActualizados = Invoke-RestMethod -Uri "$BaseUrl/api/admin/cursos" -Method GET -Headers $headers
$nueva = $cursosActualizados | Where-Object { $_.Asignacion_ID -eq $result.asignacionId }
if ($nueva) { Write-Host "OK: Asignación encontrada" } else { Write-Host "FAIL: Asignación no encontrada" }

# 6. Actualizar asignación (cambiar profesor)
Write-Host "`n--- Actualizar Asignación ---"
$profesor2 = $profes[1] if $profes.Count -gt 1 else $profes[0]
$actualizar = @{
    cursoId = $curso.Curso_ID
    gradoId = 1
    seccionId = 2  # Cambiar a Sección B
    profesorId = $profesor2.Profesor_ID
} | ConvertTo-Json
$updateResult = Invoke-RestMethod -Uri "$BaseUrl/api/admin/cursos/$($result.asignacionId)" -Method PUT -ContentType "application/json" -Headers $headers -Body $actualizar
Write-Host "Resultado: $($updateResult | ConvertTo-Json -Compress)"

# 7. Eliminar asignación
Write-Host "`n--- Eliminar Asignación ---"
$deleteResult = Invoke-RestMethod -Uri "$BaseUrl/api/admin/cursos/$($result.asignacionId)" -Method DELETE -Headers $headers
Write-Host "Resultado: $($deleteResult | ConvertTo-Json -Compress)"

# 8. Verificar eliminación
Write-Host "`n--- Verificar Eliminación ---"
$cursosFinales = Invoke-RustMethod -Uri "$BaseUrl/api/admin/cursos" -Method GET -Headers $headers
$eliminada = $cursosFinales | Where-Object { $_.Asignacion_ID -eq $result.asignacionId }
if (-not $eliminada) { Write-Host "OK: Asignación eliminada" } else { Write-Host "FAIL: Asignación aún existe" }

# 9. Test sin token
Write-Host "`n--- Test Sin Token ---"
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/admin/cursos" -Method GET
    Write-Host "FAIL: Debería haber retornado 401"
} catch {
    Write-Host "OK: 401 retornado"
}

# 10. Test con usuario no-admin
Write-Host "`n--- Test Sin Rol Admin ---"
$loginEst = @{ username = "estudiante"; password = "estudiante123" } | ConvertTo-Json
$respEst = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginEst
$headersEst = @{ Authorization = "Bearer $($respEst.token)" }
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/admin/cursos" -Method GET -Headers $headersEst
    Write-Host "FAIL: Debería haber retornado 403"
} catch {
    Write-Host "OK: 403 retornado (o 401)"
}

Write-Host "`n=== Fase 1: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Servicio — `admin.service.ts`

Agregar métodos al servicio existente:

```typescript
// En admin.service.ts, agregar:

listarCursosAdmin(busqueda?: string, gradoId?: number, seccionId?: number) {
  let params = new HttpParams();
  if (busqueda) params = params.set('busqueda', busqueda);
  if (gradoId) params = params.set('gradoId', gradoId.toString());
  if (seccionId) params = params.set('seccionId', seccionId.toString());
  return this.http.get<any[]>(`${this.apiUrl}/api/admin/cursos`, { params });
}

obtenerCursosCatalogo() {
  return this.http.get<any[]>(`${this.apiUrl}/api/admin/cursos/catalogo`);
}

obtenerProfesoresCatalogo() {
  return this.http.get<any[]>(`${this.apiUrl}/api/admin/cursos/profesores-catalogo`);
}

crearCursoAsignacion(data: any) {
  return this.http.post<{ asignacionId: number; message: string }>(`${this.apiUrl}/api/admin/cursos`, data);
}

actualizarCursoAsignacion(id: number, data: any) {
  return this.http.put<{ message: string }>(`${this.apiUrl}/api/admin/cursos/${id}`, data);
}

eliminarCursoAsignacion(id: number) {
  return this.http.delete<{ message: string }>(`${this.apiUrl}/api/admin/cursos/${id}`);
}
```

### 4.2 Componente — `AdminCursosComponent`

**`pages/admin/cursos/admin-cursos.component.ts`**:

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-cursos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-cursos.component.html',
  styleUrl: './admin-cursos.component.css'
})
export class AdminCursosComponent implements OnInit {
  cursos = signal<any[]>([]);
  grados = signal<any[]>([]);
  secciones = signal<any[]>([]);
  cursosCatalogo = signal<any[]>([]);
  profesoresCatalogo = signal<any[]>([]);

  busqueda = signal('');
  gradoFiltro = signal<number | ''>('');
  seccionFiltro = signal<number | ''>('');
  loading = signal(false);

  mostrarModal = signal(false);
  esEdicion = signal(false);
  asignacionEditId = signal(0);
  formMensaje = signal('');
  formExito = signal(false);
  formLoading = signal(false);

  mostrarDetalle = signal(false);
  cursoDetalle = signal<any>(null);

  form = { cursoId: 0, gradoId: 0, seccionId: 0, profesorId: 0 };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarDatos();
  }

  cargarCatalogos(): void {
    this.adminService.obtenerGrados().subscribe({ next: (d) => this.grados.set(d) });
    this.adminService.obtenerSecciones().subscribe({ next: (d) => this.secciones.set(d) });
    this.adminService.obtenerCursosCatalogo().subscribe({ next: (d) => this.cursosCatalogo.set(d) });
    this.adminService.obtenerProfesoresCatalogo().subscribe({ next: (d) => this.profesoresCatalogo.set(d) });
  }

  cargarDatos(): void {
    this.loading.set(true);
    const grado = this.gradoFiltro() || undefined;
    const seccion = this.seccionFiltro() || undefined;
    this.adminService.listarCursosAdmin(this.busqueda() || undefined, grado, seccion).subscribe({
      next: (d) => { this.cursos.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirCrear(): void {
    this.esEdicion.set(false);
    this.form = { cursoId: 0, gradoId: 0, seccionId: 0, profesorId: 0 };
    this.formMensaje.set('');
    this.mostrarModal.set(true);
  }

  abrirEditar(curso: any): void {
    this.esEdicion.set(true);
    this.asignacionEditId.set(curso.Asignacion_ID);
    this.form = {
      cursoId: curso.Curso_ID,
      gradoId: curso.Grado_ID,
      seccionId: curso.Seccion_ID,
      profesorId: curso.Profesor_ID,
    };
    this.formMensaje.set('');
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  submit(): void {
    if (!this.form.cursoId || !this.form.gradoId || !this.form.seccionId || !this.form.profesorId) {
      this.formExito.set(false);
      this.formMensaje.set('Complete todos los campos.');
      return;
    }

    this.formLoading.set(true);
    const obs = this.esEdicion()
      ? this.adminService.actualizarCursoAsignacion(this.asignacionEditId(), this.form)
      : this.adminService.crearCursoAsignacion(this.form);

    obs.subscribe({
      next: (res) => {
        this.formExito.set(true);
        this.formMensaje.set(res.message || 'Operación exitosa');
        this.formLoading.set(false);
        this.cargarDatos();
        setTimeout(() => this.cerrarModal(), 1500);
      },
      error: (err) => {
        this.formExito.set(false);
        this.formMensaje.set(err.error?.error || 'Error en la operación');
        this.formLoading.set(false);
      }
    });
  }

  eliminar(curso: any): void {
    if (!confirm(`¿Eliminar ${curso.Materia} (${curso.Grado} ${curso.Seccion})?`)) return;
    this.adminService.eliminarCursoAsignacion(curso.Asignacion_ID).subscribe({
      next: () => this.cargarDatos(),
      error: () => alert('Error al eliminar')
    });
  }

  verDetalle(curso: any): void {
    this.cursoDetalle.set(curso);
    this.mostrarDetalle.set(true);
  }

  cerrarDetalle(): void {
    this.mostrarDetalle.set(false);
  }
}
```

**`pages/admin/cursos/admin-cursos.component.html`**:

```html
<div class="page-head">
  <div class="crumb">Administrador / Cursos</div>
  <h2>Gestión de Cursos</h2>
  <div class="page-sub">Asignar materias a grados, secciones y profesores</div>
</div>

<div class="toolbar">
  <div class="search-box">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input type="text" placeholder="Buscar materia..." [value]="busqueda()" (input)="busqueda.set($any($event.target).value)" (keyup.enter)="cargarDatos()">
  </div>

  <select class="form-select" [value]="gradoFiltro()" (change)="gradoFiltro.set($any($event.target).value); cargarDatos()">
    <option value="">Todos los grados</option>
    @for (g of grados(); track g.Grado_ID) {
      <option [value]="g.Grado_ID">{{ g.Nombre }}</option>
    }
  </select>

  <select class="form-select" [value]="seccionFiltro()" (change)="seccionFiltro.set($any($event.target).value); cargarDatos()">
    <option value="">Todas las secciones</option>
    @for (s of secciones(); track s.Seccion_ID) {
      <option [value]="s.Seccion_ID">{{ s.Nombre }}</option>
    }
  </select>

  <button class="btn btn-primary" (click)="abrirCrear()">+ Asignar Curso</button>
</div>

@if (loading()) {
  <div class="loading">Cargando cursos...</div>
} @else {
  @if (cursos().length === 0) {
    <div class="empty">No se encontraron cursos asignados.</div>
  } @else {
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Materia</th>
            <th>Grado</th>
            <th>Sección</th>
            <th>Profesor</th>
            <th>Estudiantes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (c of cursos(); track c.Asignacion_ID) {
            <tr>
              <td><code>{{ c.Codigo }}</code></td>
              <td>{{ c.Materia }}</td>
              <td>{{ c.Grado }}</td>
              <td>{{ c.Seccion }}</td>
              <td>{{ c.Profesor }}</td>
              <td>{{ c.Estudiantes }}</td>
              <td class="acciones">
                <button class="btn-icon" title="Ver detalle" (click)="verDetalle(c)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-icon" title="Editar" (click)="abrirEditar(c)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon" title="Eliminar" (click)="eliminar(c)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  }
}

<!-- Modal Crear/Editar -->
@if (mostrarModal()) {
  <div class="modal-overlay" (click)="cerrarModal()">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>{{ esEdicion() ? 'Editar' : 'Asignar' }} Curso</h3>
        <button class="modal-close" (click)="cerrarModal()">&times;</button>
      </div>
      <div class="modal-body">
        @if (formMensaje()) {
          <div class="alert" [class.alert-success]="formExito()" [class.alert-error]="!formExito()">{{ formMensaje() }}</div>
        }

        <div class="form-group">
          <label class="form-label">Materia *</label>
          <select class="form-control" [(ngModel)]="form.cursoId">
            <option value="0">Seleccione...</option>
            @for (c of cursosCatalogo(); track c.Curso_ID) {
              <option [value]="c.Curso_ID">{{ c.Nombre }} ({{ c.Codigo }})</option>
            }
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Grado *</label>
            <select class="form-control" [(ngModel)]="form.gradoId">
              <option value="0">Seleccione...</option>
              @for (g of grados(); track g.Grado_ID) {
                <option [value]="g.Grado_ID">{{ g.Nombre }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sección *</label>
            <select class="form-control" [(ngModel)]="form.seccionId">
              <option value="0">Seleccione...</option>
              @for (s of secciones(); track s.Seccion_ID) {
                <option [value]="s.Seccion_ID">{{ s.Nombre }}</option>
              }
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Profesor *</label>
          <select class="form-control" [(ngModel)]="form.profesorId">
            <option value="0">Seleccione...</option>
            @for (p of profesoresCatalogo(); track p.Profesor_ID) {
              <option [value]="p.Profesor_ID">{{ p.Nombre }} ({{ p.CodigoProfesor }})</option>
            }
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
        <button class="btn btn-primary" (click)="submit()" [disabled]="formLoading()">
          @if (formLoading()) { Guardando... } @else { {{ esEdicion() ? 'Actualizar' : 'Asignar' }} }
        </button>
      </div>
    </div>
  </div>
}

<!-- Modal Detalle -->
@if (mostrarDetalle()) {
  <div class="modal-overlay" (click)="cerrarDetalle()">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>Detalle del Curso</h3>
        <button class="modal-close" (click)="cerrarDetalle()">&times;</button>
      </div>
      <div class="modal-body">
        @if (cursoDetalle(); as c) {
          <div class="detail-row"><strong>Materia:</strong> {{ c.Materia }} ({{ c.Codigo }})</div>
          <div class="detail-row"><strong>Área:</strong> {{ c.Area }}</div>
          <div class="detail-row"><strong>Grado:</strong> {{ c.Grado }}</div>
          <div class="detail-row"><strong>Sección:</strong> {{ c.Seccion }}</div>
          <div class="detail-row"><strong>Profesor:</strong> {{ c.Profesor }}</div>
          <div class="detail-row"><strong>Estudiantes:</strong> {{ c.Estudiantes }}</div>
        }
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" (click)="cerrarDetalle()">Cerrar</button>
      </div>
    </div>
  </div>
}
```

**`pages/admin/cursos/admin-cursos.component.css`**:

```css
.page-head { margin-bottom: 24px; }
.page-head .crumb { font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.page-head h2 { font-size: 24px; font-weight: 700; color: var(--ink); margin: 0 0 4px 0; }
.page-head .page-sub { font-size: 14px; color: var(--muted); }

.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.search-box { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); flex: 1; min-width: 200px; }
.search-box input { border: none; outline: none; font-size: 14px; font-family: var(--font); color: var(--text); width: 100%; background: transparent; }
.search-box svg { color: var(--muted); flex-shrink: 0; }

.form-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font); color: var(--text); background: var(--surface); outline: none; }

.loading, .empty { text-align: center; padding: 40px 20px; color: var(--muted); font-size: 14px; }

.table-wrapper { overflow-x: auto; border: 1px solid var(--border-soft); border-radius: var(--radius); }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { text-align: left; padding: 12px 16px; background: var(--surface-soft); font-weight: 600; color: var(--ink); border-bottom: 1px solid var(--border-soft); white-space: nowrap; }
.data-table td { padding: 12px 16px; border-bottom: 1px solid var(--border-soft); color: var(--text); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover { background: var(--surface-soft); }
.data-table code { background: var(--surface-soft); padding: 2px 8px; border-radius: 4px; font-size: 13px; }
.acciones { white-space: nowrap; }

.btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--muted); cursor: pointer; transition: all 0.15s; }
.btn-icon:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-soft); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; font-family: var(--font); cursor: pointer; transition: all 0.15s; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: var(--surface-soft); color: var(--text); border: 1px solid var(--border); }
.btn-secondary:hover { background: var(--border-soft); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: var(--surface); border-radius: var(--radius); width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border-soft); }
.modal-header h3 { font-size: 18px; font-weight: 600; color: var(--ink); margin: 0; }
.modal-close { background: none; border: none; font-size: 24px; color: var(--muted); cursor: pointer; }
.modal-close:hover { color: var(--ink); }
.modal-body { padding: 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--border-soft); }

.alert { padding: 10px 14px; border-radius: var(--radius-sm); font-size: 14px; margin-bottom: 16px; border: 1px solid; }
.alert-success { background: var(--primary-soft); color: var(--primary-dark); border-color: var(--primary); }
.alert-error { background: var(--danger-soft); color: var(--danger); border-color: var(--danger); }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 14px; font-weight: 500; color: var(--ink); margin-bottom: 6px; }
.form-control { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font); color: var(--text); background: var(--surface); outline: none; box-sizing: border-box; }
.form-control:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(82, 163, 68, 0.15); }

.detail-row { padding: 8px 0; border-bottom: 1px solid var(--border-soft); font-size: 14px; }
.detail-row:last-child { border-bottom: none; }
.detail-row strong { color: var(--ink); }
```

### 4.3 Ruta

En `app.routes.ts` la ruta `/sistema/admin/cursos` ya apunta a `AdminCursosComponent` (creada en Fase 0).

---

## 5. Tests Playwright

Crear archivo `tests-e2e/tests/phase1-cursos.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 1 - Admin Cursos', () => {

  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/login');
    await page.getByLabel('Administrador').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.admin.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.admin.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await expect(page).toHaveURL(/\/sistema\/dashboard/);
  });

  test('navegar a cursos y ver tabla', async ({ page }) => {
    await page.getByRole('link', { name: 'Cursos' }).click();
    await expect(page).toHaveURL(/\/sistema\/admin\/cursos/);
    await expect(page.getByText('Gestión de Cursos')).toBeVisible();
    await expect(page.locator('table.data-table')).toBeVisible();
  });

  test('buscar cursos por nombre', async ({ page }) => {
    await page.getByRole('link', { name: 'Cursos' }).click();
    await page.getByPlaceholder('Buscar materia...').fill('MATE');
    await page.getByPlaceholder('Buscar materia...').press('Enter');
    // Esperar que la tabla se actualice
    await page.waitForTimeout(500);
    const rows = page.locator('table.data-table tbody tr');
    await expect(rows).toHaveCount(await rows.count());
  });

  test('filtrar por grado y sección', async ({ page }) => {
    await page.getByRole('link', { name: 'Cursos' }).click();
    // Seleccionar primer grado
    await page.locator('select').nth(0).selectOption({ index: 1 });
    await page.waitForTimeout(500);
  });

  test('abrir modal de crear curso', async ({ page }) => {
    await page.getByRole('link', { name: 'Cursos' }).click();
    await page.getByRole('button', { name: /asignar curso/i }).click();
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.getByText('Asignar Curso')).toBeVisible();
    // Verificar que los selects de catálogo están cargados
    await expect(page.locator('.modal select').first()).not.toHaveValue('0');
  });

  test('abrir y cerrar modal de detalle', async ({ page }) => {
    await page.getByRole('link', { name: 'Cursos' }).click();
    // Esperar a que haya datos
    await page.waitForSelector('table.data-table tbody tr');
    // Click en primer botón de ver detalle (ojo)
    await page.locator('table.data-table tbody tr').first().locator('button').first().click();
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.getByText('Detalle del Curso')).toBeVisible();
    // Cerrar
    await page.getByRole('button', { name: /cerrar/i }).click();
    await expect(page.locator('.modal')).not.toBeVisible();
  });

  test('crear nueva asignación de curso', async ({ page }) => {
    await page.getByRole('link', { name: 'Cursos' }).click();
    await page.getByRole('button', { name: /asignar curso/i }).click();

    // Seleccionar materia
    await page.locator('.modal select').nth(0).selectOption({ index: 1 });
    // Seleccionar grado
    await page.locator('.modal select').nth(1).selectOption({ index: 1 });
    // Seleccionar sección
    await page.locator('.modal select').nth(2).selectOption({ index: 1 });
    // Seleccionar profesor
    await page.locator('.modal select').nth(3).selectOption({ index: 1 });

    // Submit
    await page.getByRole('button', { name: /asignar/i }).last().click();

    // Esperar mensaje de éxito
    await expect(page.locator('.alert-success')).toBeVisible({ timeout: 5000 });
  });

  test('no puede acceder sin ser admin', async ({ page }) => {
    // Logout y login como estudiante
    await page.goto('/login');
    await page.getByLabel('Estudiante').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.student.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.student.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await expect(page).toHaveURL(/\/sistema\/dashboard/);

    // Intentar navegar directamente a admin/cursos
    await page.goto('/sistema/admin/cursos');
    // Debe ser redirigido (no debería ver la tabla de cursos de admin)
    await expect(page).not.toHaveURL(/\/sistema\/admin\/cursos/);
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | SPs crean la tabla correctamente | Ejecutar `01-create-schema.sql` sin errores |
| 2 | Asignaciones de curso se crean | Test PowerShell crea y verifica una asignación |
| 3 | Endpoints responden correctamente | PowerShell muestra 200 en GET/POST/PUT/DELETE |
| 4 | Componente muestra datos reales | `pnpm build` compila, browser muestra cursos |
| 5 | CRUD funciona en el UI | Playwright prueba crear, listar, editar, eliminar |
| 6 | Solo admin puede acceder | Playwright verifica que estudiante no ve admin/cursos |
