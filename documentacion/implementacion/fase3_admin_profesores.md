# Fase 3: Admin — Profesores (Página Dedicada)

**Objetivo:** Página completa de gestión de profesores con perfil detalle, clases asignadas y edición.

---

## 1. Stored Procedures

### 1.1 SP_ObtenerProfesorPorId

```sql
CREATE PROCEDURE SP_ObtenerProfesorPorId
    @Profesor_ID INT
AS
BEGIN
    SELECT
        pr.Profesor_ID, pr.CodigoProfesor,
        p.PrimerNombre, p.SegundoNombre, p.PrimerApellido, p.SegundoApellido,
        p.Correo, p.Telefono, p.FechaNacimiento,
        u.Username, u.Activo, u.Usuario_ID
    FROM PROFESORES pr
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    INNER JOIN USUARIOS u ON pr.Usuario_ID = u.Usuario_ID
    WHERE pr.Profesor_ID = @Profesor_ID;
END;
```

### 1.2 SP_ProfesorClasesAsignadas

```sql
CREATE PROCEDURE SP_ProfesorClasesAsignadas
    @Profesor_ID INT
AS
BEGIN
    SELECT
        c.Codigo, c.Nombre AS Materia,
        g.Nombre AS Grado, s.Nombre AS Seccion,
        (SELECT COUNT(*) FROM ESTUDIANTES e WHERE e.Grado_ID = pc.Grado_ID AND e.Seccion_ID = pc.Seccion_ID) AS Estudiantes
    FROM PROFESORES_CURSOS pc
    INNER JOIN CURSOS c ON pc.Curso_ID = c.Curso_ID
    INNER JOIN GRADOS g ON pc.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON pc.Seccion_ID = s.Seccion_ID
    WHERE pc.Profesor_ID = @Profesor_ID
    ORDER BY g.Orden, s.Nombre, c.Nombre;
END;
```

### 1.3 SP_ActualizarProfesorAdmin

```sql
CREATE PROCEDURE SP_ActualizarProfesorAdmin
    @Profesor_ID INT,
    @PrimerNombre NVARCHAR(50),
    @SegundoNombre NVARCHAR(50),
    @PrimerApellido NVARCHAR(50),
    @SegundoApellido NVARCHAR(50),
    @Correo NVARCHAR(100),
    @Telefono NVARCHAR(20),
    @CodigoProfesor NVARCHAR(20),
    @Activo BIT
AS
BEGIN
    DECLARE @Persona_ID INT, @Usuario_ID INT;
    SELECT @Persona_ID = Persona_ID, @Usuario_ID = Usuario_ID FROM PROFESORES WHERE Profesor_ID = @Profesor_ID;

    UPDATE PERSONAS SET PrimerNombre = @PrimerNombre, SegundoNombre = @SegundoNombre,
        PrimerApellido = @PrimerApellido, SegundoApellido = @SegundoApellido,
        Correo = @Correo, Telefono = @Telefono
    WHERE Persona_ID = @Persona_ID;

    UPDATE USUARIOS SET Activo = @Activo WHERE Usuario_ID = @Usuario_ID;

    UPDATE PROFESORES SET CodigoProfesor = @CodigoProfesor WHERE Profesor_ID = @Profesor_ID;

    SELECT 1 AS Resultado, 'Profesor actualizado correctamente' AS Mensaje;
END;
```

---

## 2. Endpoints (.NET)

Agregar a `AdminUsuariosEndpoints.cs`:

```csharp
// GET /api/admin/profesores/{id}
group.MapGet("/profesores/{id}", [Authorize(Roles = "Administrador")] async (int id, DbService db) =>
{
    var param = new Dictionary<string, object?> { ["@Profesor_ID"] = id };
    var result = await db.EjecutarSpAsync("SP_ObtenerProfesorPorId", param);
    if (result.Count == 0) return Results.NotFound(new { error = "Profesor no encontrado" });
    return Results.Ok(result[0]);
})
.WithName("ObtenerProfesorPorId")
.Produces(200)
.Produces(404);

// GET /api/admin/profesores/{id}/clases
group.MapGet("/profesores/{id}/clases", [Authorize(Roles = "Administrador")] async (int id, DbService db) =>
{
    var param = new Dictionary<string, object?> { ["@Profesor_ID"] = id };
    var result = await db.EjecutarSpAsync("SP_ProfesorClasesAsignadas", param);
    return Results.Ok(result);
})
.WithName("ProfesorClasesAsignadas")
.Produces(200);

// PUT /api/admin/profesores/{id}
group.MapPut("/profesores/{id}", [Authorize(Roles = "Administrador")] async (
    int id, ActualizarProfesorRequest request, DbService db) =>
{
    var param = new Dictionary<string, object?>
    {
        ["@Profesor_ID"] = id,
        ["@PrimerNombre"] = request.PrimerNombre,
        ["@SegundoNombre"] = request.SegundoNombre ?? (object)DBNull.Value,
        ["@PrimerApellido"] = request.PrimerApellido,
        ["@SegundoApellido"] = request.SegundoApellido ?? (object)DBNull.Value,
        ["@Correo"] = request.Correo,
        ["@Telefono"] = request.Telefono ?? (object)DBNull.Value,
        ["@CodigoProfesor"] = request.CodigoProfesor ?? (object)DBNull.Value,
        ["@Activo"] = request.Activo
    };
    var result = await db.EjecutarSpAsync("SP_ActualizarProfesorAdmin", param);
    if (result.Count == 0) return Results.BadRequest(new { error = "Error al actualizar" });
    return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
})
.WithName("ActualizarProfesorAdmin")
.Produces(200)
.Produces(400);
```

DTO:

```csharp
public record ActualizarProfesorRequest(
    string PrimerNombre, string? SegundoNombre,
    string PrimerApellido, string? SegundoApellido,
    string Correo, string? Telefono,
    string? CodigoProfesor, bool Activo
);
```

---

## 3. Tests PowerShell

Crear `tests/phase3/test-profesores-admin.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 3: Tests Profesores Admin ==="

# 1. Listar profesores
Write-Host "`n--- Listar Profesores ---"
$profesores = Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores" -Method GET -Headers $headers
Write-Host "Profesores: $($profesores.Count)"
$profesores | ForEach-Object { Write-Host "  $($_.CodigoProfesor) - $($_.PrimerNombre) $($_.PrimerApellido)" }

# 2. Obtener detalle
if ($profesores.Count -gt 0) {
    $id = $profesores[0].Profesor_ID
    Write-Host "`n--- Obtener Detalle (ID: $id) ---"
    $detalle = Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores/$id" -Method GET -Headers $headers
    Write-Host "Nombre: $($detalle.PrimerNombre) $($detalle.PrimerApellido)"
    Write-Host "Codigo: $($detalle.CodigoProfesor)"

    # 3. Clases asignadas
    Write-Host "`n--- Clases Asignadas ---"
    $clases = Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores/$id/clases" -Method GET -Headers $headers
    Write-Host "Clases: $($clases.Count)"
    $clases | ForEach-Object { Write-Host "  $($_.Materia) - $($_.Grado) $($_.Seccion) ($($_.Estudiantes) estudiantes)" }

    # 4. Actualizar
    Write-Host "`n--- Actualizar Profesor ---"
    $update = @{
        primerNombre = $detalle.PrimerNombre
        segundoNombre = $detalle.SegundoNombre
        primerApellido = $detalle.PrimerApellido
        segundoApellido = $detalle.SegundoApellido
        correo = $detalle.Correo
        telefono = $detalle.Telefono
        codigoProfesor = $detalle.CodigoProfesor
        activo = $detalle.Activo
    } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores/$id" -Method PUT -ContentType "application/json" -Headers $headers -Body $update
    Write-Host "Resultado: $($result | ConvertTo-Json -Compress)"
}

Write-Host "`n=== Fase 3: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Servicio — agregar a `admin.service.ts`

```typescript
obtenerProfesorPorId(id: number) {
  return this.http.get<any>(`${this.apiUrl}/api/admin/profesores/${id}`);
}

obtenerProfesorClases(id: number) {
  return this.http.get<any[]>(`${this.apiUrl}/api/admin/profesores/${id}/clases`);
}

actualizarProfesor(id: number, data: any) {
  return this.http.put<{ message: string }>(`${this.apiUrl}/api/admin/profesores/${id}`, data);
}
```

### 4.2 Componente — `AdminProfesoresComponent`

Patrón similar a `AdminEstudiantesComponent`:
- Tabla con columns: Código, Nombre, Correo, Teléfono, Estado, Acciones
- Modal de perfil: datos personales + tabla de clases asignadas
- Modal de edición
- Badge de estado

### 4.3 Ruta

Ya configurada en Fase 0: `/sistema/admin/profesores`

---

## 5. Tests Playwright

Crear `tests-e2e/tests/phase3-profesores-admin.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 3 - Admin Profesores', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Administrador').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.admin.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.admin.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await expect(page).toHaveURL(/\/sistema\/dashboard/);
  });

  test('navegar a profesores y ver tabla', async ({ page }) => {
    await page.getByRole('link', { name: 'Profesores' }).click();
    await expect(page).toHaveURL(/\/sistema\/admin\/profesores/);
    await expect(page.locator('table.data-table')).toBeVisible();
  });

  test('ver perfil de profesor con clases', async ({ page }) => {
    await page.getByRole('link', { name: 'Profesores' }).click();
    await page.waitForSelector('table.data-table tbody tr');
    await page.locator('table.data-table tbody tr').first().locator('button').first().click();
    await expect(page.locator('.modal')).toBeVisible();
    // Verificar que se muestran las clases
    await expect(page.getByText('Clases Asignadas')).toBeVisible();
  });

  test('buscar profesor', async ({ page }) => {
    await page.getByRole('link', { name: 'Profesores' }).click();
    await page.getByPlaceholder(/buscar/i).fill('Garcia');
    await page.getByPlaceholder(/buscar/i).press('Enter');
    await page.waitForTimeout(500);
    const rows = page.locator('table.data-table tbody tr');
    expect(await rows.count()).toBeGreaterThan(0);
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Detalle de profesor retorna datos completos | PowerShell muestra nombre, código, correo |
| 2 | Clases asignadas se listan correctamente | PowerShell muestra materias y grados |
| 3 | Actualización funciona | PowerShell actualiza y verifica |
| 4 | Tabla muestra datos reales | Browser muestra profesores |
| 5 | Perfil muestra clases | Playwright abre perfil y verifica clases |
| 6 | Búsqueda funciona | Playwright busca y verifica resultados |
