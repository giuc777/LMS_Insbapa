# Phase 0 - Test Dashboard & Navigation
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
$adminToken = $loginResp.token
Assert-True ($null -ne $adminToken) "Admin login returns token"

$adminHeaders = @{ Authorization = "Bearer $adminToken" }

# --- Dashboard as Admin ---
Write-Host "`n[2] Dashboard Admin..." -ForegroundColor Cyan
$dashAdmin = Invoke-RestMethod -Uri "$baseUrl/api/dashboard" -Headers $adminHeaders
Assert-True ($null -ne $dashAdmin.metricas) "Dashboard has metricas"
Assert-True ($dashAdmin.metricas.totalEstudiantes -ge 0) "totalEstudiantes is a number"
Assert-True ($dashAdmin.metricas.totalProfesores -ge 0) "totalProfesores is a number"
Assert-True ($dashAdmin.metricas.cursosActivos -ge 0) "cursosActivos is a number"

# --- Login as Profesor ---
Write-Host "`n[3] Login as profesor..." -ForegroundColor Cyan
$loginProfBody = @{ username = "profesor"; password = "profesor123" } | ConvertTo-Json
$loginProfResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginProfBody -ContentType "application/json"
$profToken = $loginProfResp.token
Assert-True ($null -ne $profToken) "Profesor login returns token"

$profHeaders = @{ Authorization = "Bearer $profToken" }

# --- Dashboard as Profesor ---
Write-Host "`n[4] Dashboard Profesor..." -ForegroundColor Cyan
$dashProf = Invoke-RestMethod -Uri "$baseUrl/api/dashboard" -Headers $profHeaders
Assert-True ($null -ne $dashProf.clases) "Dashboard has clases"
Assert-True ($null -ne $dashProf.resumen) "Dashboard has resumen"

# --- Login as Estudiante ---
Write-Host "`n[5] Login as estudiante..." -ForegroundColor Cyan
$loginEstBody = @{ username = "estudiante"; password = "estudiante123" } | ConvertTo-Json
$loginEstResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginEstBody -ContentType "application/json"
$estToken = $loginEstResp.token
Assert-True ($null -ne $estToken) "Estudiante login returns token"

$estHeaders = @{ Authorization = "Bearer $estToken" }

# --- Dashboard as Estudiante ---
Write-Host "`n[6] Dashboard Estudiante..." -ForegroundColor Cyan
$dashEst = Invoke-RestMethod -Uri "$baseUrl/api/dashboard" -Headers $estHeaders
Assert-True ($null -ne $dashEst.cursos) "Dashboard has cursos"
Assert-True ($null -ne $dashEst.resumen) "Dashboard has resumen"

# --- Summary ---
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Results: $passed passed, $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failed -gt 0) { exit 1 }
