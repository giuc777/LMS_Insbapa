$BaseUrl = "http://localhost:5275"

# Login
$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 3: Tests Profesores Admin ==="

# 1. Listar profesores
Write-Host "`n--- 1. Listar Profesores ---"
$result = Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores?pagina=1&tamanioPagina=10" -Method GET -Headers $headers
Write-Host "Profesores: $($result.Count)"
$result | ForEach-Object { Write-Host "  $($_.CodigoProfesor) - $($_.PrimerNombre) $($_.PrimerApellido)" }

# 2. Buscar por nombre
Write-Host "`n--- 2. Buscar por Nombre ---"
$busqueda = Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores?busqueda=Garcia" -Method GET -Headers $headers
Write-Host "Encontrados: $($busqueda.Count)"

# 3. Obtener detalle
Write-Host "`n--- 3. Obtener Detalle ---"
$firstId = $result[0].Profesor_ID
$detalle = Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores/$firstId" -Method GET -Headers $headers
Write-Host "ID: $($detalle.Profesor_ID)"
Write-Host "Nombre: $($detalle.PrimerNombre) $($detalle.PrimerApellido)"
Write-Host "Codigo: $($detalle.CodigoProfesor)"
Write-Host "Correo: $($detalle.Correo)"
Write-Host "Activo: $($detalle.Activo)"

# 4. Clases asignadas
Write-Host "`n--- 4. Clases Asignadas ---"
$clases = Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores/$firstId/clases" -Method GET -Headers $headers
Write-Host "Clases: $($clases.Count)"
$clases | ForEach-Object { Write-Host "  $($_.Materia) - $($_.Grado) $($_.Seccion) ($($_.Estudiantes) estudiantes)" }

# 5. Actualizar profesor
Write-Host "`n--- 5. Actualizar Profesor ---"
$updateBody = @{
    primerNombre = $detalle.PrimerNombre
    segundoNombre = $detalle.SegundoNombre
    primerApellido = $detalle.PrimerApellido
    segundoApellido = $detalle.SegundoApellido
    correo = $detalle.Correo
    telefono = $detalle.Telefono
    codigoProfesor = $detalle.CodigoProfesor
    activo = $detalle.Activo
} | ConvertTo-Json
$updateResult = Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores/$firstId" -Method PUT -ContentType "application/json" -Headers $headers -Body $updateBody
Write-Host "Resultado: $($updateResult.message)"

# 6. Test sin token (401)
Write-Host "`n--- 6. Test Sin Token (401) ---"
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores" -Method GET
    Write-Host "FAIL: Se esperaba 401"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "OK: 401 retornado"
    } else {
        Write-Host "WARN: Status $($_.Exception.Response.StatusCode)"
    }
}

# 7. Test sin rol admin (403)
Write-Host "`n--- 7. Test Sin Rol Admin (403) ---"
$studentLogin = @{ username = "estudiante"; password = "estudiante123" } | ConvertTo-Json
$studentResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $studentLogin
$studentHeaders = @{ Authorization = "Bearer $($studentResp.token)" }
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/admin/profesores" -Method GET -Headers $studentHeaders
    Write-Host "FAIL: Se esperaba 403"
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "OK: 403 retornado"
    } else {
        Write-Host "WARN: Status $($_.Exception.Response.StatusCode)"
    }
}

Write-Host "`n=== Fase 3: Tests completados ==="
