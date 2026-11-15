# AI Sales Copilot - Full Stack Demo Launcher
$Host.UI.RawUI.WindowTitle = "AI Sales Copilot - Live Demo"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       AI SALES COPILOT - LIVE DEMO LAUNCHER              " -ForegroundColor Green
Write-Host "  .NET 9 Clean Architecture + Semantic Kernel + React 19  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot
$apiDir = Join-Path $root "AISalesCopilot.API"
$clientDir = Join-Path $root "client"

# --- 1. Start .NET 9 Backend API ---
Write-Host "[1/3] Starting .NET 9 Web API on http://127.0.0.1:5000..." -ForegroundColor Cyan
$apiProc = Start-Process dotnet -ArgumentList "run --urls http://127.0.0.1:5000" -WorkingDirectory $apiDir -PassThru

# Wait for API to become ready
$ready = $false
$retries = 25
while ($retries -gt 0 -and -not $ready) {
    Start-Sleep -Seconds 1
    try {
        $null = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/leads" -TimeoutSec 2 -ErrorAction Stop
        $ready = $true
    } catch {
        $retries--
    }
}

if ($ready) {
    Write-Host "      API is live and healthy with seeded enterprise leads!" -ForegroundColor Green
} else {
    Write-Host "      API is still starting up in background..." -ForegroundColor Yellow
}

# --- 2. Start React 19 + Vite Frontend ---
# npm is a .cmd file on Windows, so we must launch it via cmd.exe
Write-Host "[2/3] Starting React 19 + Vite Frontend on http://localhost:3000..." -ForegroundColor Cyan
$clientProc = Start-Process cmd.exe -ArgumentList "/c cd /d `"$clientDir`" && npm run dev" -PassThru

Start-Sleep -Seconds 3

# --- 3. Open Browser ---
Write-Host "[3/3] Opening your browser to http://localhost:3000..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   DEMO IS RUNNING LIVE! PRESS CTRL+C OR CLOSE TO STOP   " -ForegroundColor White
Write-Host "   - Frontend UI:  http://localhost:3000                  " -ForegroundColor White
Write-Host "   - Backend API:  http://127.0.0.1:5000/api/leads       " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

# Keep script alive until user presses Ctrl+C
try {
    # Only wait on processes that are actually running
    $waitIds = @()
    if ($apiProc -and -not $apiProc.HasExited) { $waitIds += $apiProc.Id }
    if ($clientProc -and -not $clientProc.HasExited) { $waitIds += $clientProc.Id }

    if ($waitIds.Count -gt 0) {
        Wait-Process -Id $waitIds
    } else {
        Write-Host "Press Enter to shut down..." -ForegroundColor Yellow
        Read-Host
    }
} finally {
    Write-Host "Shutting down services..." -ForegroundColor Yellow
    if ($apiProc) { Stop-Process -Id $apiProc.Id -Force -ErrorAction SilentlyContinue }
    if ($clientProc) { Stop-Process -Id $clientProc.Id -Force -ErrorAction SilentlyContinue }
    # Also kill any orphaned node processes on port 3000
    Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Write-Host "All services stopped. Goodbye!" -ForegroundColor Green
}
