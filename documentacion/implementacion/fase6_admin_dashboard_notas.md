# Fase 6: Admin — Dashboard, Notas y Mantenimiento

**Objetivo:** Dashboard con métricas reales, vista de notas por grado/sección, y módulo de mantenimiento.

---

## 1. Stored Procedures

### 1.1 SP_ObtenerMetricasAdmin (corregir)

Ya existe pero retorna zeros. Corregir:

```sql
ALTER PROCEDURE SP_ObtenerMetricasAdmin
AS
BEGIN
    SELECT
        (SELECT COUNT(*) FROM ESTUDIANTES e INNER JOIN USUARIOS u ON e.Usuario_ID = u.Usuario_ID WHERE u.Activo = 1) AS TotalEstudiantes,
        (SELECT COUNT(*) FROM PROFESORES pr INNER JOIN USUARIOS u ON pr.Usuario_ID = u.Usuario_ID WHERE u.Activo = 1) AS TotalProfesores,
        (SELECT COUNT(DISTINCT Asignacion_ID) FROM PROFESORES_CURSOS) AS CursosActivos,
        (SELECT COUNT(*) FROM TOKENS_REGISTRO WHERE Activo = 1 AND FechaExpiracion > SYSUTCDATETIME()) AS TokensActivos;
END;
```

### 1.2 SP_ListarNotasAdmin

```sql
CREATE PROCEDURE SP_ListarNotasAdmin
    @Grado_ID INT,
    @Seccion_ID INT = NULL,
    @Bloque INT = 1
AS
BEGIN
    SELECT
        p.PrimerNombre + ' ' + p.PrimerApellido AS Estudiante,
        e.Carnet,
        c.Nombre AS Materia,
        n.Tarea1, n.Examen1, n.Tarea2, n.Proyecto, n.Participacion,
        n.Promedio,
        CASE WHEN n.Estado = 'Aprobado' THEN 'Aprobado' ELSE 'Reprobado' END AS Estado
    FROM NOTAS n
    INNER JOIN ESTUDIANTES e ON n.Estudiante_ID = e.Estudiante_ID
    INNER JOIN PERSONAS p ON e.Persona_ID = p.Persona_ID
    INNER JOIN CURSOS c ON n.Curso_ID = c.Curso_ID
    WHERE e.Grado_ID = @Grado_ID
        AND (@Seccion_ID IS NULL OR e.Seccion_ID = @Seccion_ID)
        AND n.Bloque = @Bloque
    ORDER BY p.PrimerApellido, p.PrimerNombre, c.Nombre;
END;
```

### 1.3 SP_MantenimientoCrear

```sql
CREATE PROCEDURE SP_MantenimientoCrear
    @Tipo NVARCHAR(50),
    @Descripcion NVARCHAR(500),
    @Fecha DATE,
    @HoraInicio TIME,
    @HoraFin TIME,
    @CreadoPor_ID INT
AS
BEGIN
    INSERT INTO MANTENIMIENTO (Tipo, Descripcion, Fecha, HoraInicio, HoraFin, CreadoPor_ID)
    VALUES (@Tipo, @Descripcion, @Fecha, @HoraInicio, @HoraFin, @CreadoPor_ID);

    SELECT SCOPE_IDENTITY() AS Mantenimiento_ID, 'Mantenimiento programado' AS Mensaje;
END;
```

### 1.4 SP_MantenimientoListar

```sql
CREATE PROCEDURE SP_MantenimientoListar
AS
BEGIN
    SELECT
        m.Mantenimiento_ID, m.Tipo, m.Descripcion, m.Fecha,
        m.HoraInicio, m.HoraFin, m.Estado,
        p.PrimerNombre + ' ' + p.PrimerApellido AS CreadoPor,
        m.FechaCreacion
    FROM MANTENIMIENTO m
    INNER JOIN USUARIOS u ON m.CreadoPor_ID = u.Usuario_ID
    INNER JOIN PERSONAS p ON u.Persona_ID = p.Persona_ID
    ORDER BY m.Fecha DESC, m.HoraInicio DESC;
END;
```

### 1.5 SP_MantenimientoCancelar

```sql
CREATE PROCEDURE SP_MantenimientoCancelar
    @Mantenimiento_ID INT
AS
BEGIN
    UPDATE MANTENIMIENTO SET Estado = 'Cancelado' WHERE Mantenimiento_ID = @Mantenimiento_ID;
    SELECT 1 AS Resultado, 'Mantenimiento cancelado' AS Mensaje;
END;
```

---

## 2. Endpoints (.NET)

### 2.1 Dashboard (corregir `DashboardEndpoints.cs`)

Ya usa `SP_ObtenerMetricasAdmin`. Solo necesita que el SP devuelva datos reales (paso 1.1).

### 2.2 Crear `Endpoints/AdminNotasEndpoints.cs`

```csharp
using Microsoft.AspNetCore.Authorization;

namespace API_LMS.Endpoints;

public static class AdminNotasEndpoints
{
    public static void MapAdminNotasEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin/notas")
            .RequireAuthorization()
            .WithTags("Admin");

        group.MapGet("/", [Authorize(Roles = "Administrador")] async (
            int gradoId, int? seccionId, int? bloque, DbService db) =>
        {
            var param = new Dictionary<string, object?>
            {
                ["@Grado_ID"] = gradoId,
                ["@Seccion_ID"] = seccionId ?? (object)DBNull.Value,
                ["@Bloque"] = bloque ?? 1
            };
            var result = await db.EjecutarSpAsync("SP_ListarNotasAdmin", param);
            return Results.Ok(result);
        })
        .WithName("ListarNotasAdmin")
        .Produces(200);
    }
}
```

### 2.3 Crear `Endpoints/AdminMantenimientoEndpoints.cs`

```csharp
using Microsoft.AspNetCore.Authorization;

namespace API_LMS.Endpoints;

public static class AdminMantenimientoEndpoints
{
    public static void MapAdminMantenimientoEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin/mantenimiento")
            .RequireAuthorization()
            .WithTags("Admin");

        group.MapGet("/", [Authorize(Roles = "Administrador")] async (DbService db) =>
        {
            var result = await db.EjecutarSpAsync("SP_MantenimientoListar");
            return Results.Ok(result);
        })
        .WithName("ListarMantenimiento")
        .Produces(200);

        group.MapPost("/", [Authorize(Roles = "Administrador")] async (
            CrearMantenimientoRequest request, ClaimsPrincipal user, DbService db) =>
        {
            var autorId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?>
            {
                ["@Tipo"] = request.Tipo,
                ["@Descripcion"] = request.Descripcion,
                ["@Fecha"] = request.Fecha,
                ["@HoraInicio"] = request.HoraInicio,
                ["@HoraFin"] = request.HoraFin ?? (object)DBNull.Value,
                ["@CreadoPor_ID"] = autorId
            };
            var result = await db.EjecutarSpAsync("SP_MantenimientoCrear", param);
            return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
        })
        .WithName("CrearMantenimiento")
        .Produces(200);

        group.MapPut("/{id}/cancelar", [Authorize(Roles = "Administrador")] async (
            int id, DbService db) =>
        {
            var param = new Dictionary<string, object?> { ["@Mantenimiento_ID"] = id };
            var result = await db.EjecutarSpAsync("SP_MantenimientoCancelar", param);
            return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
        })
        .WithName("CancelarMantenimiento")
        .Produces(200);
    }
}

public record CrearMantenimientoRequest(
    string Tipo, string Descripcion, string Fecha,
    string HoraInicio, string? HoraFin
);
```

Registrar en `Program.cs`:

```csharp
app.MapAdminNotasEndpoints();
app.MapAdminMantenimientoEndpoints();
```

---

## 3. Tests PowerShell

Crear `tests/phase6/test-dashboard-notas-mantenimiento.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 6: Tests Dashboard, Notas, Mantenimiento ==="

# 1. Dashboard con métricas reales
Write-Host "`n--- Dashboard Admin ---"
$dashboard = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard" -Method GET -Headers $headers
Write-Host "Estudiantes: $($dashboard.TotalEstudiantes)"
Write-Host "Profesores: $($dashboard.TotalProfesores)"
Write-Host "Cursos Activos: $($dashboard.CursosActivos)"

# 2. Notas por grado
Write-Host "`n--- Notas Grado 1, Sección 1, Bloque 1 ---"
$notas = Invoke-RestMethod -Uri "$BaseUrl/api/admin/notas?gradoId=1&seccionId=1&bloque=1" -Method GET -Headers $headers
Write-Host "Registros: $($notas.Count)"
$notas | ForEach-Object { Write-Host "  $($_.Estudiante) - $($_.Materia) - Promedio: $($_.Promedio) ($($_.Estado))" }

# 3. Mantenimiento - listar
Write-Host "`n--- Listar Mantenimiento ---"
$mant = Invoke-RestMethod -Uri "$BaseUrl/api/admin/mantenimiento" -Method GET -Headers $headers
Write-Host "Registros: $($mant.Count)"

# 4. Mantenimiento - crear
Write-Host "`n--- Crear Mantenimiento ---"
$nuevoMant = @{
    tipo = "Respaldo"
    descripcion = "Respaldo de base de datos semanal"
    fecha = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    horaInicio = "02:00"
    horaFin = "04:00"
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$BaseUrl/api/admin/mantenimiento" -Method POST -ContentType "application/json" -Headers $headers -Body $nuevoMant
Write-Host "Resultado: $($result | ConvertTo-Json -Compress)"

# 5. Mantenimiento - cancelar
$mantActualizado = Invoke-RestMethod -Uri "$BaseUrl/api/admin/mantenimiento" -Method GET -Headers $headers
$ultimo = $mantActualizado | Where-Object { $_.Estado -eq 'Programado' } | Select-Object -First 1
if ($ultimo) {
    Write-Host "`n--- Cancelar Mantenimiento ---"
    $cancelResult = Invoke-RestMethod -Uri "$BaseUrl/api/admin/mantenimiento/$($ultimo.Mantenimiento_ID)/cancelar" -Method PUT -Headers $headers
    Write-Host "Resultado: $($cancelResult | ConvertTo-Json -Compress)"
}

Write-Host "`n=== Fase 6: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Dashboard

El `DashboardComponent` existente ya llama a `/api/dashboard`. Con el SP corregido, mostrará métricas reales. Actualizar el HTML para mostrar:
- Cards: Total Estudiantes, Total Profesores, Cursos Activos, Tokens Activos
- Tabla de últimos cambios (placeholder por ahora)

### 4.2 AdminNotasComponent

- Filtros: Grado (select), Sección (select), Bloque (tabs 1/2)
- Tabla: Estudiante, Carnet, Materia, Tarea1, Examen1, Tarea2, Proyecto, Participación, Promedio, Estado
- Botón exportar reporte

### 4.3 MantenimientoComponent

- Stats cards: Programados, Completados, Último Check
- Tabla: Tipo, Descripción, Fecha, Horario, Estado (badge), Acciones
- Modal programar: Tipo (select), Descripción, Fecha, Horario
- Cancelar con confirmación

### 4.4 Rutas

Ya configuradas en Fase 0:
- `/sistema/dashboard` (mejorado)
- `/sistema/admin/notas`
- `/sistema/admin/mantenimiento`

---

## 5. Tests Playwright

Crear `tests-e2e/tests/phase6-dashboard-notas.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 6 - Dashboard, Notas, Mantenimiento', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Administrador').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.admin.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.admin.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
  });

  test('dashboard muestra métricas reales', async ({ page }) => {
    await expect(page).toHaveURL(/\/sistema\/dashboard/);
    // Verificar que al menos una métrica es > 0
    const stats = page.locator('.stat-value, .stat-number, .metric');
    await expect(stats.first()).not.toHaveText('0');
  });

  test('navegar a notas y filtrar', async ({ page }) => {
    await page.getByRole('link', { name: 'Notas' }).click();
    await expect(page).toHaveURL(/\/sistema\/admin\/notas/);
    // Seleccionar grado
    await page.locator('select').first().selectOption({ index: 1 });
    await page.waitForTimeout(500);
    // Verificar tabla
    await expect(page.locator('table.data-table')).toBeVisible();
  });

  test('navegar a mantenimiento', async ({ page }) => {
    await page.getByRole('link', { name: 'Mantenimiento' }).click();
    await expect(page).toHaveURL(/\/sistema\/admin\/mantenimiento/);
    await expect(page.getByText('Mantenimiento del Sistema')).toBeVisible();
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Dashboard muestra métricas > 0 | PowerShell muestra estudiantes, profesores, cursos |
| 2 | Notas se listan por grado/sección | PowerShell muestra calificaciones |
| 3 | Mantenimiento se crea y cancela | PowerShell crea y cancela registro |
| 4 | Dashboard muestra datos reales en UI | Playwright verifica métricas |
| 5 | Notas se filtran correctamente | Playwright filtra por grado |
| 6 | Mantenimiento funciona end-to-end | Playwright programa y cancela |
