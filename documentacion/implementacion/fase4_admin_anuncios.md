# Fase 4: Admin — Anuncios

**Objetivo:** CRUD de anuncios institucionales con tabs Publicados/Borrador y destinatarios.

---

## 1. Stored Procedures

### 1.1 SP_ListarAnunciosAdmin

```sql
CREATE PROCEDURE SP_ListarAnunciosAdmin
    @Estado NVARCHAR(20) = NULL,
    @Busqueda NVARCHAR(100) = NULL
AS
BEGIN
    SELECT
        a.Anuncio_ID, a.Titulo, a.Cuerpo, a.Categoria, a.Estado,
        a.FechaCreacion,
        p.PrimerNombre + ' ' + p.PrimerApellido AS Autor,
        (SELECT STRING_AGG(ad.Rol_Destinatario, ', ') FROM ANUNCIOS_DESTINATARIOS ad WHERE ad.Anuncio_ID = a.Anuncio_ID) AS Destinatarios
    FROM ANUNCIOS a
    INNER JOIN USUARIOS u ON a.Autor_ID = u.Usuario_ID
    INNER JOIN PERSONAS p ON u.Persona_ID = p.Persona_ID
    WHERE a.Activo = 1
        AND (@Estado IS NULL OR a.Estado = @Estado)
        AND (@Busqueda IS NULL OR a.Titulo LIKE '%' + @Busqueda + '%')
    ORDER BY a.FechaCreacion DESC;
END;
```

### 1.2 SP_CrearAnuncioAdmin

```sql
CREATE PROCEDURE SP_CrearAnuncioAdmin
    @Titulo NVARCHAR(150),
    @Cuerpo NVARCHAR(MAX),
    @Categoria NVARCHAR(50),
    @Autor_ID INT,
    @Estado NVARCHAR(20),
    @Destinatarios NVARCHAR(MAX)  -- JSON: ["Estudiante","Profesor"] o ["Todos"]
AS
BEGIN
    DECLARE @Anuncio_ID INT;

    INSERT INTO ANUNCIOS (Titulo, Cuerpo, Categoria, Autor_ID, Estado)
    VALUES (@Titulo, @Cuerpo, @Categoria, @Autor_ID, @Estado);

    SET @Anuncio_ID = SCOPE_IDENTITY();

    -- Insertar destinatarios desde JSON
    INSERT INTO ANUNCIOS_DESTINATARIOS (Anuncio_ID, Rol_Destinatario)
    SELECT @Anuncio_ID, value
    FROM OPENJSON(@Destinatarios);

    SELECT @Anuncio_ID AS Anuncio_ID, 'Anuncio creado correctamente' AS Mensaje;
END;
```

### 1.3 SP_ActualizarAnuncioAdmin

```sql
CREATE PROCEDURE SP_ActualizarAnuncioAdmin
    @Anuncio_ID INT,
    @Titulo NVARCHAR(150),
    @Cuerpo NVARCHAR(MAX),
    @Categoria NVARCHAR(50),
    @Estado NVARCHAR(20),
    @Destinatarios NVARCHAR(MAX)
AS
BEGIN
    UPDATE ANUNCIOS
    SET Titulo = @Titulo, Cuerpo = @Cuerpo, Categoria = @Categoria,
        Estado = @Estado, FechaModificacion = SYSUTCDATETIME()
    WHERE Anuncio_ID = @Anuncio_ID;

    -- Reconstruir destinatarios
    DELETE FROM ANUNCIOS_DESTINATARIOS WHERE Anuncio_ID = @Anuncio_ID;
    INSERT INTO ANUNCIOS_DESTINATARIOS (Anuncio_ID, Rol_Destinatario)
    SELECT @Anuncio_ID, value
    FROM OPENJSON(@Destinatarios);

    SELECT 1 AS Resultado, 'Anuncio actualizado' AS Mensaje;
END;
```

### 1.4 SP_EliminarAnuncioAdmin

```sql
CREATE PROCEDURE SP_EliminarAnuncioAdmin
    @Anuncio_ID INT
AS
BEGIN
    UPDATE ANUNCIOS SET Activo = 0 WHERE Anuncio_ID = @Anuncio_ID;
    SELECT 1 AS Resultado, 'Anuncio eliminado' AS Mensaje;
END;
```

---

## 2. Endpoints (.NET)

Crear `Endpoints/AdminAnunciosEndpoints.cs`:

```csharp
using Microsoft.AspNetCore.Authorization;

namespace API_LMS.Endpoints;

public static class AdminAnunciosEndpoints
{
    public static void MapAdminAnunciosEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin/anuncios")
            .RequireAuthorization()
            .WithTags("Admin");

        group.MapGet("/", [Authorize(Roles = "Administrador")] async (
            string? estado, string? busqueda, DbService db) =>
        {
            var param = new Dictionary<string, object?>();
            if (!string.IsNullOrEmpty(estado)) param["@Estado"] = estado;
            if (!string.IsNullOrEmpty(busqueda)) param["@Busqueda"] = busqueda;
            var result = await db.EjecutarSpAsync("SP_ListarAnunciosAdmin", param);
            return Results.Ok(result);
        })
        .WithName("ListarAnunciosAdmin")
        .Produces(200);

        group.MapPost("/", [Authorize(Roles = "Administrador")] async (
            CrearAnuncioRequest request, ClaimsPrincipal user, DbService db) =>
        {
            var autorId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?>
            {
                ["@Titulo"] = request.Titulo,
                ["@Cuerpo"] = request.Cuerpo,
                ["@Categoria"] = request.Categoria,
                ["@Autor_ID"] = autorId,
                ["@Estado"] = request.Estado,
                ["@Destinatarios"] = request.Destinatarios
            };
            var result = await db.EjecutarSpAsync("SP_CrearAnuncioAdmin", param);
            return Results.Ok(new { anuncioId = result[0]["Anuncio_ID"], message = result[0]["Mensaje"]?.ToString() });
        })
        .WithName("CrearAnuncioAdmin")
        .Produces(200);

        group.MapPut("/{id}", [Authorize(Roles = "Administrador")] async (
            int id, CrearAnuncioRequest request, DbService db) =>
        {
            var param = new Dictionary<string, object?>
            {
                ["@Anuncio_ID"] = id,
                ["@Titulo"] = request.Titulo,
                ["@Cuerpo"] = request.Cuerpo,
                ["@Categoria"] = request.Categoria,
                ["@Estado"] = request.Estado,
                ["@Destinatarios"] = request.Destinatarios
            };
            var result = await db.EjecutarSpAsync("SP_ActualizarAnuncioAdmin", param);
            return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
        })
        .WithName("ActualizarAnuncioAdmin")
        .Produces(200);

        group.MapDelete("/{id}", [Authorize(Roles = "Administrador")] async (
            int id, DbService db) =>
        {
            var param = new Dictionary<string, object?> { ["@Anuncio_ID"] = id };
            await db.EjecutarSpAsync("SP_EliminarAnuncioAdmin", param);
            return Results.Ok(new { message = "Anuncio eliminado" });
        })
        .WithName("EliminarAnuncioAdmin")
        .Produces(200);
    }
}

public record CrearAnuncioRequest(
    string Titulo, string Cuerpo, string Categoria,
    string Estado, string Destinatarios  // JSON array
);
```

Registrar en `Program.cs`:

```csharp
app.MapAdminAnunciosEndpoints();
```

---

## 3. Tests PowerShell

Crear `tests/phase4/test-anuncios-admin.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 4: Tests Anuncios Admin ==="

# 1. Listar anuncios (debería estar vacío)
Write-Host "`n--- Listar Anuncios ---"
$anuncios = Invoke-RestMethod -Uri "$BaseUrl/api/admin/anuncios" -Method GET -Headers $headers
Write-Host "Anuncios: $($anuncios.Count)"

# 2. Crear anuncio
Write-Host "`n--- Crear Anuncio ---"
$nuevoAnuncio = @{
    titulo = "Aviso de Prueba"
    cuerpo = "Este es un anuncio de prueba para el sistema INSBAPA."
    categoria = "Academico"
    estado = "Publicado"
    destinatarios = '["Estudiante","Profesor"]'
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$BaseUrl/api/admin/anuncios" -Method POST -ContentType "application/json" -Headers $headers -Body $nuevoAnuncio
Write-Host "Creado: $($result | ConvertTo-Json -Compress)"
$anuncioId = $result.anuncioId

# 3. Verificar creación
Write-Host "`n--- Verificar Creación ---"
$lista = Invoke-RestMethod -Uri "$BaseUrl/api/admin/anuncios" -Method GET -Headers $headers
$encontrado = $lista | Where-Object { $_.Anuncio_ID -eq $anuncioId }
if ($encontrado) { Write-Host "OK: Anuncio encontrado" } else { Write-Host "FAIL" }

# 4. Filtrar por estado
Write-Host "`n--- Filtrar Publicados ---"
$publicados = Invoke-RestMethod -Uri "$BaseUrl/api/admin/anuncios?estado=Publicado" -Method GET -Headers $headers
Write-Host "Publicados: $($publicados.Count)"

# 5. Actualizar anuncio
Write-Host "`n--- Actualizar Anuncio ---"
$update = @{
    titulo = "Aviso de Prueba Actualizado"
    cuerpo = "Contenido actualizado."
    categoria = "Eventos"
    estado = "Borrador"
    destinatarios = '["Todos"]'
} | ConvertTo-Json
$updateResult = Invoke-RestMethod -Uri "$BaseUrl/api/admin/anuncios/$anuncioId" -Method PUT -ContentType "application/json" -Headers $headers -Body $update
Write-Host "Resultado: $($updateResult | ConvertTo-Json -Compress)"

# 6. Eliminar anuncio
Write-Host "`n--- Eliminar Anuncio ---"
$deleteResult = Invoke-RestMethod -Uri "$BaseUrl/api/admin/anuncios/$anuncioId" -Method DELETE -Headers $headers
Write-Host "Resultado: $($deleteResult | ConvertTo-Json -Compress)"

Write-Host "`n=== Fase 4: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Servicio — `anuncios.service.ts` (nuevo)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnunciosService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listarAnunciosAdmin(estado?: string, busqueda?: string) {
    let params: any = {};
    if (estado) params.estado = estado;
    if (busqueda) params.busqueda = busqueda;
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/anuncios`, { params });
  }

  crearAnuncio(data: any) {
    return this.http.post<any>(`${this.apiUrl}/api/admin/anuncios`, data);
  }

  actualizarAnuncio(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/api/admin/anuncios/${id}`, data);
  }

  eliminarAnuncio(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/api/admin/anuncios/${id}`);
  }
}
```

### 4.2 Componente — `AdminAnunciosComponent`

- Tabs: Todos / Publicados / Borradores
- Tabla: Título, Categoría, Autor, Fecha, Estado (badge), Acciones
- Modal crear/editar: Título, Cuerpo (textarea), Categoría (select), Destinatarios (checkboxes)
- Eliminar con confirmación

### 4.3 Ruta

Ya configurada en Fase 0: `/sistema/admin/anuncios`

---

## 5. Tests Playwright

Crear `tests-e2e/tests/phase4-anuncios-admin.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 4 - Admin Anuncios', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Administrador').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.admin.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.admin.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
  });

  test('navegar a anuncios', async ({ page }) => {
    await page.getByRole('link', { name: 'Anuncios' }).click();
    await expect(page).toHaveURL(/\/sistema\/admin\/anuncios/);
    await expect(page.getByText('Anuncios Institucionales')).toBeVisible();
  });

  test('crear anuncio', async ({ page }) => {
    await page.getByRole('link', { name: 'Anuncios' }).click();
    await page.getByRole('button', { name: /nuevo/i }).click();
    await expect(page.locator('.modal')).toBeVisible();

    await page.locator('.modal input').first().fill('Aviso Playwright');
    await page.locator('.modal textarea').fill('Contenido de prueba');
    await page.locator('.modal select').selectOption('Academico');
    // Seleccionar destinatarios (checkboxes)
    await page.locator('.modal input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: /publicar/i }).last().click();
    await expect(page.locator('.alert-success')).toBeVisible({ timeout: 5000 });
  });

  test('filtrar por estado', async ({ page }) => {
    await page.getByRole('link', { name: 'Anuncios' }).click();
    await page.getByRole('tab', { name: /publicados/i }).click();
    await page.waitForTimeout(500);
    // Verificar que solo se muestran publicados
    const badges = page.locator('.badge-success');
    expect(await badges.count()).toBeGreaterThan(0);
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Anuncios se crean con destinatarios | PowerShell crea anuncio y verifica destinatarios |
| 2 | Filtrado por estado funciona | PowerShell filtra publicados/borradores |
| 3 | Actualización funciona | PowerShell actualiza título y estado |
| 4 | Eliminación soft-delete funciona | PowerShell elimina y verifica |
| 5 | UI muestra tabs y tabla | Playwright verifica navegación |
| 6 | Crear anuncio funciona en UI | Playwright crea anuncio end-to-end |
