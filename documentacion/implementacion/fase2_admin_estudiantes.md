# Fase 2: Admin — Estudiantes (Página Dedicada)

**Objetivo:** Página completa de gestión de estudiantes con paginación, perfil detalle, edición y estado.

---

## 1. Stored Procedures

### 1.1 SP_ObtenerEstudiantePorId

```sql
CREATE PROCEDURE SP_ObtenerEstudiantePorId
    @Estudiante_ID INT
AS
BEGIN
    SELECT
        e.Estudiante_ID,
        e.Carnet,
        p.PrimerNombre, p.SegundoNombre, p.PrimerApellido, p.SegundoApellido,
        p.Correo, p.Telefono, p.FechaNacimiento,
        g.Grado_ID, g.Nombre AS Grado,
        s.Seccion_ID, s.Nombre AS Seccion,
        u.Username, u.Activo,
        u.Usuario_ID,
        (SELECT COUNT(*) FROM NOTAS n WHERE n.Estudiante_ID = e.Estudiante_ID) AS CursosConNotas
    FROM ESTUDIANTES e
    INNER JOIN PERSONAS p ON e.Persona_ID = p.Persona_ID
    INNER JOIN USUARIOS u ON e.Usuario_ID = u.Usuario_ID
    INNER JOIN GRADOS g ON e.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON e.Seccion_ID = s.Seccion_ID
    WHERE e.Estudiante_ID = @Estudiante_ID;
END;
```

### 1.2 SP_ActualizarEstudianteAdmin

```sql
CREATE PROCEDURE SP_ActualizarEstudianteAdmin
    @Estudiante_ID INT,
    @PrimerNombre NVARCHAR(50),
    @SegundoNombre NVARCHAR(50),
    @PrimerApellido NVARCHAR(50),
    @SegundoApellido NVARCHAR(50),
    @Correo NVARCHAR(100),
    @Telefono NVARCHAR(20),
    @Grado_ID INT,
    @Seccion_ID INT,
    @Activo BIT
AS
BEGIN
    DECLARE @Persona_ID INT, @Usuario_ID INT;
    SELECT @Persona_ID = Persona_ID, @Usuario_ID = Usuario_ID FROM ESTUDIANTES WHERE Estudiante_ID = @Estudiante_ID;

    UPDATE PERSONAS SET PrimerNombre = @PrimerNombre, SegundoNombre = @SegundoNombre,
        PrimerApellido = @PrimerApellido, SegundoApellido = @SegundoApellido,
        Correo = @Correo, Telefono = @Telefono
    WHERE Persona_ID = @Persona_ID;

    UPDATE USUARIOS SET Activo = @Activo WHERE Usuario_ID = @Usuario_ID;

    UPDATE ESTUDIANTES SET Grado_ID = @Grado_ID, Seccion_ID = @Seccion_ID WHERE Estudiante_ID = @Estudiante_ID;

    SELECT 1 AS Resultado, 'Estudiante actualizado correctamente' AS Mensaje;
END;
```

### 1.3 SP_EstudianteCursosInscritos

```sql
CREATE PROCEDURE SP_EstudianteCursosInscritos
    @Estudiante_ID INT
AS
BEGIN
    SELECT
        c.Nombre AS Materia,
        c.Codigo,
        g.Nombre AS Grado,
        s.Nombre AS Seccion,
        p.PrimerNombre + ' ' + p.PrimerApellido AS Profesor,
        ISNULL(n.Promedio, 0) AS Promedio,
        CASE WHEN n.Estado = 'Aprobado' THEN 1 ELSE 0 END AS Aprobado
    FROM PROFESORES_CURSOS pc
    INNER JOIN CURSOS c ON pc.Curso_ID = c.Curso_ID
    INNER JOIN GRADOS g ON pc.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON pc.Seccion_ID = s.Seccion_ID
    INNER JOIN PROFESORES pr ON pc.Profesor_ID = pr.Profesor_ID
    INNER JOIN PERSONAS p ON pr.Persona_ID = p.Persona_ID
    INNER JOIN ESTUDIANTES e ON e.Grado_ID = g.Grado_ID AND e.Seccion_ID = s.Seccion_ID
    LEFT JOIN NOTAS n ON n.Estudiante_ID = e.Estudiante_ID AND n.Curso_ID = c.Curso_ID AND n.Bloque = 1
    WHERE e.Estudiante_ID = @Estudiante_ID
    ORDER BY c.Nombre;
END;
```

### 1.4 SP_ListarEstudiantesPaginado

```sql
CREATE PROCEDURE SP_ListarEstudiantesPaginado
    @Busqueda NVARCHAR(100) = NULL,
    @Grado_ID INT = NULL,
    @Seccion_ID INT = NULL,
    @Pagina INT = 1,
    @TamanioPagina INT = 10
AS
BEGIN
    DECLARE @Offset INT = (@Pagina - 1) * @TamanioPagina;

    SELECT
        e.Estudiante_ID, e.Carnet,
        p.PrimerNombre, p.SegundoNombre, p.PrimerApellido, p.SegundoApellido,
        p.Correo,
        g.Nombre AS Grado, s.Nombre AS Seccion,
        u.Activo
    FROM ESTUDIANTES e
    INNER JOIN PERSONAS p ON e.Persona_ID = p.Persona_ID
    INNER JOIN USUARIOS u ON e.Usuario_ID = u.Usuario_ID
    INNER JOIN GRADOS g ON e.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON e.Seccion_ID = s.Seccion_ID
    WHERE (@Busqueda IS NULL OR p.PrimerNombre LIKE '%' + @Busqueda + '%' OR p.PrimerApellido LIKE '%' + @Busqueda + '%' OR e.Carnet LIKE '%' + @Busqueda + '%')
        AND (@Grado_ID IS NULL OR e.Grado_ID = @Grado_ID)
        AND (@Seccion_ID IS NULL OR e.Seccion_ID = @Seccion_ID)
    ORDER BY p.PrimerApellido, p.PrimerNombre
    OFFSET @Offset ROWS FETCH NEXT @TamanioPagina ROWS ONLY;

    -- Contar total
    SELECT COUNT(*) AS Total
    FROM ESTUDIANTES e
    INNER JOIN PERSONAS p ON e.Persona_ID = p.Persona_ID
    INNER JOIN GRADOS g ON e.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON e.Seccion_ID = s.Seccion_ID
    WHERE (@Busqueda IS NULL OR p.PrimerNombre LIKE '%' + @Busqueda + '%' OR p.PrimerApellido LIKE '%' + @Busqueda + '%' OR e.Carnet LIKE '%' + @Busqueda + '%')
        AND (@Grado_ID IS NULL OR e.Grado_ID = @Grado_ID)
        AND (@Seccion_ID IS NULL OR e.Seccion_ID = @Seccion_ID);
END;
```

---

## 2. Endpoints (.NET)

### 2.1 Agregar a `AdminUsuariosEndpoints.cs`

```csharp
// Agregar estos endpoints al group existente de /api/admin/estudiantes

group.MapGet("/{id}", [Authorize(Roles = "Administrador")] async (int id, DbService db) =>
{
    var param = new Dictionary<string, object?> { ["@Estudiante_ID"] = id };
    var result = await db.EjecutarSpAsync("SP_ObtenerEstudiantePorId", param);
    if (result.Count == 0) return Results.NotFound(new { error = "Estudiante no encontrado" });
    return Results.Ok(result[0]);
})
.WithName("ObtenerEstudiantePorId")
.Produces(200)
.Produces(404);

group.MapGet("/{id}/cursos", [Authorize(Roles = "Administrador")] async (int id, DbService db) =>
{
    var param = new Dictionary<string, object?> { ["@Estudiante_ID"] = id };
    var result = await db.EjecutarSpAsync("SP_EstudianteCursosInscritos", param);
    return Results.Ok(result);
})
.WithName("EstudianteCursosInscritos")
.Produces(200);

group.MapPut("/{id}", [Authorize(Roles = "Administrador")] async (
    int id, ActualizarEstudianteRequest request, DbService db) =>
{
    var param = new Dictionary<string, object?>
    {
        ["@Estudiante_ID"] = id,
        ["@PrimerNombre"] = request.PrimerNombre,
        ["@SegundoNombre"] = request.SegundoNombre ?? (object)DBNull.Value,
        ["@PrimerApellido"] = request.PrimerApellido,
        ["@SegundoApellido"] = request.SegundoApellido ?? (object)DBNull.Value,
        ["@Correo"] = request.Correo,
        ["@Telefono"] = request.Telefono ?? (object)DBNull.Value,
        ["@Grado_ID"] = request.GradoId,
        ["@Seccion_ID"] = request.SeccionId,
        ["@Activo"] = request.Activo
    };
    var result = await db.EjecutarSpAsync("SP_ActualizarEstudianteAdmin", param);
    if (result.Count == 0) return Results.BadRequest(new { error = "Error al actualizar" });
    return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
})
.WithName("ActualizarEstudianteAdmin")
.Produces(200)
.Produces(400);

// Endpoint paginado (reemplaza el GET / existente)
group.MapGet("/", [Authorize(Roles = "Administrador")] async (
    string? busqueda, int? gradoId, int? seccionId, int? pagina, int? tamanioPagina, DbService db) =>
{
    var param = new Dictionary<string, object?>();
    if (!string.IsNullOrEmpty(busqueda)) param["@Busqueda"] = busqueda;
    if (gradoId.HasValue) param["@Grado_ID"] = gradoId;
    if (seccionId.HasValue) param["@Seccion_ID"] = seccionId;
    param["@Pagina"] = pagina ?? 1;
    param["@TamanioPagina"] = tamanioPagina ?? 10;
    var result = await db.EjecutarSpAsync("SP_ListarEstudiantesPaginado", param);
    return Results.Ok(result);
})
.WithName("ListarEstudiantesPaginado")
.Produces(200);
```

### 2.2 DTO al final del archivo

```csharp
public record ActualizarEstudianteRequest(
    string PrimerNombre, string? SegundoNombre,
    string PrimerApellido, string? SegundoApellido,
    string Correo, string? Telefono,
    int GradoId, int SeccionId, bool Activo
);
```

---

## 3. Tests PowerShell

Crear `tests/phase2/test-estudiantes-admin.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 2: Tests Estudiantes Admin ==="

# 1. Listar estudiantes (primera página)
Write-Host "`n--- Listar Estudiantes (Página 1) ---"
$estudiantes = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes?pagina=1&tamanioPagina=10" -Method GET -Headers $headers
Write-Host "Resultados: $($estudiantes.Count)"
$estudiantes | ForEach-Object { Write-Host "  $($_.Carnet) - $($_.PrimerNombre) $($_.PrimerApellido) ($($_.Grado) $($_.Seccion))" }

# 2. Buscar por nombre
Write-Host "`n--- Buscar por Nombre ---"
$busqueda = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes?busqueda=Maria" -Method GET -Headers $headers
Write-Host "Encontrados: $($busqueda.Count)"

# 3. Filtrar por grado
Write-Host "`n--- Filtrar por Grado ---"
$filtro = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes?gradoId=1" -Method GET -Headers $headers
Write-Host "Encontrados en Grado 1: $($filtro.Count)"

# 4. Obtener detalle de estudiante
if ($estudiantes.Count -gt 0) {
    $id = $estudiantes[0].Estudiante_ID
    Write-Host "`n--- Obtener Detalle (ID: $id) ---"
    $detalle = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes/$id" -Method GET -Headers $headers
    Write-Host "Nombre: $($detalle.PrimerNombre) $($detalle.PrimerApellido)"
    Write-Host "Carnet: $($detalle.Carnet)"
    Write-Host "Grado: $($detalle.Grado) $($detalle.Seccion)"
    Write-Host "Activo: $($detalle.Activo)"

    # 5. Obtener cursos inscritos
    Write-Host "`n--- Cursos Inscritos ---"
    $cursos = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes/$id/cursos" -Method GET -Headers $headers
    Write-Host "Cursos: $($cursos.Count)"
    $cursos | ForEach-Object { Write-Host "  $($_.Materia) - Promedio: $($_.Promedio)" }

    # 6. Actualizar estudiante
    Write-Host "`n--- Actualizar Estudiante ---"
    $update = @{
        primerNombre = $detalle.PrimerNombre
        segundoNombre = $detalle.SegundoNombre
        primerApellido = $detalle.PrimerApellido
        segundoApellido = $detalle.SegundoApellido
        correo = $detalle.Correo
        telefono = $detalle.Telefono
        gradoId = $detalle.Grado_ID
        seccionId = $detalle.Seccion_ID
        activo = $detalle.Activo
    } | ConvertTo-Json
    $updateResult = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes/$id" -Method PUT -ContentType "application/json" -Headers $headers -Body $update
    Write-Host "Resultado: $($updateResult | ConvertTo-Json -Compress)"
}

# 7. Test sin token
Write-Host "`n--- Test Sin Token ---"
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes" -Method GET
    Write-Host "FAIL: 401 esperado"
} catch {
    Write-Host "OK: 401 retornado"
}

Write-Host "`n=== Fase 2: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Servicio — agregar a `admin.service.ts`

```typescript
obtenerEstudiantePorId(id: number) {
  return this.http.get<any>(`${this.apiUrl}/api/admin/estudiantes/${id}`);
}

obtenerEstudianteCursos(id: number) {
  return this.http.get<any[]>(`${this.apiUrl}/api/admin/estudiantes/${id}/cursos`);
}

actualizarEstudiante(id: number, data: any) {
  return this.http.put<{ message: string }>(`${this.apiUrl}/api/admin/estudiantes/${id}`, data);
}
```

### 4.2 Componente — `AdminEstudiantesComponent`

Reemplazar el placeholder creado en Fase 0. Patrón similar a `AdminCursosComponent` pero con:
- Tabla paginada con botones Anterior/Siguiente
- Filtros grado/sección
- Modal de perfil con avatar (iniciales), carnet, estado, cursos inscritos
- Modal de edición con todos los campos
- Badge de estado (Activo/Inactivo)

### 4.3 Ruta

Ya configurada en Fase 0: `/sistema/admin/estudiantes`

---

## 5. Tests Playwright

Crear `tests-e2e/tests/phase2-estudiantes-admin.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 2 - Admin Estudiantes', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Administrador').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.admin.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.admin.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await expect(page).toHaveURL(/\/sistema\/dashboard/);
  });

  test('navegar a estudiantes y ver tabla', async ({ page }) => {
    await page.getByRole('link', { name: 'Estudiantes' }).click();
    await expect(page).toHaveURL(/\/sistema\/admin\/estudiantes/);
    await expect(page.locator('table.data-table')).toBeVisible();
  });

  test('buscar estudiante por nombre', async ({ page }) => {
    await page.getByRole('link', { name: 'Estudiantes' }).click();
    await page.getByPlaceholder(/buscar/i).fill('Maria');
    await page.getByPlaceholder(/buscar/i).press('Enter');
    await page.waitForTimeout(500);
    await expect(page.locator('table.data-table tbody tr')).toHaveCount(1);
  });

  test('ver perfil de estudiante', async ({ page }) => {
    await page.getByRole('link', { name: 'Estudiantes' }).click();
    await page.waitForSelector('table.data-table tbody tr');
    await page.locator('table.data-table tbody tr').first().locator('button').first().click();
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.getByText('Detalle del Estudiante')).toBeVisible();
  });

  test('abrir modal de edición', async ({ page }) => {
    await page.getByRole('link', { name: 'Estudiantes' }).click();
    await page.waitForSelector('table.data-table tbody tr');
    // Click en segundo botón (editar)
    await page.locator('table.data-table tbody tr').first().locator('button').nth(1).click();
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.getByText('Editar Estudiante')).toBeVisible();
    // Verificar que los campos están poblados
    await expect(page.locator('.modal input').first()).not.toBeEmpty();
  });

  test('registrar nuevo estudiante', async ({ page }) => {
    await page.getByRole('link', { name: 'Estudiantes' }).click();
    await page.getByRole('button', { name: /registrar/i }).click();
    await expect(page.locator('.modal')).toBeVisible();

    // Llenar formulario
    await page.locator('.modal input').nth(0).fill('Juan');
    await page.locator('.modal input').nth(2).fill('Pérez');
    await page.locator('.modal input').nth(3).fill('juan@test.com');
    await page.locator('.modal input').nth(5).fill('juan.perez');
    await page.locator('.modal input').nth(6).fill('password123');
    await page.locator('.modal select').nth(0).selectOption({ index: 1 });
    await page.locator('.modal select').nth(1).selectOption({ index: 1 });

    await page.getByRole('button', { name: /registrar/i }).last().click();
    await expect(page.locator('.alert-success')).toBeVisible({ timeout: 5000 });
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | SPs de paginación funcionan | PowerShell muestra pagina=1 con 10 resultados |
| 2 | Detalle de estudiante retorna datos completos | PowerShell muestra carnet, grado, sección, cursos |
| 3 | Actualización funciona | PowerShell actualiza y verifica el cambio |
| 4 | Tabla muestra datos reales | Browser muestra estudiantes con paginación |
| 5 | Modal de perfil muestra cursos inscritos | Playwright abre perfil y verifica cursos |
| 6 | Registro funciona end-to-end | Playwright registra estudiante y aparece en la tabla |
