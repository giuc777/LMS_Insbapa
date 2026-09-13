# Phase 1 - Test Cursos (Admin CRUD)
# Run against live API (http://localhost:5275)

$baseUrl = "http://localhost:5275"
$passed = 0
$failed = 0

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if ($Condition) {
        Write-Host "  PASS: $Message" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "  FAIL: $Message" -ForegroundColor Red
        $script:failed++
    }
}

# --- Login as Admin ---
Write-Host "`n[1] Login as admin..." -ForegroundColor Cyan
$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($loginResp.token)" }
Assert-True ($null -ne $loginResp.token) "Admin login returns token"

# --- Listar cursos ---
Write-Host "`n[2] Listar cursos admin..." -ForegroundColor Cyan
$cursos = Invoke-RestMethod -Uri "$baseUrl/api/admin/cursos" -Headers $headers
Assert-True ($cursos -is [array]) "Response is array"
Write-Host "  Cursos encontrados: $($cursos.Count)"

# --- Catálogo de cursos ---
Write-Host "`n[3] Catálogo de cursos..." -ForegroundColor Cyan
$catalogo = Invoke-RestMethod -Uri "$baseUrl/api/admin/cursos/catalogo" -Headers $headers
Assert-True ($catalogo.Count -gt 0) "Catálogo tiene cursos"

# --- Catálogo de profesores ---
Write-Host "`n[4] Catálogo de profesores..." -ForegroundColor Cyan
$profes = Invoke-RestMethod -Uri "$baseUrl/api/admin/cursos/profesores-catalogo" -Headers $headers
Assert-True ($profes.Count -gt 0) "Catálogo tiene profesores"

# --- Crear asignación ---
Write-Host "`n[5] Crear asignación..." -ForegroundColor Cyan
$nuevaAsignacion = @{
    CursoId = $catalogo[0].Curso_ID
    GradoId = 1
    SeccionId = 1
    ProfesorId = $profes[0].Profesor_ID
} | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$baseUrl/api/admin/cursos" -Method Post -ContentType "application/json" -Headers $headers -Body $nuevaAsignacion
$asignacionId = $result.asignacionId
Assert-True ($asignacionId -gt 0) "Asignación creada (ID: $asignacionId)"

# --- Verificar creación ---
Write-Host "`n[6] Verificar creación..." -ForegroundColor Cyan
$cursosActualizados = Invoke-RestMethod -Uri "$baseUrl/api/admin/cursos" -Headers $headers
$nueva = $cursosActualizados | Where-Object { $_.Asignacion_ID -eq $asignacionId }
Assert-True ($null -ne $nueva) "Asignación encontrada en listado"

# --- Actualizar asignación ---
Write-Host "`n[7] Actualizar asignación..." -ForegroundColor Cyan
$actualizar = @{
    CursoId = $catalogo[0].Curso_ID
    GradoId = 1
    SeccionId = 2
    ProfesorId = $profes[0].Profesor_ID
} | ConvertTo-Json
$updateResult = Invoke-RestMethod -Uri "$baseUrl/api/admin/cursos/$asignacionId" -Method Put -ContentType "application/json" -Headers $headers -Body $actualizar
Assert-True ($updateResult.message -ne $null) "Actualización exitosa"

# --- Eliminar asignación ---
Write-Host "`n[8] Eliminar asignación..." -ForegroundColor Cyan
$deleteResult = Invoke-RestMethod -Uri "$baseUrl/api/admin/cursos/$asignacionId" -Method Delete -Headers $headers
Assert-True ($deleteResult.message -ne $null) "Eliminación exitosa"

# --- Verificar eliminación ---
Write-Host "`n[9] Verificar eliminación..." -ForegroundColor Cyan
$cursosFinales = Invoke-RestMethod -Uri "$baseUrl/api/admin/cursos" -Headers $headers
$eliminada = $cursosFinales | Where-Object { $_.Asignacion_ID -eq $asignacionId }
Assert-True ($null -eq $eliminada) "Asignación ya no existe"

# --- Test sin token ---
Write-Host "`n[10] Test sin token..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/api/admin/cursos" -Method Get
    Write-Host "  FAIL: Debería haber retornado 401" -ForegroundColor Red
    $failed++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-True ($statusCode -eq 401) "401 retornado sin token"
}

# --- Test con usuario no-admin ---
Write-Host "`n[11] Test sin rol admin..." -ForegroundColor Cyan
$loginEst = @{ username = "estudiante"; password = "estudiante123" } | ConvertTo-Json
$respEst = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $loginEst
$headersEst = @{ Authorization = "Bearer $($respEst.token)" }
try {
    Invoke-RestMethod -Uri "$baseUrl/api/admin/cursos" -Method Get -Headers $headersEst
    Write-Host "  FAIL: Debería haber retornado 403" -ForegroundColor Red
    $failed++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-True ($statusCode -eq 403 -or $statusCode -eq 401) "403 retornado sin rol admin"
}

# --- Summary ---
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Results: $passed passed, $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failed -gt 0) { exit 1 }
