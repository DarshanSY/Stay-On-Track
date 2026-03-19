$ErrorActionPreference = "Continue"

$backendLog = "$PSScriptRoot\qa_artifacts\backend.log"
$backendErrLog = "$PSScriptRoot\qa_artifacts\backend_err.log"
$frontendLog = "$PSScriptRoot\qa_artifacts\frontend.log"
$frontendErrLog = "$PSScriptRoot\qa_artifacts\frontend_err.log"
$backendTestsLog = "$PSScriptRoot\qa_artifacts\backend_tests.log"

Write-Host "Ensuring ports are free..."
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Write-Host "Starting Backend..."
$backendProc = Start-Process -FilePath "python" -ArgumentList "backend/app.py" -WorkingDirectory "$PSScriptRoot" -RedirectStandardOutput $backendLog -RedirectStandardError $backendErrLog -PassThru -NoNewWindow
if (-not $backendProc) { Write-Error "Failed to start backend process"; exit 1 }

Write-Host "Starting Frontend..."
$frontendProc = Start-Process -FilePath "cmd" -ArgumentList "/c npm run dev" -WorkingDirectory "$PSScriptRoot\frontend" -RedirectStandardOutput $frontendLog -RedirectStandardError $frontendErrLog -PassThru -NoNewWindow
if (-not $frontendProc) { Write-Error "Failed to start frontend process"; exit 1 }

function Wait-For-Url {
    param($url)
    $max = 30
    $count = 0
    while ($count -lt $max) {
        try {
            $resp = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -TimeoutSec 1
            if ($resp.StatusCode -eq 200) { return $true }
        }
        catch { }
        Start-Sleep -Seconds 1
        $count++
    }
    return $false
}

Write-Host "Waiting for Backend (http://localhost:5000)..."
if (-not (Wait-For-Url "http://localhost:5000/api/health")) {
    Write-Warning "Backend health check failed. Checking root..."
    if (-not (Wait-For-Url "http://localhost:5000")) {
        Write-Error "Backend not reachable."
        # Don't exit, let tests confirm failure
    }
}

Write-Host "Waiting for Frontend (http://localhost:3000)..."
if (-not (Wait-For-Url "http://localhost:3000")) {
    Write-Error "Frontend not reachable."
}

Write-Host "Running Backend Tests (pytest)..."
$env:PYTHONPATH = "$PSScriptRoot\backend"
python -m pytest backend/tests/test_api.py --junitxml=qa_artifacts/pytest-report.xml | Tee-Object -FilePath $backendTestsLog

Write-Host "Running Frontend Tests (Playwright)..."
Push-Location frontend
try {
    npx playwright test
}
finally {
    Pop-Location
}

Write-Host "Cleaning up processes..."
Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue

# Ensure cleanup by port
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Write-Host "Done."
