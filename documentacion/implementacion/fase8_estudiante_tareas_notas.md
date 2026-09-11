# Fase 8: Estudiante — Tareas y Notas

**Objetivo:** Ver tareas pendientes/completadas/vencidas, enviar entregas, ver calificaciones.

---

## 1. Stored Procedures

### 1.1 SP_EstudianteTareas

```sql
CREATE PROCEDURE SP_EstudianteTareas
    @Usuario_ID INT,
    @Estado NVARCHAR(20) = NULL  -- Pendiente, Completada, Vencida
AS
BEGIN
    DECLARE @EstudianteID INT, @GradoID INT, @SeccionID INT;
    SELECT @EstudianteID = Estudiante_ID, @GradoID = Grado_ID, @SeccionID = Seccion_ID
    FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    SELECT
        t.Tarea_ID AS TareaId,
        c.Nombre AS Curso,
        t.Titulo,
        t.Instrucciones,
        t.FechaLimite,
        t.Peso,
        CASE
            WHEN te.Entrega_ID IS NOT NULL THEN 'Completada'
            WHEN t.FechaLimite < SYSUTCDATETIME() THEN 'Vencida'
            ELSE 'Pendiente'
        END AS Estado,
        te.Puntaje AS Nota,
        te.Entrega_ID AS EntregaId
    FROM TAREAS t
    INNER JOIN CURSOS c ON t.Curso_ID = c.Curso_ID
    LEFT JOIN TAREAS_ENTREGAS te ON t.Tarea_ID = te.Tarea_ID AND te.Estudiante_ID = @EstudianteID
    WHERE t.Grado_ID = @GradoID AND t.Seccion_ID = @SeccionID AND t.Estado = 'Activa'
        AND (@Estado IS NULL OR
            (@Estado = 'Pendiente' AND te.Entrega_ID IS NULL AND t.FechaLimite >= SYSUTCDATETIME()) OR
            (@Estado = 'Completada' AND te.Entrega_ID IS NOT NULL) OR
            (@Estado = 'Vencida' AND te.Entrega_ID IS NULL AND t.FechaLimite < SYSUTCDATETIME()))
    ORDER BY t.FechaLimite DESC;
END;
```

### 1.2 SP_EstudianteEntregarTarea

```sql
CREATE PROCEDURE SP_EstudianteEntregarTarea
    @Tarea_ID INT,
    @Usuario_ID INT,
    @ArchivoURL NVARCHAR(500),
    @Comentario NVARCHAR(MAX)
AS
BEGIN
    DECLARE @EstudianteID INT;
    SELECT @EstudianteID = Estudiante_ID FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    IF EXISTS (SELECT 1 FROM TAREAS_ENTREGAS WHERE Tarea_ID = @Tarea_ID AND Estudiante_ID = @EstudianteID)
    BEGIN
        SELECT 0 AS Resultado, 'Ya existe una entrega para esta tarea' AS Mensaje;
        RETURN;
    END

    INSERT INTO TAREAS_ENTREGAS (Tarea_ID, Estudiante_ID, ArchivoURL, Comentario)
    VALUES (@Tarea_ID, @EstudianteID, @ArchivoURL, @Comentario);

    SELECT 1 AS Resultado, 'Tarea entregada correctamente' AS Mensaje;
END;
```

### 1.3 SP_EstudianteNotas

```sql
CREATE PROCEDURE SP_EstudianteNotas
    @Usuario_ID INT,
    @Bloque INT = 1
AS
BEGIN
    DECLARE @EstudianteID INT;
    SELECT @EstudianteID = Estudiante_ID FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    SELECT
        c.Nombre AS Materia,
        n.Tarea1, n.Examen1, n.Tarea2, n.Proyecto, n.Participacion,
        n.Promedio,
        CASE WHEN n.Estado = 'Aprobado' THEN 'Aprobado' ELSE 'Reprobado' END AS Estado
    FROM NOTAS n
    INNER JOIN CURSOS c ON n.Curso_ID = c.Curso_ID
    WHERE n.Estudiante_ID = @EstudianteID AND n.Bloque = @Bloque
    ORDER BY c.Nombre;
END;
```

---

## 2. Endpoints (.NET)

Agregar a `EstudianteEndpoints.cs`:

```csharp
group.MapGet("/tareas", [Authorize(Roles = "Estudiante")] async (
    string? estado, ClaimsPrincipal user, DbService db) =>
{
    var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var param = new Dictionary<string, object?> { ["@Usuario_ID"] = usuarioId };
    if (!string.IsNullOrEmpty(estado)) param["@Estado"] = estado;
    var result = await db.EjecutarSpAsync("SP_EstudianteTareas", param);
    return Results.Ok(result);
})
.WithName("EstudianteTareas")
.Produces(200);

group.MapPost("/tareas/{id}/entregar", [Authorize(Roles = "Estudiante")] async (
    int id, EntregarTareaRequest request, ClaimsPrincipal user, DbService db) =>
{
    var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var param = new Dictionary<string, object?>
    {
        ["@Tarea_ID"] = id,
        ["@Usuario_ID"] = usuarioId,
        ["@ArchivoURL"] = request.ArchivoURL,
        ["@Comentario"] = request.Comentario ?? (object)DBNull.Value
    };
    var result = await db.EjecutarSpAsync("SP_EstudianteEntregarTarea", param);
    if (Convert.ToInt32(result[0]["Resultado"]) == 0)
        return Results.BadRequest(new { error = result[0]["Mensaje"]?.ToString() });
    return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
})
.WithName("EstudianteEntregarTarea")
.Produces(200)
.Produces(400);

group.MapGet("/notas", [Authorize(Roles = "Estudiante")] async (
    int? bloque, ClaimsPrincipal user, DbService db) =>
{
    var usuarioId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var param = new Dictionary<string, object?>
    {
        ["@Usuario_ID"] = usuarioId,
        ["@Bloque"] = bloque ?? 1
    };
    var result = await db.EjecutarSpAsync("SP_EstudianteNotas", param);
    return Results.Ok(result);
})
.WithName("EstudianteNotas")
.Produces(200);
```

DTO:

```csharp
public record EntregarTareaRequest(string ArchivoURL, string? Comentario);
```

---

## 3. Tests PowerShell

Crear `tests/phase8/test-estudiante-tareas-notas.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

$loginBody = @{ username = "estudiante"; password = "estudiante123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 8: Tests Tareas y Notas Estudiante ==="

# 1. Listar tareas pendientes
Write-Host "`n--- Tareas Pendientes ---"
$pendientes = Invoke-RestMethod -Uri "$BaseUrl/api/estudiante/tareas?estado=Pendiente" -Method GET -Headers $headers
Write-Host "Pendientes: $($pendientes.Count)"
$pendientes | ForEach-Object { Write-Host "  $($_.Titulo) - $($_.Curso) - Límite: $($_.FechaLimite)" }

# 2. Listar todas las tareas
Write-Host "`n--- Todas las Tareas ---"
$todas = Invoke-RestMethod -Uri "$BaseUrl/api/estudiante/tareas" -Method GET -Headers $headers
Write-Host "Total: $($todas.Count)"
$todas | ForEach-Object { Write-Host "  $($_.Titulo) - Estado: $($_.Estado)" }

# 3. Entregar tarea (si hay pendiente)
if ($pendientes.Count -gt 0) {
    $tareaId = $pendientes[0].TareaId
    Write-Host "`n--- Entregar Tarea (ID: $tareaId) ---"
    $entrega = @{
        archivoURL = "https://ejemplo.com/tarea1.pdf"
        comentario = "Tarea de prueba"
    } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/estudiante/tareas/$tareaId/entregar" -Method POST -ContentType "application/json" -Headers $headers -Body $entrega
    Write-Host "Resultado: $($result | ConvertTo-Json -Compress)"
}

# 4. Notas bloque 1
Write-Host "`n--- Notas Bloque 1 ---"
$notas = Invoke-RestMethod -Uri "$BaseUrl/api/estudiante/notas?bloque=1" -Method GET -Headers $headers
Write-Host "Materias con notas: $($notas.Count)"
$notas | ForEach-Object { Write-Host "  $($_.Materia) - Promedio: $($_.Promedio) ($($_.Estado))" }

# 5. Notas bloque 2
Write-Host "`n--- Notas Bloque 2 ---"
$notas2 = Invoke-RustMethod -Uri "$BaseUrl/api/estudiante/notas?bloque=2" -Method GET -Headers $headers
Write-Host "Materias con notas: $($notas2.Count)"

Write-Host "`n=== Fase 8: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Agregar a `estudiante.service.ts`

```typescript
obtenerTareas(estado?: string) {
  let params: any = {};
  if (estado) params.estado = estado;
  return this.http.get<any[]>(`${this.apiUrl}/api/estudiante/tareas`, { params });
}

entregarTarea(id: number, data: any) {
  return this.http.post<any>(`${this.apiUrl}/api/estudiante/tareas/${id}/entregar`, data);
}

obtenerNotas(bloque?: number) {
  let params: any = {};
  if (bloque) params.bloque = bloque;
  return this.http.get<any[]>(`${this.apiUrl}/api/estudiante/notas`, { params });
}
```

### 4.2 EstudianteTareasComponent

- Tabs: Pendientes, Completadas, Vencidas
- Tabla: Título, Curso, Fecha Límite, Estado (badge), Nota, Acciones
- Click en tarea → vista detalle con instrucciones, recursos, zona de envío de archivo
- Botón "Enviar Tarea" con validación de archivo adjunto

### 4.3 EstudianteNotasComponent

- Tabs: Primer Bloque, Segundo Bloque
- Tabla: Materia, Tarea 1, Examen 1, Tarea 2, Proyecto, Participación, Promedio, Estado
- Card con promedio general
- Botón "Descargar Reporte"

### 4.4 Rutas

Ya configuradas en Fase 0:
- `/sistema/tareas`
- `/sistema/notas`

---

## 5. Tests Playwright

Crear `tests-e2e/tests/phase8-estudiante-tareas.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 8 - Estudiante Tareas y Notas', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Estudiante').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.student.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.student.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
  });

  test('ver tareas pendientes', async ({ page }) => {
    await page.getByRole('link', { name: 'Tareas' }).click();
    await expect(page).toHaveURL(/\/sistema\/tareas/);
    await expect(page.getByText('Mis Tareas')).toBeVisible();
    // Tab de pendientes activo por defecto
    await expect(page.locator('.tab.active')).toContainText('Pendientes');
  });

  test('cambiar entre tabs de tareas', async ({ page }) => {
    await page.getByRole('link', { name: 'Tareas' }).click();
    await page.getByRole('tab', { name: /completadas/i }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('.tab.active')).toContainText('Completadas');

    await page.getByRole('tab', { name: /vencidas/i }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('.tab.active')).toContainText('Vencidas');
  });

  test('ver detalle de tarea', async ({ page }) => {
    await page.getByRole('link', { name: 'Tareas' }).click();
    await page.waitForSelector('table.data-table tbody tr');
    await page.locator('table.data-table tbody tr').first().locator('button').first().click();
    await expect(page.locator('.modal, .detalle')).toBeVisible();
    await expect(page.getByText('Instrucciones')).toBeVisible();
  });

  test('ver notas del bloque 1', async ({ page }) => {
    await page.getByRole('link', { name: 'Notas' }).click();
    await expect(page).toHaveURL(/\/sistema\/notas/);
    await expect(page.getByText('Mis Notas')).toBeVisible();
    // Verificar tabla de notas
    await expect(page.locator('table.data-table')).toBeVisible();
    // Verificar que hay columnas de calificación
    await expect(page.getByText('Promedio')).toBeVisible();
  });

  test('cambiar a bloque 2', async ({ page }) => {
    await page.getByRole('link', { name: 'Notas' }).click();
    await page.getByRole('tab', { name: /segundo/i }).click();
    await page.waitForTimeout(500);
    await expect(page.locator('.tab.active')).toContainText('Segundo');
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Tareas se filtran por estado | PowerShell muestra pendientes/completadas/vencidas |
| 2 | Entrega de tarea funciona | PowerShell entrega y verifica |
| 3 | Notas se listan por bloque | PowerShell muestra notas bloque 1 y 2 |
| 4 | UI muestra tabs de tareas | Playwright verifica tabs Pendientes/Completadas/Vencidas |
| 5 | Detalle de tarea funciona | Playwright abre detalle y verifica instrucciones |
| 6 | Notas se muestran en tabla | Playwright verifica tabla de calificaciones |
| 7 | Cambio de bloque funciona | Playwright cambia a bloque 2 |
