Write-Host ""
Write-Host "========================================="
Write-Host " Stopping Predictive Maintenance"
Write-Host "========================================="
Write-Host ""

$runtimeFile = "$PSScriptRoot\runtime.json"

if (Test-Path $runtimeFile) {

    $runtime = Get-Content $runtimeFile | ConvertFrom-Json

    foreach ($processId in @(
    $runtime.BackendPID,
    $runtime.FrontendPID,
    $runtime.PrometheusPID,
    $runtime.GrafanaPID,
    $runtime.SimulatorPID
)) {

    if ($processId) {

        try {

            Stop-Process -Id $processId -Force

            Write-Host "Stopped Process $processId" -ForegroundColor Green

        }
        catch {

            Write-Host "Process $processId already stopped." -ForegroundColor Yellow

        }

    }

}

    Remove-Item $runtimeFile -Force

}
else {

    Write-Host "runtime.json not found."

}

Write-Host ""

Write-Host "Stopping Minikube..." -ForegroundColor Yellow

minikube stop

Write-Host ""

Write-Host "Project Stopped Successfully." -ForegroundColor Green