# Fase 0: Infraestructura — Tablas, Rutas y Shell

**Objetivo:** Preparar la base de datos con todas las tablas necesarias y configurar el enrutamiento por rol en el front-end.

---

## 1. Stored Procedures

### 1.1 Tablas nuevas en `01-create-schema.sql`

Agregar las siguientes tablas DESPUÉS de `TOKENS_REGISTRO`:

```sql
-- =============================================
-- ANUNCIOS
-- =============================================
CREATE TABLE ANUNCIOS (
    Anuncio_ID INT IDENTITY(1,1) PRIMARY KEY,
    Titulo NVARCHAR(150) NOT NULL,
    Cuerpo NVARCHAR(MAX) NOT NULL,
    Categoria NVARCHAR(50) NOT NULL DEFAULT 'Academico',  -- Academico, Eventos, Comunidad, Deportes, Soporte IT
    Autor_ID INT NOT NULL,  -- FK -> USUARIOS
    Estado NVARCHAR(20) NOT NULL DEFAULT 'Publicado',  -- Publicado, Borrador
    FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FechaModificacion DATETIME2 NULL,
    Activo BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Anuncios_Usuarios FOREIGN KEY (Autor_ID) REFERENCES USUARIOS(Usuario_ID)
);

CREATE TABLE ANUNCIOS_DESTINATARIOS (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Anuncio_ID INT NOT NULL,  -- FK -> ANUNCIOS
    Rol_Destinatario NVARCHAR(30) NOT NULL,  -- Estudiante, Profesor, Administrador, Todos
    Grado_ID INT NULL,  -- FK -> GRADOS (opcional, para filtrar por grado)
    Seccion_ID INT NULL,  -- FK -> SECCIONES (opcional)
    Leido BIT NOT NULL DEFAULT 0,
    FechaLectura DATETIME2 NULL,
    CONSTRAINT FK_AnunciosDest_Anuncios FOREIGN KEY (Anuncio_ID) REFERENCES ANUNCIOS(Anuncio_ID),
    CONSTRAINT FK_AnunciosDest_Grados FOREIGN KEY (Grado_ID) REFERENCES GRADOS(Grado_ID),
    CONSTRAINT FK_AnunciosDest_Secciones FOREIGN KEY (Seccion_ID) REFERENCES SECCIONES(Seccion_ID)
);

-- =============================================
-- TAREAS
-- =============================================
CREATE TABLE TAREAS (
    Tarea_ID INT IDENTITY(1,1) PRIMARY KEY,
    Titulo NVARCHAR(150) NOT NULL,
    Instrucciones NVARCHAR(MAX) NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FechaLimite DATETIME2 NOT NULL,
    Peso DECIMAL(5,2) NOT NULL DEFAULT 1.0,  -- Peso para promedio
    Estado NVARCHAR(20) NOT NULL DEFAULT 'Activa',  -- Activa, Cerrada, Borrador
    Curso_ID INT NOT NULL,  -- FK -> CURSOS
    Grado_ID INT NOT NULL,  -- FK -> GRADOS
    Seccion_ID INT NOT NULL,  -- FK -> SECCIONES
    CreadoPor_ID INT NOT NULL,  -- FK -> USUARIOS (profesor)
    CONSTRAINT FK_Tareas_Cursos FOREIGN KEY (Curso_ID) REFERENCES CURSOS(Curso_ID),
    CONSTRAINT FK_Tareas_Grados FOREIGN KEY (Grado_ID) REFERENCES GRADOS(Grado_ID),
    CONSTRAINT FK_Tareas_Secciones FOREIGN KEY (Seccion_ID) REFERENCES SECCIONES(Seccion_ID),
    CONSTRAINT FK_Tareas_Usuarios FOREIGN KEY (CreadoPor_ID) REFERENCES USUARIOS(Usuario_ID)
);

CREATE TABLE TAREAS_RECURSOS (
    Recurso_ID INT IDENTITY(1,1) PRIMARY KEY,
    Tarea_ID INT NOT NULL,  -- FK -> TAREAS
    Nombre NVARCHAR(200) NOT NULL,
    URL NVARCHAR(500) NOT NULL,
    CONSTRAINT FK_TareasRecursos_Tareas FOREIGN KEY (Tarea_ID) REFERENCES TAREAS(Tarea_ID)
);

CREATE TABLE TAREAS_ENTREGAS (
    Entrega_ID INT IDENTITY(1,1) PRIMARY KEY,
    Tarea_ID INT NOT NULL,  -- FK -> TAREAS
    Estudiante_ID INT NOT NULL,  -- FK -> ESTUDIANTES
    ArchivoURL NVARCHAR(500) NULL,
    Comentario NVARCHAR(MAX) NULL,
    Puntaje DECIMAL(5,2) NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT 'Entregada',  -- Entregada, Calificada, Devuelta
    FechaEntrega DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FechaCalificacion DATETIME2 NULL,
    CalificadoPor_ID INT NULL,  -- FK -> USUARIOS (profesor)
    CONSTRAINT FK_Entregas_Tareas FOREIGN KEY (Tarea_ID) REFERENCES TAREAS(Tarea_ID),
    CONSTRAINT FK_Entregas_Estudiantes FOREIGN KEY (Estudiante_ID) REFERENCES ESTUDIANTES(Estudiante_ID),
    CONSTRAINT FK_Entregas_CalificadoPor FOREIGN KEY (CalificadoPor_ID) REFERENCES USUARIOS(Usuario_ID)
);

-- =============================================
-- EXAMENES
-- =============================================
CREATE TABLE EXAMENES (
    Examen_ID INT IDENTITY(1,1) PRIMARY KEY,
    Titulo NVARCHAR(150) NOT NULL,
    Instrucciones NVARCHAR(MAX) NULL,
    DuracionMinutos INT NOT NULL DEFAULT 60,
    FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FechaInicio DATETIME2 NULL,
    FechaFin DATETIME2 NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT 'Borrador',  -- Borrador, Activo, Finalizado
    PuntajeTotal DECIMAL(5,2) NOT NULL DEFAULT 100,
    Curso_ID INT NOT NULL,  -- FK -> CURSOS
    Grado_ID INT NOT NULL,  -- FK -> GRADOS
    Seccion_ID INT NOT NULL,  -- FK -> SECCIONES
    CreadoPor_ID INT NOT NULL,  -- FK -> USUARIOS (profesor)
    CONSTRAINT FK_Examenes_Cursos FOREIGN KEY (Curso_ID) REFERENCES CURSOS(Curso_ID),
    CONSTRAINT FK_Examenes_Grados FOREIGN KEY (Grado_ID) REFERENCES GRADOS(Grado_ID),
    CONSTRAINT FK_Examenes_Secciones FOREIGN KEY (Seccion_ID) REFERENCES SECCIONES(Seccion_ID),
    CONSTRAINT FK_Examenes_Usuarios FOREIGN KEY (CreadoPor_ID) REFERENCES USUARIOS(Usuario_ID)
);

CREATE TABLE EXAMEN_PREGUNTAS (
    Pregunta_ID INT IDENTITY(1,1) PRIMARY KEY,
    Examen_ID INT NOT NULL,  -- FK -> EXAMENES
    Tipo NVARCHAR(20) NOT NULL,  -- Opcion, Desarrollo, Archivo
    Texto NVARCHAR(MAX) NOT NULL,
    Puntos DECIMAL(5,2) NOT NULL DEFAULT 10,
    Orden INT NOT NULL DEFAULT 1,
    Opciones JSON NULL,  -- JSON array para preguntas de opción múltiple
    RespuestaCorrecta NVARCHAR(500) NULL,  -- Para opción múltiple: índice correcto
    CONSTRAINT FK_Preguntas_Examenes FOREIGN KEY (Examen_ID) REFERENCES EXAMENES(Examen_ID)
);

CREATE TABLE EXAMEN_INTENTOS (
    Intento_ID INT IDENTITY(1,1) PRIMARY KEY,
    Examen_ID INT NOT NULL,  -- FK -> EXAMENES
    Estudiante_ID INT NOT NULL,  -- FK -> ESTUDIANTES
    FechaInicio DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    FechaFin DATETIME2 NULL,
    PuntajeObtenido DECIMAL(5,2) NULL,
    Aprobado BIT NULL,
    Respuestas JSON NULL,  -- JSON con las respuestas del estudiante
    CONSTRAINT FK_Intentos_Examenes FOREIGN KEY (Examen_ID) REFERENCES EXAMENES(Examen_ID),
    CONSTRAINT FK_Intentos_Estudiantes FOREIGN KEY (Estudiante_ID) REFERENCES ESTUDIANTES(Estudiante_ID)
);

-- =============================================
-- NOTAS (resumen por curso/bloque)
-- =============================================
CREATE TABLE NOTAS (
    Nota_ID INT IDENTITY(1,1) PRIMARY KEY,
    Estudiante_ID INT NOT NULL,  -- FK -> ESTUDIANTES
    Curso_ID INT NOT NULL,  -- FK -> CURSOS
    Bloque INT NOT NULL,  -- 1 = Primer Bloque, 2 = Segundo Bloque
    Tarea1 DECIMAL(5,2) NULL,
    Examen1 DECIMAL(5,2) NULL,
    Tarea2 DECIMAL(5,2) NULL,
    Proyecto DECIMAL(5,2) NULL,
    Participacion DECIMAL(5,2) NULL,
    Promedio DECIMAL(5,2) NULL,
    Estado NVARCHAR(20) NULL,  -- Aprobado, Reprobado
    FechaModificacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Notas_Estudiantes FOREIGN KEY (Estudiante_ID) REFERENCES ESTUDIANTES(Estudiante_ID),
    CONSTRAINT FK_Notas_Cursos FOREIGN KEY (Curso_ID) REFERENCES CURSOS(Curso_ID),
    CONSTRAINT UQ_Notas_Estudiante_Curso_Bloque UNIQUE (Estudiante_ID, Curso_ID, Bloque)
);

-- =============================================
-- MATERIALES
-- =============================================
CREATE TABLE MATERIALES (
    Material_ID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(200) NOT NULL,
    URL NVARCHAR(500) NOT NULL,
    Carpeta NVARCHAR(100) NOT NULL DEFAULT 'General',  -- Unidad 1, Unidad 2, Examenes, General
    Curso_ID INT NOT NULL,  -- FK -> CURSOS
    SubidoPor_ID INT NOT NULL,  -- FK -> USUARIOS
    FechaSubida DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Materiales_Cursos FOREIGN KEY (Curso_ID) REFERENCES CURSOS(Curso_ID),
    CONSTRAINT FK_Materiales_Usuarios FOREIGN KEY (SubidoPor_ID) REFERENCES USUARIOS(Usuario_ID)
);

-- =============================================
-- MANTENIMIENTO
-- =============================================
CREATE TABLE MANTENIMIENTO (
    Mantenimiento_ID INT IDENTITY(1,1) PRIMARY KEY,
    Tipo NVARCHAR(50) NOT NULL,  -- Mantenimiento, Actualizacion, Respaldo, Revision
    Descripcion NVARCHAR(500) NOT NULL,
    Fecha DATE NOT NULL,
    HoraInicio TIME NOT NULL,
    HoraFin TIME NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT 'Programado',  -- Programado, En Proceso, Completado, Cancelado
    CreadoPor_ID INT NOT NULL,  -- FK -> USUARIOS
    FechaCreacion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Mantenimiento_Usuarios FOREIGN KEY (CreadoPor_ID) REFERENCES USUARIOS(Usuario_ID)
);
```

### 1.2 SPs para módulos existentes (corregir)

**Corregir `SP_ObtenerResumenProfesor`** — devolver datos reales en vez de zeros:

```sql
ALTER PROCEDURE SP_ObtenerResumenProfesor
    @Usuario_ID INT
AS
BEGIN
    SELECT
        (SELECT COUNT(*) FROM TAREAS t
         INNER JOIN PROFESORES_CURSOS pc ON t.Curso_ID = pc.Curso_ID
         INNER JOIN PROFESORES p ON pc.Profesor_ID = p.Profesor_ID
         WHERE p.Usuario_ID = @Usuario_ID AND t.Estado = 'Activa') AS TareasPorCalificar,
        (SELECT COUNT(*) FROM EXAMENES e
         INNER JOIN PROFESORES_CURSOS pc ON e.Curso_ID = pc.Curso_ID
         INNER JOIN PROFESORES p ON pc.Profesor_ID = p.Profesor_ID
         WHERE p.Usuario_ID = @Usuario_ID AND e.Estado = 'Activo') AS ExamenesActivos,
        (SELECT COUNT(DISTINCT te.Estudiante_ID)
         FROM TAREAS_ENTREGAS te
         INNER JOIN TAREAS t ON te.Tarea_ID = t.Tarea_ID
         INNER JOIN PROFESORES_CURSOS pc ON t.Curso_ID = pc.Curso_ID
         INNER JOIN PROFESORES p ON pc.Profesor_ID = p.Profesor_ID
         WHERE p.Usuario_ID = @Usuario_ID) AS TotalEstudiantes;
END;
```

**Corregir `SP_ObtenerResumenEstudiante`** — devolver datos reales:

```sql
ALTER PROCEDURE SP_ObtenerResumenEstudiante
    @Usuario_ID INT
AS
BEGIN
    DECLARE @EstudianteID INT;
    SELECT @EstudianteID = Estudiante_ID FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    SELECT
        (SELECT COUNT(*) FROM TAREAS t
         INNER JOIN ESTUDIANTES e ON t.Grado_ID = e.Grado_ID AND t.Seccion_ID = e.Seccion_ID
         WHERE e.Estudiante_ID = @EstudianteID AND t.Estado = 'Activa'
         AND NOT EXISTS (SELECT 1 FROM TAREAS_ENTREGAS te WHERE te.Tarea_ID = t.Tarea_ID AND te.Estudiante_ID = @EstudianteID)
        ) AS TareasPendientes,
        (SELECT COUNT(*) FROM EXAMENES ex
         INNER JOIN ESTUDIANTES e ON ex.Grado_ID = e.Grado_ID AND ex.Seccion_ID = e.Seccion_ID
         WHERE e.Estudiante_ID = @EstudianteID AND ex.Estado = 'Activo'
         AND NOT EXISTS (SELECT 1 FROM EXAMEN_INTENTOS ei WHERE ei.Examen_ID = ex.Examen_ID AND ei.Estudiante_ID = @EstudianteID)
        ) AS ExamenesPendientes,
        (SELECT ISNULL(AVG(Promedio), 0) FROM NOTAS WHERE Estudiante_ID = @EstudianteID) AS PromedioGeneral;
END;
```

---

## 2. Endpoints (.NET)

En esta fase NO se crean endpoints nuevos. Solo se corrigen los SPs existentes.

### 2.1 Verificar que `DashboardEndpoints.cs` funcione correctamente

El endpoint `GET /api/dashboard` ya está implementado y usa los SPs corregidos. Solo necesita que los SPs devuelvan datos reales (paso 1.2).

### 2.2 Actualizar `DbService.cs`

No se necesitan cambios en DbService para esta fase.

---

## 3. Tests PowerShell

### 3.1 Test de dashboard por rol

Crear archivo `tests/phase0/test-dashboard.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

# --- Login como admin ---
$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$adminToken = $loginResp.token
Write-Host "Admin login: OK - Token obtained"

# --- Login como profesor ---
$loginBody = @{ username = "profesor"; password = "profesor123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$profesorToken = $loginResp.token
Write-Host "Profesor login: OK"

# --- Login como estudiante ---
$loginBody = @{ username = "estudiante"; password = "estudiante123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$estudianteToken = $loginResp.token
Write-Host "Estudiante login: OK"

# --- Test dashboard admin ---
$headers = @{ Authorization = "Bearer $adminToken" }
$dashboard = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard" -Method GET -Headers $headers
Write-Host "Admin Dashboard: $($dashboard | ConvertTo-Json -Compress)"

# --- Test dashboard profesor ---
$headers = @{ Authorization = "Bearer $profesorToken" }
$dashboard = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard" -Method GET -Headers $headers
Write-Host "Profesor Dashboard: $($dashboard | ConvertTo-Json -Compress)"

# --- Test dashboard estudiante ---
$headers = @{ Authorization = "Bearer $estudianteToken" }
$dashboard = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard" -Method GET -Headers $headers
Write-Host "Estudiante Dashboard: $($dashboard | ConvertTo-Json -Compress)"

# --- Test sin token (debe fallar) ---
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/dashboard" -Method GET
    Write-Host "FAIL: Should have thrown 401"
} catch {
    Write-Host "Sin token: 401 OK ($($_.Exception.Response.StatusCode))"
}

Write-Host "`n=== Fase 0: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Crear componentes placeholder

Crear un componente vacío para cada ruta del sidebar. Cada componente solo mostrará el nombre del módulo.

**Archivos a crear** (cada uno con .ts, .html, .css):

```
front-end/src/app/pages/
├── admin/
│   ├── cursos/          → AdminCursosComponent (placeholder)
│   ├── estudiantes/     → AdminEstudiantesComponent (placeholder)
│   ├── profesores/      → AdminProfesoresComponent (placeholder)
│   ├── anuncios/        → AdminAnunciosComponent (placeholder)
│   ├── tokens/          → AdminTokensComponent (placeholder)
│   └── notas/           → AdminNotasComponent (placeholder)
├── estudiante/
│   ├── cursos/          → EstudianteCursosComponent (placeholder)
│   ├── tareas/          → EstudianteTareasComponent (placeholder)
│   ├── examenes/        → EstudianteExamenesComponent (placeholder)
│   ├── notas/           → EstudianteNotasComponent (placeholder)
│   └── anuncios/        → EstudianteAnunciosComponent (placeholder)
├── profesor/
│   ├── clases/          → ProfesorClasesComponent (placeholder)
│   ├── tareas/          → ProfesorTareasComponent (placeholder)
│   ├── notas/           → ProfesorNotasComponent (placeholder)
│   ├── examenes/        → ProfesorExamenesComponent (placeholder)
│   ├── materiales/      → ProfesorMaterialesComponent (placeholder)
│   └── anuncios/        → ProfesorAnunciosComponent (placeholder)
└── shared/
    └── mantenimiento/   → MantenimientoComponent (placeholder)
```

**Patrón de cada placeholder** (ejemplo `admin/cursos/admin-cursos.component.ts`):

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-cursos',
  standalone: true,
  template: `
    <div class="page-head">
      <div class="crumb">Administrador / Cursos</div>
      <h2>Gestión de Cursos</h2>
      <div class="page-sub">Módulo en construcción</div>
    </div>
    <div class="card">
      <p>Este módulo será implementado en la Fase 1.</p>
    </div>
  `,
  styles: [`
    .page-head { margin-bottom: 24px; }
    .page-head .crumb { font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .page-head h2 { font-size: 24px; font-weight: 700; color: var(--ink); margin: 0 0 4px 0; }
    .page-head .page-sub { font-size: 14px; color: var(--muted); }
    .card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius); padding: 24px; }
  `]
})
export class AdminCursosComponent {}
```

### 4.2 Configurar rutas en `app.routes.ts`

Agregar todas las rutas hijas bajo `/sistema`:

```typescript
{
  path: 'sistema',
  loadComponent: () => import('./pages/shell/shell.component').then(m => m.ShellComponent),
  canActivate: [authGuard],
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'ajustes', loadComponent: () => import('./pages/ajustes/ajustes.component').then(m => m.AjustesComponent) },
    // --- Admin ---
    { path: 'admin/cursos', loadComponent: () => import('./pages/admin/cursos/admin-cursos.component').then(m => m.AdminCursosComponent) },
    { path: 'admin/estudiantes', loadComponent: () => import('./pages/admin/estudiantes/admin-estudiantes.component').then(m => m.AdminEstudiantesComponent) },
    { path: 'admin/profesores', loadComponent: () => import('./pages/admin/profesores/admin-profesores.component').then(m => m.AdminProfesoresComponent) },
    { path: 'admin/anuncios', loadComponent: () => import('./pages/admin/anuncios/admin-anuncios.component').then(m => m.AdminAnunciosComponent) },
    { path: 'admin/tokens', loadComponent: () => import('./pages/admin/tokens/admin-tokens.component').then(m => m.AdminTokensComponent) },
    { path: 'admin/notas', loadComponent: () => import('./pages/admin/notas/admin-notas.component').then(m => m.AdminNotasComponent) },
    { path: 'admin/mantenimiento', loadComponent: () => import('./pages/shared/mantenimiento/mantenimiento.component').then(m => m.MantenimientoComponent) },
    // --- Estudiante ---
    { path: 'cursos', loadComponent: () => import('./pages/estudiante/cursos/estudiante-cursos.component').then(m => m.EstudianteCursosComponent) },
    { path: 'tareas', loadComponent: () => import('./pages/estudiante/tareas/estudiante-tareas.component').then(m => m.EstudianteTareasComponent) },
    { path: 'examenes', loadComponent: () => import('./pages/estudiante/examenes/estudiante-examenes.component').then(m => m.EstudianteExamenesComponent) },
    { path: 'notas', loadComponent: () => import('./pages/estudiante/notas/estudiante-notas.component').then(m => m.EstudianteNotasComponent) },
    { path: 'anuncios', loadComponent: () => import('./pages/estudiante/anuncios/estudiante-anuncios.component').then(m => m.EstudianteAnunciosComponent) },
    // --- Profesor ---
    { path: 'clases', loadComponent: () => import('./pages/profesor/clases/profesor-clases.component').then(m => m.ProfesorClasesComponent) },
    { path: 'profesor/tareas', loadComponent: () => import('./pages/profesor/tareas/profesor-tareas.component').then(m => m.ProfesorTareasComponent) },
    { path: 'profesor/notas', loadComponent: () => import('./pages/profesor/notas/profesor-notas.component').then(m => m.ProfesorNotasComponent) },
    { path: 'profesor/examenes', loadComponent: () => import('./pages/profesor/examenes/profesor-examenes.component').then(m => m.ProfesorExamenesComponent) },
    { path: 'profesor/materiales', loadComponent: () => import('./pages/profesor/materiales/profesor-materiales.component').then(m => m.ProfesorMaterialesComponent) },
    { path: 'profesor/anuncios', loadComponent: () => import('./pages/profesor/anuncios/profesor-anuncios.component').then(m => m.ProfesorAnunciosComponent) },
  ]
},
```

### 4.3 Actualizar rutas en `ShellComponent`

Cambiar las rutas en `getNavItems()` para que apunten a las rutas reales:

```typescript
if (rol === 'administrador') {
  items.push(
    { label: 'Cursos', icon: 'cursos', route: '/sistema/admin/cursos' },
    { label: 'Estudiantes', icon: 'estudiantes', route: '/sistema/admin/estudiantes' },
    { label: 'Profesores', icon: 'profesores', route: '/sistema/admin/profesores' },
    { label: 'Notas', icon: 'notas', route: '/sistema/admin/notas' },
    { label: 'Anuncios', icon: 'anuncios', route: '/sistema/admin/anuncios' },
    { label: 'Tokens', icon: 'tokens', route: '/sistema/admin/tokens' },
    { label: 'Mantenimiento', icon: 'ajustes', route: '/sistema/admin/mantenimiento' },
  );
}
if (rol === 'estudiante') {
  items.push(
    { label: 'Anuncios', icon: 'anuncios', route: '/sistema/anuncios' },
    { label: 'Cursos', icon: 'cursos', route: '/sistema/cursos' },
    { label: 'Tareas', icon: 'tareas', route: '/sistema/tareas' },
    { label: 'Exámenes', icon: 'examenes', route: '/sistema/examenes' },
    { label: 'Notas', icon: 'notas', route: '/sistema/notas' },
  );
}
if (rol === 'profesor') {
  items.push(
    { label: 'Mis Clases', icon: 'clases', route: '/sistema/clases' },
    { label: 'Tareas', icon: 'tareas', route: '/sistema/profesor/tareas' },
    { label: 'Notas', icon: 'notas', route: '/sistema/profesor/notas' },
    { label: 'Exámenes', icon: 'examenes', route: '/sistema/profesor/examenes' },
    { label: 'Materiales', icon: 'materiales', route: '/sistema/profesor/materiales' },
    { label: 'Anuncios', icon: 'anuncios', route: '/sistema/profesor/anuncios' },
  );
}
```

### 4.4 Verificar compilación

```bash
cd front-end
pnpm build
```

---

## 5. Tests Playwright

### 5.1 Test de navegación por rol

Crear archivo `tests-e2e/tests/phase0-navigation.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 0 - Navegación por rol', () => {

  test('admin ve menú de administrador', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Administrador').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.admin.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.admin.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await expect(page).toHaveURL(/\/sistema\/dashboard/);

    // Verificar que el sidebar tiene los items de admin
    await expect(page.getByRole('link', { name: 'Cursos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Estudiantes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profesores' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tokens' })).toBeVisible();
  });

  test('estudiante ve menú de estudiante', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Estudiante').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.student.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.student.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await expect(page).toHaveURL(/\/sistema\/dashboard/);

    await expect(page.getByRole('link', { name: 'Cursos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tareas' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Exámenes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Notas' })).toBeVisible();
  });

  test('profesor ve menú de profesor', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Profesor').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.teacher.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.teacher.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await expect(page).toHaveURL(/\/sistema\/dashboard/);

    await expect(page.getByRole('link', { name: 'Mis Clases' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tareas' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Materiales' })).toBeVisible();
  });

  test('navegación a módulo placeholder funciona', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Administrador').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.admin.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.admin.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await expect(page).toHaveURL(/\/sistema\/dashboard/);

    // Navegar a Cursos (placeholder)
    await page.getByRole('link', { name: 'Cursos' }).click();
    await expect(page).toHaveURL(/\/sistema\/admin\/cursos/);
    await expect(page.getByText('Gestión de Cursos')).toBeVisible();
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Todas las tablas nuevas existen en la BD | `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES` devuelve las 8 tablas nuevas |
| 2 | SPs corregidos devuelven datos reales | Test PowerShell muestra métricas > 0 |
| 3 | Componentes placeholder crean sin error | `pnpm build` compila sin errores |
| 4 | Cada ruta del sidebar lleva a su componente | Navegación funciona en el browser |
| 5 | Tests Playwright pasan | `pnpm test:e2e -- --grep "Fase 0"` |
