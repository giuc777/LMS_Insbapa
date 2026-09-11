# Fase 7: Estudiante — Dashboard, Cursos y Anuncios

**Objetivo:** Portal del estudiante con dashboard personalizado, vista de cursos inscritos y anuncios.

---

## 1. Stored Procedures

### 1.1 SP_EstudianteCursosDetallado

```sql
CREATE PROCEDURE SP_EstudianteCursosDetallado
    @Usuario_ID INT
AS
BEGIN
    DECLARE @EstudianteID INT;
    SELECT @EstudianteID = Estudiante_ID FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    SELECT
        c.Curso_ID, c.Codigo, c.Nombre AS Materia, c.Area,
        g.Nombre AS Grado, s.Nombre AS Seccion,
        p.PrimerNombre + ' ' + p.PrimerApellido AS Profesor,
        ISNULL(n.Promedio, 0) AS Progreso,
        (SELECT COUNT(*) FROM TAREAS t WHERE t.Curso_ID = c.Curso_ID AND t.Grado_ID = e.Grado_ID AND t.Seccion_ID = e.Seccion_ID) AS TotalTareas,
        (SELECT COUNT(*) FROM EXAMENES ex WHERE ex.Curso_ID = c.Curso_ID AND ex.Grado_ID = e.Grado_ID AND ex.Seccion_ID = e.Seccion_ID) AS TotalExamenes
    FROM PROFESORES_CURSOS pc
    INNER JOIN CURSOS c ON pc.Curso_ID = c.Curso_ID
    INNER JOIN GRADOS g ON pc.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON pc.Seccion_ID = s.Seccion_ID
    INNER JOIN PROFESORES pr ON pc.Profesor_ID = pr.Profesor_ID
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    INNER JOIN ESTUDIANTES e ON e.Grado_ID = g.Grado_ID AND e.Seccion_ID = s.Seccion_ID
    LEFT JOIN NOTAS n ON n.Estudiante_ID = e.Estudiante_ID AND n.Curso_ID = c.Curso_ID AND n.Bloque = 1
    WHERE e.Estudiante_ID = @EstudianteID
    ORDER BY c.Nombre;
END;
```

### 1.2 SP_EstudianteAnuncios

```sql
CREATE PROCEDURE SP_EstudianteAnuncios
    @Usuario_ID INT
AS
BEGIN
    DECLARE @EstudianteID INT;
    DECLARE @GradoID INT, @SeccionID INT;
    SELECT @EstudianteID = Estudiante_ID, @GradoID = Grado_ID, @SeccionID = Seccion_ID FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    SELECT
        a.Anuncio_ID, a.Titulo,
        LEFT(a.Cuerpo, 200) AS Resumen,
        a.Categoria, a.FechaCreacion AS Fecha,
        CASE WHEN ad.Leido = 0 THEN 1 ELSE 0 END AS NoLeido
    FROM ANUNCIOS a
    INNER JOIN ANUNCIOS_DESTINATARIOS ad ON a.Anuncio_ID = ad.Anuncio_ID
    WHERE a.Estado = 'Publicado' AND a.Activo = 1
        AND (ad.Rol_Destinatario = 'Todos' OR ad.Rol_Destinatario = 'Estudiante')
        AND (ad.Grado_ID IS NULL OR ad.Grado_ID = @GradoID)
        AND (ad.Seccion_ID IS NULL OR ad.Seccion_ID = @SeccionID)
    ORDER BY a.FechaCreacion DESC;
END;
```

### 1.3 SP_EstudianteMarcarAnuncioLeido

```sql
CREATE PROCEDURE SP_EstudianteMarcarAnuncioLeido
    @Anuncio_ID INT,
    @Usuario_ID INT
AS
BEGIN
    DECLARE @EstudianteID INT;
    SELECT @EstudianteID = Estudiante_ID FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    UPDATE ANUNCIOS_DESTINATARIOS
    SET Leido = 1, FechaLectura = SYSUTCDATETIME()
    WHERE Anuncio_ID = @Anuncio_ID AND Rol_Destinatario = 'Estudiante';

    SELECT 1 AS Resultado;
END;
```

---

## 2. Endpoints (.NET)

Crear `Endpoints/EstudianteEndpoints.cs`:

```csharp
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace API_LMS.Endpoints;

public static class EstudianteEndpoints
{
    public static void MapEstudianteEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/estudiante")
            .RequireAuthorization()
            .WithTags("Estudiante");

        group.MapGet("/cursos", [Authorize(Roles = "Estudiante")] async (
            ClaimsPrincipal user, DbService db) =>
        {
            var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?> { ["@Usuario_ID"] = usuarioId };
            var result = await db.EjecutarSpAsync("SP_EstudianteCursosDetallado", param);
            return Results.Ok(result);
        })
        .WithName("EstudianteCursosDetallado")
        .Produces(200);

        group.MapGet("/anuncios", [Authorize(Roles = "Estudiante")] async (
            ClaimsPrincipal user, DbService db) =>
        {
            var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?> { ["@Usuario_ID"] = usuarioId };
            var result = await db.EjecutarSpAsync("SP_EstudianteAnuncios", param);
            return Results.Ok(result);
        })
        .WithName("EstudianteAnuncios")
        .Produces(200);

        group.MapPut("/anuncios/{id}/leido", [Authorize(Roles = "Estudiante")] async (
            int id, ClaimsPrincipal user, DbService db) =>
        {
            var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?> { ["@Anuncio_ID"] = id, ["@Usuario_ID"] = usuarioId };
            await db.EjecutarSpAsync("SP_EstudianteMarcarAnuncioLeido", param);
            return Results.Ok(new { message = "Marcado como leído" });
        })
        .WithName("EstudianteMarcarAnuncioLeido")
        .Produces(200);
    }
}
```

Registrar en `Program.cs`:

```csharp
app.MapEstudianteEndpoints();
```

---

## 3. Tests PowerShell

Crear `tests/phase7/test-estudiante-modulos.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

$loginBody = @{ username = "estudiante"; password = "estudiante123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 7: Tests Estudiante ==="

# 1. Dashboard
Write-Host "`n--- Dashboard Estudiante ---"
$dashboard = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard" -Method GET -Headers $headers
Write-Host "Tareas Pendientes: $($dashboard.TareasPendientes)"
Write-Host "Exámenes Pendientes: $($dashboard.ExamenesPendientes)"
Write-Host "Promedio: $($dashboard.PromedioGeneral)"

# 2. Cursos
Write-Host "`n--- Cursos del Estudiante ---"
$cursos = Invoke-RestMethod -Uri "$BaseUrl/api/estudiante/cursos" -Method GET -Headers $headers
Write-Host "Cursos: $($cursos.Count)"
$cursos | ForEach-Object { Write-Host "  $($_.Materia) - $($_.Profesor) - Progreso: $($_.Progreso)%" }

# 3. Anuncios
Write-Host "`n--- Anuncios del Estudiante ---"
$anuncios = Invoke-RestMethod -Uri "$BaseUrl/api/estudiante/anuncios" -Method GET -Headers $headers
Write-Host "Anuncios: $($anuncios.Count)"
$anuncios | ForEach-Object { Write-Host "  $($_.Titulo) [$($_.Categoria)] - Leído: $(-not $_.NoLeido)" }

# 4. Marcar anuncio como leído
if ($anuncios.Count -gt 0) {
    $anuncioId = $anuncios[0].Anuncio_ID
    Write-Host "`n--- Marcar Anuncio Leído ---"
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/estudiante/anuncios/$anuncioId/leido" -Method PUT -Headers $headers
    Write-Host "Resultado: $($result | ConvertTo-Json -Compress)"
}

Write-Host "`n=== Fase 7: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Servicio — `estudiante.service.ts` (nuevo)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstudianteService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerCursos() {
    return this.http.get<any[]>(`${this.apiUrl}/api/estudiante/cursos`);
  }

  obtenerAnuncios() {
    return this.http.get<any[]>(`${this.apiUrl}/api/estudiante/anuncios`);
  }

  marcarAnuncioLeido(id: number) {
    return this.http.put<any>(`${this.apiUrl}/api/estudiante/anuncios/${id}/leido`, {});
  }
}
```

### 4.2 EstudianteDashboardComponent

Reemplazar placeholder:
- 4 stat cards: Tareas Pendientes, Próximos Exámenes, Promedio General
- Sección "Mis Cursos" con grid de cards (materia, profesor, progreso con barra)
- Sección "Anuncios Recientes" con lista

### 4.3 EstudianteCursosComponent

Reemplazar placeholder:
- Grid de cards de cursos con icono de color, materia, grado, sección, profesor, progreso %
- Click en curso → vista detalle con materiales, tareas relacionadas, exámenes

### 4.4 EstudianteAnunciosComponent

Reemplazar placeholder:
- Tabs: Todos, Académico, Eventos, Comunidad, Deportes, Soporte IT
- Barra de búsqueda
- Lista de anuncios con badge de no leído
- Click → vista detalle con contenido completo y botón volver

### 4.5 Rutas

Ya configuradas en Fase 0:
- `/sistema` → Dashboard del estudiante
- `/sistema/cursos`
- `/sistema/anuncios`

---

## 5. Tests Playwright

Crear `tests-e2e/tests/phase7-estudiante.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 7 - Portal Estudiante', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Estudiante').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.student.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.student.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await expect(page).toHaveURL(/\/sistema\/dashboard/);
  });

  test('dashboard muestra cursos del estudiante', async ({ page }) => {
    await expect(page.getByText('Mis Cursos')).toBeVisible();
    // Verificar que hay al menos un curso
    const cards = page.locator('.curso-card, .card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('navegar a cursos y ver detalle', async ({ page }) => {
    await page.getByRole('link', { name: 'Cursos' }).click();
    await expect(page).toHaveURL(/\/sistema\/cursos/);
    await expect(page.getByText('Mis Cursos')).toBeVisible();
    // Click en primer curso
    await page.locator('.curso-card, .card').first().click();
    await expect(page.getByText('Detalle del Curso')).toBeVisible();
  });

  test('navegar a anuncios y filtrar', async ({ page }) => {
    await page.getByRole('link', { name: 'Anuncios' }).click();
    await expect(page).toHaveURL(/\/sistema\/anuncios/);
    // Click en tab de categoría
    await page.getByRole('tab', { name: /académico/i }).click();
    await page.waitForTimeout(500);
  });

  test('ver detalle de anuncio', async ({ page }) => {
    await page.getByRole('link', { name: 'Anuncios' }).click();
    await page.waitForSelector('.anuncio-item, .card');
    await page.locator('.anuncio-item, .card').first().click();
    await expect(page.getByText('Volver')).toBeVisible();
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Dashboard muestra datos reales del estudiante | PowerShell muestra tareas pendientes, promedio |
| 2 | Cursos se listan con progreso | PowerShell muestra materias y progreso |
| 3 | Anuncios se filtran por categoría | PowerShell muestra anuncios |
| 4 | Marcar como leído funciona | PowerShell marca anuncio |
| 5 | Dashboard muestra cursos en UI | Playwright verifica cards de cursos |
| 6 | Navegación cursos → detalle funciona | Playwright abre detalle de curso |
| 7 | Anuncios se filtran en UI | Playwright filtra por categoría |
