# Fase 11: Exámenes (Todos los Roles)

**Objetivo:** Módulo de exámenes completo: creación, edición de preguntas, aplicación a estudiantes, scoring y resultados.

**Nota:** Este es el módulo más complejo del sistema. Se divide en 6 sub-fases.

---

## Sub-fase 11.1: Estructura DB

### SPs

#### SP_ProfesorExamenes

```sql
CREATE PROCEDURE SP_ProfesorExamenes
    @Usuario_ID INT
AS
BEGIN
    SELECT
        ex.Examen_ID, ex.Titulo, ex.DuracionMinutos, ex.Estado,
        ex.PuntajeTotal, ex.FechaInicio, ex.FechaFin,
        c.Nombre AS Materia, g.Nombre AS Grado, s.Nombre AS Seccion,
        (SELECT COUNT(*) FROM EXAMEN_PREGUNTAS ep WHERE ep.Examen_ID = ex.Examen_ID) AS Preguntas,
        (SELECT COUNT(*) FROM EXAMEN_INTENTOS ei WHERE ei.Examen_ID = ex.Examen_ID) AS Intentos
    FROM EXAMENES ex
    INNER JOIN CURSOS c ON ex.Curso_ID = c.Curso_ID
    INNER JOIN GRADOS g ON ex.Grado_ID = g.Grado_ID
    INNER JOIN SECCIONES s ON ex.Seccion_ID = s.Seccion_ID
    WHERE ex.CreadoPor_ID = @Usuario_ID
    ORDER BY ex.FechaCreacion DESC;
END;
```

#### SP_ProfesorCrearExamen

```sql
CREATE PROCEDURE SP_ProfesorCrearExamen
    @Titulo NVARCHAR(150),
    @Instrucciones NVARCHAR(MAX),
    @DuracionMinutos INT,
    @FechaInicio DATETIME2,
    @PuntajeTotal DECIMAL(5,2),
    @Curso_ID INT,
    @Grado_ID INT,
    @Seccion_ID INT,
    @CreadoPor_ID INT
AS
BEGIN
    INSERT INTO EXAMENES (Titulo, Instrucciones, DuracionMinutos, FechaInicio, PuntajeTotal, Curso_ID, Grado_ID, Seccion_ID, CreadoPor_ID)
    VALUES (@Titulo, @Instrucciones, @DuracionMinutos, @FechaInicio, @PuntajeTotal, @Curso_ID, @Grado_ID, @Seccion_ID, @CreadoPor_ID);
    SELECT SCOPE_IDENTITY() AS Examen_ID, 'Examen creado' AS Mensaje;
END;
```

#### SP_ExamenPreguntas

```sql
CREATE PROCEDURE SP_ExamenPreguntas
    @Examen_ID INT
AS
BEGIN
    SELECT
        Pregunta_ID, Tipo, Texto, Puntos, Orden, Opciones, RespuestaCorrecta
    FROM EXAMEN_PREGUNTAS
    WHERE Examen_ID = @Examen_ID
    ORDER BY Orden;
END;
```

#### SP_ExamenAgregarPregunta

```sql
CREATE PROCEDURE SP_ExamenAgregarPregunta
    @Examen_ID INT,
    @Tipo NVARCHAR(20),
    @Texto NVARCHAR(MAX),
    @Puntos DECIMAL(5,2),
    @Opciones NVARCHAR(MAX),  -- JSON
    @RespuestaCorrecta NVARCHAR(500)
AS
BEGIN
    DECLARE @Orden INT = ISNULL((SELECT MAX(Orden) FROM EXAMEN_PREGUNTAS WHERE Examen_ID = @Examen_ID), 0) + 1;

    INSERT INTO EXAMEN_PREGUNTAS (Examen_ID, Tipo, Texto, Puntos, Orden, Opciones, RespuestaCorrecta)
    VALUES (@Examen_ID, @Tipo, @Texto, @Puntos, @Orden, @Opciones, @RespuestaCorrecta);

    SELECT SCOPE_IDENTITY() AS Pregunta_ID, 'Pregunta agregada' AS Mensaje;
END;
```

#### SP_ExamenActualizarPregunta

```sql
CREATE PROCEDURE SP_ExamenActualizarPregunta
    @Pregunta_ID INT,
    @Tipo NVARCHAR(20),
    @Texto NVARCHAR(MAX),
    @Puntos DECIMAL(5,2),
    @Opciones NVARCHAR(MAX),
    @RespuestaCorrecta NVARCHAR(500)
AS
BEGIN
    UPDATE EXAMEN_PREGUNTAS
    SET Tipo = @Tipo, Texto = @Texto, Puntos = @Puntos, Opciones = @Opciones, RespuestaCorrecta = @RespuestaCorrecta
    WHERE Pregunta_ID = @Pregunta_ID;
    SELECT 1 AS Resultado, 'Pregunta actualizada' AS Mensaje;
END;
```

#### SP_ExamenEliminarPregunta

```sql
CREATE PROCEDURE SP_ExamenEliminarPregunta
    @Pregunta_ID INT
AS
BEGIN
    DELETE FROM EXAMEN_PREGUNTAS WHERE Pregunta_ID = @Pregunta_ID;
    SELECT 1 AS Resultado, 'Pregunta eliminada' AS Mensaje;
END;
```

#### SP_EstudianteExamenesDisponibles

```sql
CREATE PROCEDURE SP_EstudianteExamenesDisponibles
    @Usuario_ID INT
AS
BEGIN
    DECLARE @EstudianteID INT, @GradoID INT, @SeccionID INT;
    SELECT @EstudianteID = Estudiante_ID, @GradoID = Grado_ID, @SeccionID = Seccion_ID
    FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    SELECT
        ex.Examen_ID, ex.Titulo, ex.DuracionMinutos, ex.PuntajeTotal,
        ex.FechaInicio, ex.Estado,
        c.Nombre AS Materia,
        CASE WHEN ei.Examen_ID IS NOT NULL THEN 1 ELSE 0 END AS Realizado,
        ei.PuntajeObtenido, ei.Aprobado
    FROM EXAMENES ex
    INNER JOIN CURSOS c ON ex.Curso_ID = c.Curso_ID
    WHERE ex.Grado_ID = @GradoID AND ex.Seccion_ID = @SeccionID
        AND ex.Estado IN ('Activo', 'Finalizado')
    ORDER BY ex.FechaInicio DESC;
END;
```

#### SP_EstudianteEnviarExamen

```sql
CREATE PROCEDURE SP_EstudianteEnviarExamen
    @Examen_ID INT,
    @Usuario_ID INT,
    @Respuestas NVARCHAR(MAX)  -- JSON
AS
BEGIN
    DECLARE @EstudianteID INT;
    SELECT @EstudianteID = Estudiante_ID FROM ESTUDIANTES WHERE Usuario_ID = @Usuario_ID;

    IF EXISTS (SELECT 1 FROM EXAMEN_INTENTOS WHERE Examen_ID = @Examen_ID AND Estudiante_ID = @EstudianteID)
    BEGIN
        SELECT 0 AS Resultado, 'Ya realizaste este examen' AS Mensaje;
        RETURN;
    END

    -- Calcular puntaje
    DECLARE @PuntajeTotal DECIMAL(5,2) = (SELECT PuntajeTotal FROM EXAMENES WHERE Examen_ID = @Examen_ID);
    DECLARE @PuntajeObtenido DECIMAL(5,2) = 0;

    -- Simplificado: asignar puntaje basado en respuestas correctas
    -- En producción se evaluaría cada respuesta
    SET @PuntajeObtenido = @PuntajeTotal * 0.7;  -- Placeholder: 70% por defecto

    DECLARE @Aprobado BIT = CASE WHEN @PuntajeObtenido >= (@PuntajeTotal * 0.6) THEN 1 ELSE 0 END;

    INSERT INTO EXAMEN_INTENTOS (Examen_ID, Estudiante_ID, FechaFin, PuntajeObtenido, Aprobado, Respuestas)
    VALUES (@Examen_ID, @EstudianteID, SYSUTCDATETIME(), @PuntajeObtenido, @Aprobado, @Respuestas);

    SELECT 1 AS Resultado, 'Examen enviado' AS Mensaje, @PuntajeObtenido AS Puntaje, @Aprobado AS Aprobado;
END;
```

#### SP_ExamenResultados

```sql
CREATE PROCEDURE SP_ExamenResultados
    @Examen_ID INT
AS
BEGIN
    SELECT
        ei.Intento_ID,
        p.PrimerNombre + ' ' + p.PrimerApellido AS Estudiante,
        e.Carnet,
        ei.PuntajeObtenido,
        ei.Aprobado,
        ei.FechaInicio, ei.FechaFin
    FROM EXAMEN_INTENTOS ei
    INNER JOIN ESTUDIANTES e ON ei.Estudiante_ID = e.Estudiante_ID
    INNER JOIN PERSONAS p ON e.Persona_ID = p.Persona_ID
    WHERE ei.Examen_ID = @Examen_ID
    ORDER BY ei.PuntajeObtenido DESC;
END;
```

---

## Sub-fase 11.2: Endpoints

Crear `Endpoints/ExamenesEndpoints.cs`:

```csharp
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace API_LMS.Endpoints;

public static class ExamenesEndpoints
{
    public static void MapExamenesEndpoints(this WebApplication app)
    {
        // --- Profesor ---
        var profesorGroup = app.MapGroup("/api/profesor/examenes")
            .RequireAuthorization().WithTags("Examenes");

        profesorGroup.MapGet("/", [Authorize(Roles = "Profesor")] async (ClaimsPrincipal user, DbService db) =>
        {
            var uid = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await db.EjecutarSpAsync("SP_ProfesorExamenes", new Dictionary<string, object?> { ["@Usuario_ID"] = uid });
            return Results.Ok(result);
        }).WithName("ProfesorExamenes").Produces(200);

        profesorGroup.MapPost("/", [Authorize(Roles = "Profesor")] async (CrearExamenRequest req, ClaimsPrincipal user, DbService db) =>
        {
            var uid = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?>
            {
                ["@Titulo"] = req.Titulo, ["@Instrucciones"] = req.Instrucciones ?? (object)DBNull.Value,
                ["@DuracionMinutos"] = req.DuracionMinutos, ["@FechaInicio"] = req.FechaInicio,
                ["@PuntajeTotal"] = req.PuntajeTotal, ["@Curso_ID"] = req.CursoId,
                ["@Grado_ID"] = req.GradoId, ["@Seccion_ID"] = req.SeccionId, ["@CreadoPor_ID"] = uid
            };
            var result = await db.EjecutarSpAsync("SP_ProfesorCrearExamen", param);
            return Results.Ok(new { examenId = result[0]["Examen_ID"], message = result[0]["Mensaje"]?.ToString() });
        }).WithName("ProfesorCrearExamen").Produces(200);

        profesorGroup.MapGet("/{id}/preguntas", [Authorize(Roles = "Profesor")] async (int id, DbService db) =>
        {
            var result = await db.EjecutarSpAsync("SP_ExamenPreguntas", new Dictionary<string, object?> { ["@Examen_ID"] = id });
            return Results.Ok(result);
        }).WithName("ExamenPreguntas").Produces(200);

        profesorGroup.MapPost("/{id}/preguntas", [Authorize(Roles = "Profesor")] async (int id, AgregarPreguntaRequest req, DbService db) =>
        {
            var param = new Dictionary<string, object?>
            {
                ["@Examen_ID"] = id, ["@Tipo"] = req.Tipo, ["@Texto"] = req.Texto,
                ["@Puntos"] = req.Puntos, ["@Opciones"] = req.Opciones ?? (object)DBNull.Value,
                ["@RespuestaCorrecta"] = req.RespuestaCorrecta ?? (object)DBNull.Value
            };
            var result = await db.EjecutarSpAsync("SP_ExamenAgregarPregunta", param);
            return Results.Ok(new { preguntaId = result[0]["Pregunta_ID"], message = result[0]["Mensaje"]?.ToString() });
        }).WithName("ExamenAgregarPregunta").Produces(200);

        profesorGroup.MapPut("/preguntas/{id}", [Authorize(Roles = "Profesor")] async (int id, AgregarPreguntaRequest req, DbService db) =>
        {
            var param = new Dictionary<string, object?>
            {
                ["@Pregunta_ID"] = id, ["@Tipo"] = req.Tipo, ["@Texto"] = req.Texto,
                ["@Puntos"] = req.Puntos, ["@Opciones"] = req.Opciones ?? (object)DBNull.Value,
                ["@RespuestaCorrecta"] = req.RespuestaCorrecta ?? (object)DBNull.Value
            };
            var result = await db.EjecutarSpAsync("SP_ExamenActualizarPregunta", param);
            return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
        }).WithName("ExamenActualizarPregunta").Produces(200);

        profesorGroup.MapDelete("/preguntas/{id}", [Authorize(Roles = "Profesor")] async (int id, DbService db) =>
        {
            var result = await db.EjecutarSpAsync("SP_ExamenEliminarPregunta", new Dictionary<string, object?> { ["@Pregunta_ID"] = id });
            return Results.Ok(new { message = result[0]["Mensaje"]?.ToString() });
        }).WithName("ExamenEliminarPregunta").Produces(200);

        profesorGroup.MapGet("/{id}/resultados", [Authorize(Roles = "Profesor")] async (int id, DbService db) =>
        {
            var result = await db.EjecutarSpAsync("SP_ExamenResultados", new Dictionary<string, object?> { ["@Examen_ID"] = id });
            return Results.Ok(result);
        }).WithName("ExamenResultados").Produces(200);

        // --- Estudiante ---
        var estudianteGroup = app.MapGroup("/api/estudiante/examenes")
            .RequireAuthorization().WithTags("Examenes");

        estudianteGroup.MapGet("/", [Authorize(Roles = "Estudiante")] async (ClaimsPrincipal user, DbService db) =>
        {
            var uid = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var result = await db.EjecutarSpAsync("SP_EstudianteExamenesDisponibles", new Dictionary<string, object?> { ["@Usuario_ID"] = uid });
            return Results.Ok(result);
        }).WithName("EstudianteExamenesDisponibles").Produces(200);

        estudianteGroup.MapGet("/{id}/preguntas", [Authorize(Roles = "Estudiante")] async (int id, DbService db) =>
        {
            var result = await db.EjecutarSpAsync("SP_ExamenPreguntas", new Dictionary<string, object?> { ["@Examen_ID"] = id });
            return Results.Ok(result);
        }).WithName("EstudianteExamenPreguntas").Produces(200);

        estudianteGroup.MapPost("/{id}/enviar", [Authorize(Roles = "Estudiante")] async (int id, EnviarExamenRequest req, ClaimsPrincipal user, DbService db) =>
        {
            var uid = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var param = new Dictionary<string, object?>
            {
                ["@Examen_ID"] = id, ["@Usuario_ID"] = uid, ["@Respuestas"] = req.Respuestas
            };
            var result = await db.EjecutarSpAsync("SP_EstudianteEnviarExamen", param);
            if (Convert.ToInt32(result[0]["Resultado"]) == 0)
                return Results.BadRequest(new { error = result[0]["Mensaje"]?.ToString() });
            return Results.Ok(new { message = result[0]["Mensaje"]?.ToString(), puntaje = result[0]["Puntaje"], aprobado = result[0]["Aprobado"] });
        }).WithName("EstudianteEnviarExamen").Produces(200).Produces(400);
    }
}

public record CrearExamenRequest(
    string Titulo, string? Instrucciones, int DuracionMinutos, string FechaInicio,
    decimal PuntajeTotal, int CursoId, int GradoId, int SeccionId
);

public record AgregarPreguntaRequest(
    string Tipo, string Texto, decimal Puntos, string? Opciones, string? RespuestaCorrecta
);

public record EnviarExamenRequest(string Respuestas);  // JSON
```

Registrar en `Program.cs`:

```csharp
app.MapExamenesEndpoints();
```

---

## Sub-fase 11.3: Tests PowerShell

Crear `tests/phase11/test-examenes.ps1`:

```powershell
$BaseUrl = "http://localhost:5275"

# Login profesor
$loginProf = @{ username = "profesor"; password = "profesor123" } | ConvertTo-Json
$respProf = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginProf
$headersProf = @{ Authorization = "Bearer $($respProf.token)" }

# Login estudiante
$loginEst = @{ username = "estudiante"; password = "estudiante123" } | ConvertTo-Json
$respEst = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginEst
$headersEst = @{ Authorization = "Bearer $($respEst.token)" }

Write-Host "=== Fase 11: Tests Exámenes ==="

# 1. Profesor: Listar exámenes
Write-Host "`n--- Profesor: Mis Exámenes ---"
$examenes = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/examenes" -Method GET -Headers $headersProf
Write-Host "Exámenes: $($examenes.Count)"

# 2. Profesor: Crear examen
Write-Host "`n--- Profesor: Crear Examen ---"
$clases = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/clases" -Method GET -Headers $headersProf
$clase = $clases[0]
$nuevoExamen = @{
    titulo = "Examen de Prueba Fase 11"
    instrucciones = "Responda todas las preguntas."
    duracionMinutos = 60
    fechaInicio = (Get-Date).AddDays(3).ToString("yyyy-MM-ddTHH:mm:ss")
    puntajeTotal = 100
    cursoId = $clase.Curso_ID
    gradoId = $clase.Grado_ID
    seccionId = $clase.Seccion_ID
} | ConvertTo-Json
$examenResult = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/examenes" -Method POST -ContentType "application/json" -Headers $headersProf -Body $nuevoExamen
Write-Host "Examen: $($examenResult | ConvertTo-Json -Compress)"
$examenId = $examenResult.examenId

# 3. Profesor: Agregar preguntas
Write-Host "`n--- Profesor: Agregar Preguntas ---"
$pregunta1 = @{
    tipo = "Opcion"
    texto = "¿Cuál es la capital de Guatemala?"
    puntos = 20
    opciones = '["Guatemala", "Quetzaltenango", "Antigua", "Cobán"]'
    respuestaCorrecta = "0"
} | ConvertTo-Json
$preguntaResult = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/examenes/$examenId/preguntas" -Method POST -ContentType "application/json" -Headers $headersProf -Body $pregunta1
Write-Host "Pregunta 1: $($preguntaResult | ConvertTo-Json -Compress)"

$pregunta2 = @{
    tipo = "Desarrollo"
    texto = "Explique el proceso de fotosíntesis."
    puntos = 30
    opciones = $null
    respuestaCorrecta = $null
} | ConvertTo-Json
$pregunta2Result = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/examenes/$examenId/preguntas" -Method POST -ContentType "application/json" -Headers $headersProf -Body $pregunta2
Write-Host "Pregunta 2: $($pregunta2Result | ConvertTo-Json -Compress)"

# 4. Profesor: Ver preguntas
Write-Host "`n--- Profesor: Ver Preguntas ---"
$preguntas = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/examenes/$examenId/preguntas" -Method GET -Headers $headersProf
Write-Host "Preguntas: $($preguntas.Count)"
$preguntas | ForEach-Object { Write-Host "  [$($_.Tipo)] $($_.Texto) ($($_.Puntos) pts)" }

# 5. Estudiante: Ver exámenes disponibles
Write-Host "`n--- Estudiante: Exámenes Disponibles ---"
$examenesEst = Invoke-RestMethod -Uri "$BaseUrl/api/estudiante/examenes" -Method GET -Headers $headersEst
Write-Host "Disponibles: $($examenesEst.Count)"

# 6. Estudiante: Responder examen (si hay disponible)
if ($examenesEst.Count -gt 0) {
    $examenEst = $examenesEst | Where-Object { $_.Realizado -eq 0 } | Select-Object -First 1
    if ($examenEst) {
        Write-Host "`n--- Estudiante: Enviar Examen ---"
        $respuestas = '{"1":"0","2":"La fotosíntesis es el proceso..."}' 
        $enviarResult = Invoke-RestMethod -Uri "$BaseUrl/api/estudiante/examenes/$($examenEst.Examen_ID)/enviar" -Method POST -ContentType "application/json" -Headers $headersEst -Body "{`"respuestas`": $respuestas}"
        Write-Host "Resultado: $($enviarResult | ConvertTo-Json -Compress)"
    }
}

# 7. Profesor: Ver resultados
Write-Host "`n--- Profesor: Resultados ---"
$resultados = Invoke-RestMethod -Uri "$BaseUrl/api/profesor/examenes/$examenId/resultados" -Method GET -Headers $headersProf
Write-Host "Resultados: $($resultados.Count)"
$resultados | ForEach-Object { Write-Host "  $($_.Estudiante) - Nota: $($_.PuntajeObtenido) ($($_.Aprobado))" }

Write-Host "`n=== Fase 11: Tests completados ==="
```

---

## Sub-fase 11.4: Front-end Angular

### 11.4.1 Servicio — `examenes.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExamenesService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Profesor
  listarExamenesProfesor() { return this.http.get<any[]>(`${this.apiUrl}/api/profesor/examenes`); }
  crearExamen(data: any) { return this.http.post<any>(`${this.apiUrl}/api/profesor/examenes`, data); }
  obtenerPreguntas(examenId: number) { return this.http.get<any[]>(`${this.apiUrl}/api/profesor/examenes/${examenId}/preguntas`); }
  agregarPregunta(examenId: number, data: any) { return this.http.post<any>(`${this.apiUrl}/api/profesor/examenes/${examenId}/preguntas`, data); }
  actualizarPregunta(id: number, data: any) { return this.http.put<any>(`${this.apiUrl}/api/profesor/examenes/preguntas/${id}`, data); }
  eliminarPregunta(id: number) { return this.http.delete<any>(`${this.apiUrl}/api/profesor/examenes/preguntas/${id}`); }
  obtenerResultados(examenId: number) { return this.http.get<any[]>(`${this.apiUrl}/api/profesor/examenes/${examenId}/resultados`); }

  // Estudiante
  listarExamenesEstudiante() { return this.http.get<any[]>(`${this.apiUrl}/api/estudiante/examenes`); }
  obtenerPreguntasEstudiante(examenId: number) { return this.http.get<any[]>(`${this.apiUrl}/api/estudiante/examenes/${examenId}/preguntas`); }
  enviarExamen(examenId: number, respuestas: string) { return this.http.post<any>(`${this.apiUrl}/api/estudiante/examenes/${examenId}/enviar`, { respuestas }); }
}
```

### 11.4.2 Componentes

**Profesor — ProfesorExamenesComponent:**
- Lista de exámenes con tabs Próximos/Finalizados
- Modal crear: Título, Clase, Materia, Duración, Fecha, Puntaje Total
- Vista de preguntas: estadísticas, lista de preguntas con reordenar, agregar, editar, eliminar
- Modal editar pregunta: Tipo (Opción/Desarrollo/Archivo), Texto, Opciones, Puntos
- Vista de resultados: tabla de estudiantes con nota y estado

**Estudiante — EstudianteExamenesComponent:**
- Tabs: Próximos, Realizados
- Próximos: duración, preguntas, botón "Iniciar"
- Al iniciar: pantalla de instrucciones → examen activo con:
  - Timer countdown
  - Mapa de preguntas (respondida/actual/pendiente)
  - Navegación anterior/siguiente
  - Tipos: opción (radio), desarrollo (textarea), archivo (upload)
  - Botón "Enviar Examen"
- Realizados: nota, estado (Aprobado/Reprobado)

### 11.4.3 Rutas

Ya configuradas en Fase 0:
- `/sistema/profesor/examenes`
- `/sistema/examenes`

---

## Sub-fase 11.5: Tests Playwright

Crear `tests-e2e/tests/phase11-examenes.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { testCredentials } from '../test-data';

test.describe('Fase 11 - Exámenes', () => {

  test.describe('Profesor', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel('Profesor').click();
      await page.getByPlaceholder('Usuario').fill(testCredentials.teacher.username);
      await page.getByPlaceholder('Contraseña').fill(testCredentials.teacher.password);
      await page.getByRole('button', { name: /iniciar/i }).click();
    });

    test('ver exámenes del profesor', async ({ page }) => {
      await page.getByRole('link', { name: 'Exámenes' }).click();
      await expect(page).toHaveURL(/\/sistema\/profesor\/examenes/);
      await expect(page.locator('table.data-table')).toBeVisible();
    });

    test('crear examen', async ({ page }) => {
      await page.getByRole('link', { name: 'Exámenes' }).click();
      await page.getByRole('button', { name: /nuevo examen/i }).click();
      await expect(page.locator('.modal')).toBeVisible();

      await page.locator('.modal input').first().fill('Examen Playwright');
      await page.locator('.modal select').first().selectOption({ index: 1 });
      await page.locator('.modal input').nth(1).fill('60');
      await page.locator('.modal input').nth(2).fill('100');

      await page.getByRole('button', { name: /crear/i }).last().click();
      await expect(page.locator('.alert-success')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Estudiante', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel('Estudiante').click();
      await page.getByPlaceholder('Usuario').fill(testCredentials.student.username);
      await page.getByPlaceholder('Contraseña').fill(testCredentials.student.password);
      await page.getByRole('button', { name: /iniciar/i }).click();
    });

    test('ver exámenes disponibles', async ({ page }) => {
      await page.getByRole('link', { name: 'Exámenes' }).click();
      await expect(page).toHaveURL(/\/sistema\/examenes/);
      await expect(page.getByText('Mis Exámenes')).toBeVisible();
      // Tab de Próximos activo
      await expect(page.locator('.tab.active')).toContainText('Próximos');
    });

    test('cambiar a exámenes realizados', async ({ page }) => {
      await page.getByRole('link', { name: 'Exámenes' }).click();
      await page.getByRole('tab', { name: /realizados/i }).click();
      await page.waitForTimeout(500);
      await expect(page.locator('.tab.active')).toContainText('Realizados');
    });
  });

});
```

---

## Sub-fase 11.6: Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Exámenes se listan por profesor | PowerShell muestra exámenes |
| 2 | Crear examen funciona | PowerShell crea examen |
| 3 | Preguntas se agregan/actualizan/eliminan | PowerShell CRUD de preguntas |
| 4 | Estudiante ve exámenes disponibles | PowerShell muestra exámenes |
| 5 | Enviar examen funciona | PowerShell envía y muestra puntaje |
| 6 | Resultados se muestran al profesor | PowerShell muestra resultados |
| 7 | UI profesor: crear examen | Playwright crea examen |
| 8 | UI estudiante: ver exámenes | Playwright verifica lista |
| 9 | Timer funciona (opcional) | Playwright verifica countdown |

---

## Notas de implementación

1. **Timer del examen:** Implementar con `setInterval` en el front-end. Cuando llegue a 0, enviar automáticamente las respuestas actuales.
2. **Mapa de preguntas:** Usar un array de objetos `{ respondida: boolean, actual: boolean }` para controlar el estado visual.
3. **Scoring real:** El SP actual usa un placeholder (70%). Para scoring real, evaluar cada respuesta contra `RespuestaCorrecta` en el SP o en .NET.
4. **Reordenar preguntas:** Usar botones de flecha arriba/abajo que intercambien el campo `Orden`.
5. **Preview de examen:** Renderizar las preguntas en modo solo lectura, sin timer.
