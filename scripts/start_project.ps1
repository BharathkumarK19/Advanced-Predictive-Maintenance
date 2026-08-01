# ==========================================
# Advanced Predictive Maintenance
# Startup Script
# ==========================================

$namespace = "predictive-maintenance"
$prometheusService = "prometheus-service"
$grafanaService = "grafana-service"

$prometheusPort = 9090
$grafanaPort = 3002
$backendService = "predictive-backend-service"
$frontendService = "predictive-frontend-service"

$backendPort = 8000
$frontendPort = 3001
# Simulator

$SimulatorPath = Join-Path $PSScriptRoot "..\simulator\simulator.py"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Starting Predictive Maintenance" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------
# Start Minikube
# ------------------------------------------

try {
    $status = minikube status --format="{{.Host}}" 2>$null

    if ($status -ne "Running") {
        Write-Host "Starting Minikube..." -ForegroundColor Yellow
        minikube start
    }
    else {
        Write-Host "Minikube already running." -ForegroundColor Green
    }
}
catch {
    Write-Host ""
    Write-Host "Docker Desktop is not running." -ForegroundColor Red
    Write-Host "Start Docker Desktop and try again."
    exit
}

# ------------------------------------------
# Wait for Pods
# ------------------------------------------

Write-Host ""
Write-Host "Waiting for Kubernetes Pods..." -ForegroundColor Yellow

kubectl wait `
    --for=condition=Ready `
    pods `
    --all `
    -n $namespace `
    --timeout=300s

Write-Host "All Pods Ready." -ForegroundColor Green

# ------------------------------------------
# Kill Existing Port Forwards
# ------------------------------------------

Write-Host ""
Write-Host "Cleaning old port-forwards..."

Get-Process powershell -ErrorAction SilentlyContinue |
Where-Object {
    $_.MainWindowTitle -like "*kubectl*"
} |
Stop-Process -Force -ErrorAction SilentlyContinue

# ------------------------------------------
# Backend Port Forward
# ------------------------------------------

Write-Host ""
Write-Host "Starting Backend Port Forward..." -ForegroundColor Yellow

$backend = Start-Process powershell.exe `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        "kubectl port-forward -n $namespace svc/$backendService $backendPort`:8000"
    ) `
    -PassThru

# ------------------------------------------
# Frontend Port Forward
# ------------------------------------------

Write-Host ""
Write-Host "Starting Frontend Port Forward..." -ForegroundColor Yellow

$frontend = Start-Process powershell.exe `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        "kubectl port-forward -n $namespace svc/$frontendService $frontendPort`:80"
    ) `
    -PassThru
# ------------------------------------------
# Prometheus Port Forward
# ------------------------------------------

Write-Host ""
Write-Host "Starting Prometheus Port Forward..." -ForegroundColor Yellow

$prometheus = Start-Process powershell.exe `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        "kubectl port-forward -n $namespace svc/$prometheusService $prometheusPort`:9090"
    ) `
    -PassThru
# ------------------------------------------
# Grafana Port Forward
# ------------------------------------------

Write-Host ""
Write-Host "Starting Grafana Port Forward..." -ForegroundColor Yellow

$grafana = Start-Process powershell.exe `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        "kubectl port-forward -n $namespace svc/$grafanaService $grafanaPort`:3000"
    ) `
    -PassThru
# ------------------------------------------
# Wait for Backend
# ------------------------------------------

Write-Host ""
Write-Host "Waiting for Backend..." -ForegroundColor Yellow

do {

    Start-Sleep 1

    try {

        Invoke-WebRequest `
            "http://localhost:$backendPort/api/health" `
            -UseBasicParsing `
            -TimeoutSec 2 | Out-Null

        $backendReady = $true

    }
    catch {

        $backendReady = $false

    }

} until ($backendReady)

Write-Host "Backend Ready." -ForegroundColor Green

# ------------------------------------------
# Wait for Frontend
# ------------------------------------------

Write-Host ""
Write-Host "Waiting for Frontend..." -ForegroundColor Yellow

do {

    Start-Sleep 1

    try {

        Invoke-WebRequest `
            "http://localhost:$frontendPort" `
            -UseBasicParsing `
            -TimeoutSec 2 | Out-Null

        $frontendReady = $true

    }
    catch {

        $frontendReady = $false

    }

} until ($frontendReady)

Write-Host "Frontend Ready." -ForegroundColor Green
# ------------------------------------------
# Wait for prometheus
# ------------------------------------------

do {
    Start-Sleep 1
    try {
        Invoke-WebRequest "http://localhost:9090/-/healthy" -UseBasicParsing -TimeoutSec 2 | Out-Null
        $prometheusReady = $true
    } catch {
        $prometheusReady = $false
    }
} until ($prometheusReady)
# ------------------------------------------
# Wait for grafana
# ------------------------------------------

do {
    Start-Sleep 1
    try {
        Invoke-WebRequest "http://localhost:3002/login" -UseBasicParsing -TimeoutSec 2 | Out-Null
        $grafanaReady = $true
    } catch {
        $grafanaReady = $false
    }
} until ($grafanaReady)
# ------------------------------------------
# Start MQTT Simulator
# ------------------------------------------

Write-Host ""
Write-Host "Starting MQTT Simulator..." -ForegroundColor Yellow

$env:PUBLISH_INTERVAL = "10"
$env:NUM_MACHINES = "4"
$env:ANOMALY_PROBABILITY = "0.10"

$simulator = Start-Process `
    python `
    -ArgumentList $SimulatorPath `
    -PassThru

Write-Host "MQTT Simulator Started." -ForegroundColor Green

# ------------------------------------------
# Save Runtime Information
# ------------------------------------------

$runtime = @{

    BackendPID = $backend.Id
    FrontendPID = $frontend.Id
    PrometheusPID = $prometheus.Id
    GrafanaPID = $grafana.Id
    SimulatorPID = $simulator.Id

}

$runtime | ConvertTo-Json | Set-Content "$PSScriptRoot\runtime.json"
# ------------------------------------------
# Open Browser
# ------------------------------------------

Write-Host ""
Write-Host "Opening Dashboard..." -ForegroundColor Cyan

Start-Process "http://localhost:$frontendPort"

Write-Host ""
Write-Host "========================================="
Write-Host " Application Started Successfully"
Write-Host "========================================="

Write-Host ""
Write-Host "Frontend : http://localhost:$frontendPort"
Write-Host "Backend  : http://localhost:$backendPort/docs"
Write-Host ""
Write-Host ""
Write-Host "========================================="
Write-Host " Application Started Successfully"
Write-Host "========================================="

Write-Host ""
Write-Host "Frontend   : http://localhost:$frontendPort"
Write-Host "Backend    : http://localhost:$backendPort/docs"
Write-Host "Prometheus : http://localhost:$prometheusPort"
Write-Host "Grafana    : http://localhost:$grafanaPort"
Write-Host ""