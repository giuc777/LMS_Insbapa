# Fase 9: Profesor — Dashboard, Clases, Anuncios y Materiales

**Objetivo:** Portal del profesor con dashboard, gestión de clases, anuncios por clase y materiales.

---

## 1. Stored Procedures

### 1.1 SP_ProfesorClases

```sql
CREATE PROCEDURE SP_ProfesorClases
    @Usuario_ID INT
AS
BEGIN
    SELECT
        pc.Asignacion_ID,
        c.Curso_ID, c.Codigo, c.Nombre AS Materia,
        g.Grado_ID, g.Nombre AS Grado,
        s.Seccion_ID, s.Nombre AS Seccion,
        (SELECT COUNT(*) FROM ESTUDIANTES e WHERE e.Grado_ID = pc.Grado_ID AND e.Seccion_ID = pc.Seccion_ID) AS Estudiantes,
        (SELECT COUNT(*) FROM TAREAS t WHERE t.Curso_ID = pc.Curso_ID AND t.Grado_ID = pc.Grado_ID AND t.Seccion_ID = pc.Seccion_ID AND t.Estado = 'Activa') AS TareasActivas,
        (SELECT COUNT(*) FROM TAREAS_ENTREGAS te
         INNER JOIN TAREAS t ON te.Tarea_ID = t.Tarea_ID
         WHERE t.Curso_ID = pc.Curso_ID AND t.Grado_ID = pc.Grado_ID AND t.Seccion_ID = pc.Seccion_ID
         AND te.Estado = 'Entregada') AS PorCalificar
    FROM PROFESORES_CURSOS pc
    INNER JOIN CURSOS c ON pc.Curso_ID = c.Curso_ID
    INNER JOIN GRADOS g ON pc.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON pc.Seccion_ID = s.Seccion_ID
    INNER JOIN PROFESORES pr ON pc.Profesor_ID = pr.Profesor_ID
    WHERE pr.Usuario_ID = @Usuario_ID
    ORDER BY g.Orden, s.Nombre, c.Nombre;
END;
```

### 1.2 SP_ProfesorAnuncios

```sql
CREATE PROCEDURE SP_ProfesorAnuncios
    @Usuario_ID INT
AS
BEGIN
    SELECT
        a.Anuncio_ID, a.Titulo, LEFT(a.Cuerpo, 200) AS Resumen,
        a.Categoria, a.Estado, a.FechaCreacion,
        (SELECT STRING_AGG(ad.Rol_Destinatario, ', ') FROM ANUNCIOS_DESTINATARIOS ad WHERE ad.Anuncio_ID = a.Anuncio_ID) AS Destinatarios
    FROM ANUNCIOS a
    WHERE a.Autor_ID = @Usuario_ID AND a.Activo = 1
    ORDER BY a.FechaCreacion DESC;
END;
```

### 1.3 SP_ProfesorCrearAnuncio

```sql
CREATE PROCEDURE SP_ProfesorCrearAnuncio
    @Titulo NVARCHAR(150),
    @Cuerpo NVARCHAR(MAX),
    @Categoria NVARCHAR(50),
    @Autor_ID INT,
    @Estado NVARCHAR(20),
    @Destinatarios NVARCHAR(MAX)  -- JSON
AS
BEGIN
    DECLARE @Anuncio_ID INT;
    INSERT INTO ANUNCIOS (Titulo, Cuerpo, Categoria, Autor_ID, Estado)
    VALUES (@Titulo, @Cuerpo, @Categoria, @Autor_ID, @Estado);
    SET @Anuncio_ID = SCOPE_IDENTITY();
    INSERT INTO ANUNCIOS_DESTINATARIOS (Anuncio_ID, Rol_Destinatario)
    SELECT @Anuncio_ID, value FROM OPENJSON(@Destinatarios);
    SELECT @Anuncio_ID AS Anuncio_ID, 'Anuncio creado' AS Mensaje;
END;
```

### 1.4 SP_ProfesorMateriales

```sql
CREATE PROCEDURE SP_ProfesorMateriales
    @Usuario_ID INT,
    @Curso_ID INT = NULL
AS
BEGIN
    SELECT
        m.Material_ID, m.Nombre, m.URL, m.Carpeta, m.FechaSubida,
        c.Nombre AS Materia
    FROM MATERIALES m
    INNER JOIN CURSOS c ON m.Curso_ID = c.Curso_ID
    INNER JOIN PROFESORES pr ON m.SubidoPor_ID = pr.Usuario_ID
    WHERE pr.Usuario_ID = @Usuario_ID
        AND (@Curso_ID IS NULL OR m.Curso_ID = @Curso_ID)
    ORDER BY m.Carpeta, m.Nombre;
END;
```

### 1.5 SP_ProfesorSubirMaterial

```sql
CREATE PROCEDURE SP_ProfesorSubirMaterial
    @Nombre NVARCHAR(200),
    @URL NVARCHAR(500),
    @Carpeta NVARCHAR(100),
    @Curso_ID INT,
    @SubidoPor_ID INT
AS
BEGIN
    INSERT INTO MATERIALES (Nombre, URL, Carpeta, Curso_ID, SubidoPor_ID)
    VALUES (@Nombre, @URL, @Carpeta, @Curso_ID, @SubidoPor_ID);
    SELECT SCOPE_IDENTITY() AS Material_ID, 'Material subido' AS Mensaje;
END;
```

---

## 2. Endpoints (.NET)

Crear `Endpoints/ProfesorEndpoints.cs`:

```csharp
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace API_LMS.Endpoints;

public static class ProfesorEndpoints
{
    public static void MapProfesorEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/profesor")
            .RequireAuthorization()
            .WithTags("Profesor");

        // --- Clases ---
        group.MapGet("/clases", [Authorize(Roles = "Profesor")] async (
            ClaimsPrincipal user, DbService db) =>
        {
            var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?> { ["@Usuario_ID"] = usuarioId };
            var result = await db.EjecutarSpAsync("SP_ProfesorClases", param);
            return Results.Ok(result);
        })
        .WithName("ProfesorClases")
        .Produces(200);

        // --- Anuncios ---
        group.MapGet("/anuncios", [Authorize(Roles = "Profesor")] async (
            ClaimsPrincipal user, DbService db) =>
        {
            var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?> { ["@Usuario_ID"] = usuarioId };
            var result = await db.EjecutarSpAsync("SP_ProfesorAnuncios", param);
            return Results.Ok(result);
        })
        .WithName("ProfesorAnuncios")
        .Produces(200);

        group.MapPost("/anuncios", [Authorize(Roles = "Profesor")] async (
            CrearAnuncioRequest request, ClaimsPrincipal user, DbService db) =>
        {
            var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?>
            {
                ["@Titulo"] = request.Titulo,
                ["@Cuerpo"] = request.Cuerpo,
                ["@Categoria"] = request.Categoria,
                ["@Autor_ID"] = usuarioId,
                ["@Estado"] = request.Estado,
                ["@Destinatarios"] = request.Destinatarios
            };
            var result = await db.EjecutarSpAsync("SP_ProfesorCrearAnuncio", param);
            return Results.Ok(new { anuncioId = result[0]["Anuncio_ID"], message = result[0]["Mensaje"]?.ToString() });
        })
        .WithName("ProfesorCrearAnuncio")
        .Produces(200);

        // --- Materiales ---
        group.MapGet("/materiales", [Authorize(Roles = "Profesor")] async (
            int? cursoId, ClaimsPrincipal user, DbService db) =>
        {
            var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?> { ["@Usuario_ID"] = usuarioId };
            if (cursoId.HasValue) param["@Curso_ID"] = cursoId;
            var result = await db.EjecutarSpAsync("SP_ProfesorMateriales", param);
            return Results.Ok(result);
        })
        .WithName("ProfesorMateriales")
        .Produces(200);

        group.MapPost("/materiales", [Authorize(Roles = "Profesor")] async (
            SubirMaterialRequest request, ClaimsPrincipal user, DbService db) =>
        {
            var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?>
            {
                ["@Nombre"] = request.Nombre,
                ["@URL"] = request.URL,
                ["@Carpeta"] = request.Carpeta,
                ["@Curso_ID"] = request.CursoId,
                ["@SubidoPor_ID"] = usuarioId
            };
            var result = await db.EjecutarSpAsync("SP_ProfesorSubirMaterial", param);
            return Results.Ok(new { materialId = result[0]["Material_ID"], message = result[0]["Mensaje"]?.ToString() });
        })
        .WithName("ProfesorSubirMaterial")
        .Produces(200);
    }
}

public record SubirMaterialRequest(
    string Nombre, string URL, string Carpeta, int CursoId
);
```

Registrar en `Program.cs`:

```csharp
app.MapProfesorEndpoints();
```

---

## 3. Tests PowerShell

Crear `tests/phase9/test-profesor-modulos.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

$loginBody = @{ username = "profesor"; password = "profesor123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 9: Tests Profesor ==="

# 1. Dashboard
Write-Host "`n--- Dashboard Profesor ---"
$dashboard = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard" -Method GET -Headers $headers
Write-Host "Tareas por calificar: $($dashboard.TareasPorCalificar)"
Write-Host "Exámenes activos: $($dashboard.ExamenesActivos)"
Write-Host "Total estudiantes: $($dashboard.TotalEstudiantes)"

# 2. Clases
Write-Host "`n--- Mis Clases ---"
$clases = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/clases" -Method GET -Headers $headers
Write-Host "Clases: $($clases.Count)"
$clases | ForEach-Object { Write-Host "  $($_.Materia) - $($_.Grado) $($_.Seccion) ($($_.Estudiantes) estudiantes, $($_.PorCalificar) por calificar)" }

# 3. Anuncios
Write-Host "`n--- Mis Anuncios ---"
$anuncios = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/anuncios" -Method GET -Headers $headers
Write-Host "Anuncios: $($anuncios.Count)"

# 4. Crear anuncio
Write-Host "`n--- Crear Anuncio ---"
$nuevoAnuncio = @{
    titulo = "Aviso de Prueba Profesor"
    cuerpo = "Este es un anuncio del profesor."
    categoria = "Academico"
    estado = "Publicado"
    destinatarios = '["Estudiante"]'
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/anuncios" -Method POST -ContentType "application/json" -Headers $headers -Body $nuevoAnuncio
Write-Host "Anuncio creado: $($result | ConvertTo-Json -Compress)"

# 5. Materiales
Write-Host "`n--- Mis Materiales ---"
$materiales = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/materiales" -Method GET -Headers $headers
Write-Host "Materiales: $($materiales.Count)"

# 6. Subir material
Write-Host "`n--- Subir Material ---"
$nuevoMaterial = @{
    nombre = "Guia de Prueba.pdf"
    url = "https://ejemplo.com/guia.pdf"
    carpeta = "Unidad 1"
    cursoId = $clases[0].Curso_ID
} | ConvertTo-Json
$matResult = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/materiales" -Method POST -ContentType "application/json" -Headers $headers -Body $nuevoMaterial
Write-Host "Material: $($matResult | ConvertTo-Json -Compress)"

Write-Host "`n=== Fase 9: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Servicio — `profesor.service.ts` (nuevo)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfesorService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerClases() {
    return this.http.get<any[]>(`${this.apiUrl}/api/profesor/clases`);
  }

  obtenerAnuncios() {
    return this.http.get<any[]>(`${this.apiUrl}/api/profesor/anuncios`);
  }

  crearAnuncio(data: any) {
    return this.http.post<any>(`${this.apiUrl}/api/profesor/anuncios`, data);
  }

  obtenerMateriales(cursoId?: number) {
    let params: any = {};
    if (cursoId) params.cursoId = cursoId;
    return this.http.get<any[]>(`${this.apiUrl}/api/profesor/materiales`, { params });
  }

  subirMaterial(data: any) {
    return this.http.post<any>(`${this.apiUrl}/api/profesor/materiales`, data);
  }
}
```

### 4.2 ProfesorClasesComponent

- Grid de cards de clases con materia, grado, sección, estudiantes, tareas activas, por calificar
- Tabs por grado (Todas, Primero, Segundo, Tercero)
- Click en clase → vista detalle con estadísticas y tabla de tareas con botón "Calificar"

### 4.3 ProfesorAnunciosComponent

- Tabs: Mis Anuncios, Anuncios Institucionales
- Lista de anuncios con estado (Publicado/Borrador)
- Modal crear: Título, Cuerpo, Categoría, Destinatarios (checkboxes por clase)

### 4.4 ProfesorMaterialesComponent

- Vista por carpetas (Unidad 1, Unidad 2, Examenes)
- Cada archivo con nombre y botón descargar
- Botón "Subir Material" con modal

### 4.5 Rutas

Ya configuradas en Fase 0:
- `/sistema/clases`
- `/sistema/profesor/anuncios`
- `/sistema/profesor/materiales`

---

## 5. Tests Playwright

Crear `tests-e2e/tests/phase9-profesor.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 9 - Portal Profesor', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Profesor').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.teacher.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.teacher.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
  });

  test('ver mis clases', async ({ page }) => {
    await page.getByRole('link', { name: 'Mis Clases' }).click();
    await expect(page).toHaveURL(/\/sistema\/clases/);
    await expect(page.getByText('Mis Clases')).toBeVisible();
    // Verificar que hay cards de clases
    const cards = page.locator('.clase-card, .card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('ver detalle de clase', async ({ page }) => {
    await page.getByRole('link', { name: 'Mis Clases' }).click();
    await page.waitForSelector('.clase-card, .card');
    await page.locator('.clase-card, .card').first().click();
    await expect(page.getByText('Detalle de Clase')).toBeVisible();
  });

  test('crear anuncio', async ({ page }) => {
    await page.getByRole('link', { name: 'Anuncios' }).click();
    await page.getByRole('button', { name: /nuevo/i }).click();
    await expect(page.locator('.modal')).toBeVisible();

    await page.locator('.modal input').first().fill('Anuncio Profesor');
    await page.locator('.modal textarea').fill('Contenido del anuncio');
    await page.locator('.modal select').selectOption('Academico');

    await page.getByRole('button', { name: /publicar/i }).last().click();
    await expect(page.locator('.alert-success')).toBeVisible({ timeout: 5000 });
  });

  test('ver materiales', async ({ page }) => {
    await page.getByRole('link', { name: 'Materiales' }).click();
    await expect(page).toHaveURL(/\/sistema\/profesor\/materiales/);
    await expect(page.getByText('Mis Materiales')).toBeVisible();
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Clases se listan con estadísticas | PowerShell muestra estudiantes, por calificar |
| 2 | Anuncios del profesor se crean | PowerShell crea anuncio |
| 3 | Materiales se listan por carpeta | PowerShell muestra materiales |
| 4 | Subir material funciona | PowerShell sube material |
| 5 | UI muestra clases en grid | Playwright verifica cards |
| 6 | Crear anuncio funciona en UI | Playwright crea anuncio |
| 7 | Materiales se muestran | Playwright verifica vista de materiales |
