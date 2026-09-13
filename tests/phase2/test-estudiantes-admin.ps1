$BaseUrl = "http://localhost:5275"

# Login
$loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($loginResp.token)" }

Write-Host "=== Fase 2: Tests Estudiantes Admin ==="

# 1. Listar estudiantes paginado
Write-Host "`n--- 1. Listar Estudiantes (Pagina 1) ---"
$result = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes?pagina=1&tamanioPagina=10" -Method GET -Headers $headers
Write-Host "Resultados en pagina: $($result.Count)"

# 2. Buscar por nombre
Write-Host "`n--- 2. Buscar por Nombre ---"
$busqueda = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes?busqueda=Maria&pagina=1&tamanioPagina=10" -Method GET -Headers $headers
Write-Host "Encontrados: $($busqueda.Count)"

# 3. Filtrar por grado
Write-Host "`n--- 3. Filtrar por Grado ---"
$filtro = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes?gradoId=1&pagina=1&tamanioPagina=10" -Method GET -Headers $headers
Write-Host "Encontrados en Grado 1: $($filtro.Count)"

# 4. Obtener detalle de estudiante
Write-Host "`n--- 4. Obtener Detalle ---"
$firstId = $result[0].Estudiante_ID
$detalle = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes/$firstId" -Method GET -Headers $headers
Write-Host "ID: $($detalle.Estudiante_ID)"
Write-Host "Nombre: $($detalle.PrimerNombre) $($detalle.PrimerApellido)"
Write-Host "Carnet: $($detalle.Carnet)"
Write-Host "Grado: $($detalle.Grado) $($detalle.Seccion)"
Write-Host "Activo: $($detalle.Activo)"

# 5. Cursos inscritos del estudiante
Write-Host "`n--- 5. Cursos Inscritos ---"
$cursos = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes/$firstId/cursos" -Method GET -Headers $headers
Write-Host "Cursos: $($cursos.Count)"
$cursos | ForEach-Object { Write-Host "  $($_.Materia) - Promedio: $($_.Promedio)" }

# 6. Actualizar estudiante
Write-Host "`n--- 6. Actualizar Estudiante ---"
$updateBody = @{
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
$updateResult = Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes/$firstId" -Method PUT -ContentType "application/json" -Headers $headers -Body $updateBody
Write-Host "Resultado: $($updateResult.message)"

# 7. Test sin token (401)
Write-Host "`n--- 7. Test Sin Token (401) ---"
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/admin/estudiantes" -Method GET
    Write-Host "FAIL: Se esperaba 401"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "OK: 401 retornado"
    } else {
        Write-Host "WARN: Status $($_.Exception.Response.StatusCode)"
    }
}

Write-Host "`n=== Fase 2: Tests completados ==="
