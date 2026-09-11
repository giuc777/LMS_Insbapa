# Fase 10: Profesor — Tareas y Notas

**Objetivo:** Crear tareas, ver entregas, calificar individual y masivamente, gestionar notas.

---

## 1. Stored Procedures

### 1.1 SP_ProfesorTareas

```sql
CREATE PROCEDURE SP_ProfesorTareas
    @Usuario_ID INT,
    @Curso_ID INT = NULL
AS
BEGIN
    SELECT
        t.Tarea_ID, t.Titulo, t.FechaLimite, t.Estado, t.Peso,
        c.Nombre AS Materia,
        g.Nombre AS Grado, s.Nombre AS Seccion,
        (SELECT COUNT(*) FROM TAREAS_ENTREGAS te WHERE te.Tarea_ID = t.Tarea_ID) AS Entregadas,
        (SELECT COUNT(*) FROM ESTUDIANTES e WHERE e.Grado_ID = t.Grado_ID AND e.Seccion_ID = t.Seccion_ID) AS TotalEstudiantes
    FROM TAREAS t
    INNER JOIN CURSOS c ON t.Curso_ID = c.Curso_ID
    INNER JOIN GRADOS g ON t.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON t.Seccion_ID = s.Seccion_ID
    INNER JOIN PROFESORES pr ON t.CreadoPor_ID = pr.Usuario_ID
    WHERE pr.Usuario_ID = @Usuario_ID
        AND (@Curso_ID IS NULL OR t.Curso_ID = @Curso_ID)
    ORDER BY t.FechaLimite DESC;
END;
```

### 1.2 SP_ProfesorCrearTarea

```sql
CREATE PROCEDURE SP_ProfesorCrearTarea
    @Titulo NVARCHAR(150),
    @Instrucciones NVARCHAR(MAX),
    @FechaLimite DATETIME2,
    @Peso DECIMAL(5,2),
    @Curso_ID INT,
    @Grado_ID INT,
    @Seccion_ID INT,
    @CreadoPor_ID INT
AS
BEGIN
    INSERT INTO TAREAS (Titulo, Instrucciones, FechaLimite, Peso, Curso_ID, Grado_ID, Seccion_ID, CreadoPor_ID)
    VALUES (@Titulo, @Instrucciones, @FechaLimite, @Peso, @Curso_ID, @Grado_ID, @Seccion_ID, @CreadoPor_ID);
    SELECT SCOPE_IDENTITY() AS Tarea_ID, 'Tarea creada correctamente' AS Mensaje;
END;
```

### 1.3 SP_ProfesorEntregasTarea

```sql
CREATE PROCEDURE SP_ProfesorEntregasTarea
    @Tarea_ID INT
AS
BEGIN
    SELECT
        te.Entrega_ID, te.Estado, te.ArchivoURL, te.Comentario,
        te.Puntaje, te.FechaEntrega,
        e.Carnet,
        p.PrimerNombre + ' ' + p.PrimerApellido AS Estudiante
    FROM TAREAS_ENTREGAS te
    INNER JOIN ESTUDIANTES e ON te.Estudiante_ID = e.Estudiante_ID
    INNER JOIN PERSONAS p ON e.Persona_ID = p.Persona_ID
    WHERE te.Tarea_ID = @Tarea_ID
    ORDER BY p.PrimerApellido, p.PrimerNombre;
END;
```

### 1.4 SP_ProfesorCalificarEntrega

```sql
CREATE PROCEDURE SP_ProfesorCalificarEntrega
    @Entrega_ID INT,
    @Puntaje DECIMAL(5,2),
    @CalificadoPor_ID INT
AS
BEGIN
    UPDATE TAREAS_ENTREGAS
    SET Puntaje = @Puntaje, Estado = 'Calificada',
        FechaCalificacion = SYSUTCDATETIME(), CalificadoPor_ID = @CalificadoPor_ID
    WHERE Entrega_ID = @Entrega_ID;
    SELECT 1 AS Resultado, 'Calificación guardada' AS Mensaje;
END;
```

### 1.5 SP_ProfesorCalificarMultiple

```sql
CREATE PROCEDURE SP_ProfesorCalificarMultiple
    @Calificaciones NVARCHAR(MAX),  -- JSON: [{"Entrega_ID": 1, "Puntaje": 8.5}, ...]
    @CalificadoPor_ID INT
AS
BEGIN
    DECLARE @i INT = 0;
    DECLARE @count INT = (SELECT COUNT(*) FROM OPENJSON(@Calificaciones));

    WHILE @i < @count
    BEGIN
        DECLARE @EntregaId INT = JSON_VALUE(@Calificaciones, CONCAT('$[', @i, '].Entrega_ID'));
        DECLARE @Puntaje DECIMAL(5,2) = JSON_VALUE(@Calificaciones, CONCAT('$[', @i, '].Puntaje'));

        UPDATE TAREAS_ENTREGAS
        SET Puntaje = @Puntaje, Estado = 'Calificada',
            FechaCalificacion = SYSUTCDATETIME(), CalificadoPor_ID = @CalificadoPor_ID
        WHERE Entrega_ID = @EntregaId;

        SET @i = @i + 1;
    END

    SELECT 1 AS Resultado, 'Calificaciones guardadas' AS Mensaje;
END;
```

### 1.6 SP_ProfesorNotasClase

```sql
CREATE PROCEDURE SP_ProfesorNotasClase
    @Usuario_ID INT,
    @Grado_ID INT,
    @Seccion_ID INT,
    @Curso_ID INT,
    @Bloque INT = 1
AS
BEGIN
    SELECT
        e.Estudiante_ID,
        p.PrimerNombre + ' ' + p.PrimerApellido AS Estudiante,
        e.Carnet,
        ISNULL(n.Tarea1, 0) AS Tarea1,
        ISNULL(n.Examen1, 0) AS Examen1,
        ISNULL(n.Tarea2, 0) AS Tarea2,
        ISNULL(n.Proyecto, 0) AS Proyecto,
        ISNULL(n.Participacion, 0) AS Participacion,
        ISNULL(n.Promedio, 0) AS Promedio,
        n.Estado
    FROM ESTUDIANTES e
    INNER JOIN PERSONAS p ON e.Persona_ID = p.Persona_ID
    LEFT JOIN NOTAS n ON n.Estudiante_ID = e.Estudiante_ID AND n.Curso_ID = @Curso_ID AND n.Bloque = @Bloque
    WHERE e.Grado_ID = @Grado_ID AND e.Seccion_ID = @Seccion_ID
    ORDER BY p.PrimerApellido, p.PrimerNombre;
END;
```

---

## 2. Endpoints (.NET)

Agregar a `ProfesorEndpoints.cs`:

```csharp
// --- Tareas ---
group.MapGet("/tareas", [Authorize(Roles = "Profesor")] async (
    int? cursoId, ClaimsPrincipal user, DbService db) =>
{
    var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var param = new Dictionary<string, object?> { ["@Usuario_ID"] = usuarioId };
    if (cursoId.HasValue) param["@Curso_ID"] = cursoId;
    var result = await db.EjecutarSpAsync("SP_ProfesorTareas", param);
    return Results.Ok(result);
})
.WithName("ProfesorTareas")
.Produces(200);

group.MapPost("/tareas", [Authorize(Roles = "Profesor")] async (
    CrearTareaRequest request, ClaimsPrincipal user, DbService db) =>
{
    var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var param = new Dictionary<string, object?>
    {
        ["@Titulo"] = request.Titulo,
        ["@Instrucciones"] = request.Instrucciones ?? (object)DBNull.Value,
        ["@FechaLimite"] = request.FechaLimite,
        ["@Peso"] = request.Peso,
        ["@Curso_ID"] = request.CursoId,
        ["@Grado_ID"] = request.GradoId,
        ["@Seccion_ID"] = request.SeccionId,
        ["@CreadoPor_ID"] = usuarioId
    };
    var result = await db.EjecutarSpAsync("SP_ProfesorCrearTarea", param);
    return Results.Ok(new { tareaId = result[0]["Tarea_ID"], message = result[0]["Mensaje"]?.ToString() });
})
.WithName("ProfesorCrearTarea")
.Produces(200);

group.MapGet("/tareas/{id}/entregas", [Authorize(Roles = "Profesor")] async (
    int id, DbService db) =>
{
    var param = new Dictionary<string, object?> { ["@Tarea_ID"] = id };
    var result = await db.EjecutarSpAsync("SP_ProfesorEntregasTarea", param);
    return Results.Ok(result);
})
.WithName("ProfesorEntregasTarea")
.Produces(200);

group.MapPut("/entregas/{id}/calificar", [Authorize(Roles = "Profesor")] async (
    int id, CalificarEntregaRequest request, ClaimsPrincipal user, DbService db) =>
{
    var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var param = new Dictionary<string, object?>
    {
        ["@Entrega_ID"] = id,
        ["@Puntaje"] = request.Puntaje,
        ["@CalificadoPor_ID"] = usuarioId
    };
    var result = await db.EjecutarSpAsync("SP_ProfesorCalificarEntrega", param);
    return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
})
.WithName("ProfesorCalificarEntrega")
.Produces(200);

group.MapPut("/entregas/calificar-multiple", [Authorize(Roles = "Profesor")] async (
    CalificarMultipleRequest request, ClaimsPrincipal user, DbService db) =>
{
    var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var param = new Dictionary<string, object?>
    {
        ["@Calificaciones"] = request.Calificaciones,
        ["@CalificadoPor_ID"] = usuarioId
    };
    var result = await db.EjecutarSpAsync("SP_ProfesorCalificarMultiple", param);
    return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
})
.WithName("ProfesorCalificarMultiple")
.Produces(200);

// --- Notas ---
group.MapGet("/notas", [Authorize(Roles = "Profesor")] async (
    int gradoId, int seccionId, int cursoId, int? bloque, ClaimsPrincipal user, DbService db) =>
{
    var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var param = new Dictionary<string, object?>
    {
        ["@Usuario_ID"] = usuarioId,
        ["@Grado_ID"] = gradoId,
        ["@Seccion_ID"] = seccionId,
        ["@Curso_ID"] = cursoId,
        ["@Bloque"] = bloque ?? 1
    };
    var result = await db.EjecutarSpAsync("SP_ProfesorNotasClase", param);
    return Results.Ok(result);
})
.WithName("ProfesorNotasClase")
.Produces(200);
```

DTOs:

```csharp
public record CrearTareaRequest(
    string Titulo, string? Instrucciones, string FechaLimite,
    decimal Peso, int CursoId, int GradoId, int SeccionId
);

public record CalificarEntregaRequest(decimal Puntaje);

public record CalificarMultipleRequest(string Calificaciones);  // JSON array
```

---

## 3. Tests PowerShell

Crear `tests/phase10/test-profesor-tareas-notas.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

$loginBody = @{ username = "profesor"; password = "profesor123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 10: Tests Profesor Tareas y Notas ==="

# 1. Listar tareas
Write-Host "`n--- Mis Tareas ---"
$tareas = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/tareas" -Method GET -Headers $headers
Write-Host "Tareas: $($tareas.Count)"
$tareas | ForEach-Object { Write-Host "  $($_.Titulo) - $($_.Materia) - Entregadas: $($_.Entregadas)/$($_.TotalEstudiantes)" }

# 2. Crear tarea
Write-Host "`n--- Crear Tarea ---"
$clases = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/clases" -Method GET -Headers $headers
$clase = $clases[0]
$nuevaTarea = @{
    titulo = "Tarea de Prueba Fase 10"
    instrucciones = "Resolver los ejercicios del libro página 50."
    fechaLimite = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")
    peso = 1.0
    cursoId = $clase.Curso_ID
    gradoId = $clase.Grado_ID
    seccionId = $clase.Seccion_ID
} | ConvertTo-Json
$tareaResult = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/tareas" -Method POST -ContentType "application/json" -Headers $headers -Body $nuevaTarea
Write-Host "Tarea creada: $($tareaResult | ConvertTo-Json -Compress)"

# 3. Ver entregas de una tarea existente
if ($tareas.Count -gt 0) {
    $tareaId = $tareas[0].Tarea_ID
    Write-Host "`n--- Entregas de Tarea (ID: $tareaId) ---"
    $entregas = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/tareas/$tareaId/entregas" -Method GET -Headers $headers
    Write-Host "Entregas: $($entregas.Count)"
    $entregas | ForEach-Object { Write-Host "  $($_.Estudiante) - Estado: $($_.Estado) - Nota: $($_.Puntaje)" }

    # 4. Calificar entrega
    if ($entregas.Count -gt 0) {
        $entregaId = $entregas[0].Entrega_ID
        Write-Host "`n--- Calificar Entrega (ID: $entregaId) ---"
        $calResult = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/entregas/$entregaId/calificar" -Method PUT -ContentType "application/json" -Headers $headers -Body '{"puntaje": 8.5}'
        Write-Host "Resultado: $($calResult | ConvertTo-Json -Compress)"
    }
}

# 5. Notas de clase
Write-Host "`n--- Notas de Clase ---"
$notas = Invoke-RustMethod -Uri "$BaseUrl/api/profesor/notas?gradoId=1&seccionId=1&cursoId=1&bloque=1" -Method GET -Headers $headers
Write-Host "Estudiantes: $($notas.Count)"
$notas | ForEach-Object { Write-Host "  $($_.Estudiante) - Promedio: $($_.Promedio)" }

Write-Host "`n=== Fase 10: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Agregar a `profesor.service.ts`

```typescript
obtenerTareas(cursoId?: number) {
  let params: any = {};
  if (cursoId) params.cursoId = cursoId;
  return this.http.get<any[]>(`${this.apiUrl}/api/profesor/tareas`, { params });
}

crearTarea(data: any) {
  return this.http.post<any>(`${this.apiUrl}/api/profesor/tareas`, data);
}

obtenerEntregas(tareaId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/api/profesor/tareas/${tareaId}/entregas`);
}

calificarEntrega(id: number, puntaje: number) {
  return this.http.put<any>(`${this.apiUrl}/api/profesor/entregas/${id}/calificar`, { puntaje });
}

calificarMultiple(calificaciones: string) {
  return this.http.put<any>(`${this.apiUrl}/api/profesor/entregas/calificar-multiple`, { calificaciones });
}

obtenerNotasClase(gradoId: number, seccionId: number, cursoId: number, bloque?: number) {
  let params: any = { gradoId, seccionId, cursoId };
  if (bloque) params.bloque = bloque;
  return this.http.get<any[]>(`${this.apiUrl}/api/profesor/notas`, { params });
}
```

### 4.2 ProfesorTareasComponent

- Stats cards: Total Tareas, Entregadas, Pendientes, Por Calificar
- Tabs por bloque
- Tabla: Título, Materia, Grado/Sección, Fecha Límite, Entregadas/Total, Acciones
- Modal crear tarea: Título, Instrucciones, Fecha Límite, Peso, Clase/Sección/Materia
- Vista de entregas: tabla con estudiantes, estado, archivo, campo de puntaje editable, botón guardar

### 4.3 ProfesorNotasComponent

- Filtros: Grado, Sección, Materia, Bloque
- Tabla editable: Estudiante, Carnet, Tarea1, Examen1, Tarea2, Proyecto, Participación, Total, Estado
- Cada celda de nota es un `<input type="number">`
- Total se recalcula en vivo
- Botones: Guardar, Exportar Reporte

### 4.4 Rutas

Ya configuradas en Fase 0:
- `/sistema/profesor/tareas`
- `/sistema/profesor/notas`

---

## 5. Tests Playwright

Crear `tests-e2e/tests/phase10-profesor-tareas.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 10 - Profesor Tareas y Notas', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Profesor').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.teacher.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.teacher.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
  });

  test('ver tareas del profesor', async ({ page }) => {
    await page.getByRole('link', { name: 'Tareas' }).click();
    await expect(page).toHaveURL(/\/sistema\/profesor\/tareas/);
    await expect(page.locator('table.data-table')).toBeVisible();
  });

  test('crear nueva tarea', async ({ page }) => {
    await page.getByRole('link', { name: 'Tareas' }).click();
    await page.getByRole('button', { name: /nueva tarea/i }).click();
    await expect(page.locator('.modal')).toBeVisible();

    await page.locator('.modal input').first().fill('Tarea Playwright');
    await page.locator('.modal textarea').fill('Instrucciones de prueba');
    await page.locator('.modal input[type="date"]').fill('2026-12-31');
    await page.locator('.modal select').first().selectOption({ index: 1 });
    await page.locator('.modal select').nth(1).selectOption({ index: 1 });

    await page.getByRole('button', { name: /crear/i }).last().click();
    await expect(page.locator('.alert-success')).toBeVisible({ timeout: 5000 });
  });

  test('ver entregas de una tarea', async ({ page }) => {
    await page.getByRole('link', { name: 'Tareas' }).click();
    await page.waitForSelector('table.data-table tbody tr');
    await page.locator('table.data-table tbody tr').first().locator('button').first().click();
    await expect(page.locator('.modal, .entregas')).toBeVisible();
    await expect(page.getByText('Entregas')).toBeVisible();
  });

  test('ver notas de clase', async ({ page }) => {
    await page.getByRole('link', { name: 'Notas' }).click();
    await expect(page).toHaveURL(/\/sistema\/profesor\/notas/);
    // Seleccionar filtros
    await page.locator('select').first().selectOption({ index: 1 });
    await page.waitForTimeout(500);
    await expect(page.locator('table.data-table')).toBeVisible();
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Tareas se listan con entregas | PowerShell muestra tareas con conteo |
| 2 | Crear tarea funciona | PowerShell crea tarea |
| 3 | Entregas se listan por tarea | PowerShell muestra entregas |
| 4 | Calificar entrega funciona | PowerShell califica y verifica |
| 5 | Notas de clase se muestran | PowerShell muestra notas |
| 6 | UI lista tareas | Playwright verifica tabla |
| 7 | Crear tarea funciona en UI | Playwright crea tarea |
| 8 | Notas se muestran en UI | Playwright verifica tabla editable |
