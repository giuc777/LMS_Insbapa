# Fase 5: Admin — Tokens de Registro

**Objetivo:** Generar, listar y desactivar tokens de registro para auto-inscripción de estudiantes.

---

## 1. Stored Procedures

Los SPs ya existen en `02-stored-procedures.sql`:
- `SP_GenerarTokenRegistro`
- `SP_ListarTokensRegistro`
- `SP_ValidarTokenRegistro`

### 1.1 SP_DesactivarToken

```sql
CREATE PROCEDURE SP_DesactivarToken
    @Token_ID INT
AS
BEGIN
    UPDATE TOKENS_REGISTRO SET Activo = 0 WHERE Token_ID = @Token_ID;
    SELECT 1 AS Resultado, 'Token desactivado' AS Mensaje;
END;
```

---

## 2. Endpoints (.NET)

Crear `Endpoints/AdminTokensEndpoints.cs`:

```csharp
using Microsoft.AspNetCore.Authorization;

namespace API_LMS.Endpoints;

public static class AdminTokensEndpoints
{
    public static void MapAdminTokensEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin/tokens")
            .RequireAuthorization()
            .WithTags("Admin");

        group.MapGet("/", [Authorize(Roles = "Administrador")] async (DbService db) =>
        {
            var result = await db.EjecutarSpAsync("SP_ListarTokensRegistro");
            return Results.Ok(result);
        })
        .WithName("ListarTokens")
        .Produces(200);

        group.MapPost("/", [Authorize(Roles = "Administrador")] async (
            CrearTokenRequest request, ClaimsPrincipal user, DbService db) =>
        {
            var autorId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?>
            {
                ["@Descripcion"] = request.Descripcion,
                ["@MaximoUsos"] = request.MaximoUsos,
                ["@MinutosValidez"] = request.MinutosValidez,
                ["@CreadoPor"] = autorId
            };
            var result = await db.EjecutarSpAsync("SP_GenerarTokenRegistro", param);
            return Results.Ok(new { token = result[0]["Codigo"]?.ToString(), message = "Token generado" });
        })
        .WithName("CrearToken")
        .Produces(200);

        group.MapPut("/{id}/desactivar", [Authorize(Roles = "Administrador")] async (
            int id, DbService db) =>
        {
            var param = new Dictionary<string, object?> { ["@Token_ID"] = id };
            var result = await db.EjecutarSpAsync("SP_DesactivarToken", param);
            return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
        })
        .WithName("DesactivarToken")
        .Produces(200);
    }
}

public record CrearTokenRequest(
    string Descripcion, int MaximoUsos, int MinutosValidez
);
```

Registrar en `Program.cs`:

```csharp
app.MapAdminTokensEndpoints();
```

---

## 3. Tests PowerShell

Crear `tests/phase5/test-tokens.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 5: Tests Tokens ==="

# 1. Listar tokens
Write-Host "`n--- Listar Tokens ---"
$tokens = Invoke-RestMethod -Uri "$BaseUrl/api/admin/tokens" -Method GET -Headers $headers
Write-Host "Tokens: $($tokens.Count)"
$tokens | ForEach-Object { Write-Host "  $($_.Codigo) - Usos: $($_.UsosActuales)/$($_.MaximoUsos) - Estado: $($_.Estado)" }

# 2. Generar token
Write-Host "`n--- Generar Token ---"
$nuevoToken = @{
    descripcion = "Token de prueba Fase 5"
    maximoUsos = 10
    minutosValidez = 60
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$BaseUrl/api/admin/tokens" -Method POST -ContentType "application/json" -Headers $headers -Body $nuevoToken
Write-Host "Token generado: $($result.token)"
Write-Host "Mensaje: $($result.message)"

# 3. Verificar que aparece en la lista
Write-Host "`n--- Verificar Token Creado ---"
$tokensActualizados = Invoke-RestMethod -Uri "$BaseUrl/api/admin/tokens" -Method GET -Headers $headers
$nuevo = $tokensActualizados | Where-Object { $_.Codigo -eq $result.token }
if ($nuevo) { Write-Host "OK: Token encontrado en lista" } else { Write-Host "FAIL: Token no encontrado" }

# 4. Desactivar token
if ($nuevo) {
    Write-Host "`n--- Desactivar Token ---"
    $tokenId = $nuevo.Token_ID
    $desactivar = Invoke-RestMethod -Uri "$BaseUrl/api/admin/tokens/$tokenId/desactivar" -Method PUT -Headers $headers
    Write-Host "Resultado: $($desactivar | ConvertTo-Json -Compress)"

    # Verificar desactivación
    $tokensFinales = Invoke-RestMethod -Uri "$BaseUrl/api/admin/tokens" -Method GET -Headers $headers
    $desactivado = $tokensFinales | Where-Object { $_.Token_ID -eq $tokenId }
    Write-Host "Estado después de desactivar: $($desactivado.Estado)"
}

Write-Host "`n=== Fase 5: Tests completados ==="
```

---

## 4. Front-end Angular

### 4.1 Servicio — `tokens.service.ts` (nuevo)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TokensService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listarTokens() {
    return this.http.get<any[]>(`${this.apiUrl}/api/admin/tokens`);
  }

  generarToken(data: any) {
    return this.http.post<any>(`${this.apiUrl}/api/admin/tokens`, data);
  }

  desactivarToken(id: number) {
    return this.http.put<any>(`${this.apiUrl}/api/admin/tokens/${id}/desactivar`, {});
  }
}
```

### 4.2 Componente — `AdminTokensComponent`

- Stats cards: Tokens Activos, Total Generados, Usos Disponibles
- Tabla: Código (monospace), Descripción, Rol, Usos, Expiración, Estado (badge), Acciones
- Modal generar: Descripción, Máximo Usos, Duración (minutos)
- Desactivar con confirmación

### 4.3 Ruta

Ya configurada en Fase 0: `/sistema/admin/tokens`

---

## 5. Tests Playwright

Crear `tests-e2e/tests/phase5-tokens.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 5 - Admin Tokens', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Administrador').click();
    await page.getByPlaceholder('Usuario').fill(testCredentials.admin.username);
    await page.getByPlaceholder('Contraseña').fill(testCredentials.admin.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
  });

  test('navegar a tokens', async ({ page }) => {
    await page.getByRole('link', { name: 'Tokens' }).click();
    await expect(page).toHaveURL(/\/sistema\/admin\/tokens/);
    await expect(page.getByText('Tokens de Registro')).toBeVisible();
  });

  test('generar nuevo token', async ({ page }) => {
    await page.getByRole('link', { name: 'Tokens' }).click();
    await page.getByRole('button', { name: /generar/i }).click();
    await expect(page.locator('.modal')).toBeVisible();

    await page.locator('.modal input').first().fill('Token Playwright');
    await page.locator('.modal input').nth(1).fill('5');
    await page.locator('.modal input').nth(2).fill('60');

    await page.getByRole('button', { name: /generar/i }).last().click();
    await expect(page.locator('.alert-success')).toBeVisible({ timeout: 5000 });
  });

  test('desactivar token', async ({ page }) => {
    await page.getByRole('link', { name: 'Tokens' }).click();
    await page.waitForSelector('table.data-table tbody tr');
    // Click en primer botón de desactivar
    await page.locator('table.data-table tbody tr').first().locator('button').last().click();
    // Confirmar
    await page.getByRole('button', { name: /confirmar/i }).click();
    await expect(page.locator('.alert-success')).toBeVisible({ timeout: 5000 });
  });

});
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Tokens se generan correctamente | PowerShell genera token y muestra código |
| 2 | Tokens aparecen en la lista | PowerShell verifica token creado |
| 3 | Desactivación funciona | PowerShell desactivar y verifica estado |
| 4 | UI muestra stats y tabla | Playwright verifica navegación |
| 5 | Generar token funciona en UI | Playwright genera token end-to-end |
| 6 | Desactivar funciona en UI | Playwright desactiva token |
