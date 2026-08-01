Write-Host ""
Write-Host "Restarting Project..."
Write-Host ""

& "$PSScriptRoot\stop_project.ps1"

Start-Sleep -Seconds 5

& "$PSScriptRoot\start_project.ps1"