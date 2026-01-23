Write-Host "Nettoyage du cache Vite..." -ForegroundColor Cyan

Set-Location frontend

Write-Host "Suppression du dossier .vite..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

Write-Host "Suppression du dossier dist..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Cache nettoyé avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant relancer: npm run dev" -ForegroundColor Cyan
