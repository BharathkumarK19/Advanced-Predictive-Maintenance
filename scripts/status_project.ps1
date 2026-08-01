$Namespace = "predictive-maintenance"

Write-Host ""
Write-Host "===================================="
Write-Host " Predictive Maintenance Status"
Write-Host "===================================="
Write-Host ""

Write-Host "Minikube:"
minikube status

Write-Host ""
Write-Host "Pods:"
kubectl get pods -n $Namespace

Write-Host ""
Write-Host "Services:"
kubectl get svc -n $Namespace