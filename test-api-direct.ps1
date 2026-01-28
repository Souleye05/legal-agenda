# Test direct de l'API pour voir ce qu'elle retourne

Write-Host "Test de l'API /cases sans pagination..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/cases" -Method GET -ErrorAction Stop
    
    if ($response -is [Array]) {
        Write-Host "✅ Reponse: TABLEAU (pas de pagination)" -ForegroundColor Green
        Write-Host "   Nombre d'affaires: $($response.Count)" -ForegroundColor White
    } else {
        Write-Host "❌ Reponse: OBJET PAGINE (pagination active)" -ForegroundColor Red
        Write-Host "   Nombre d'affaires: $($response.data.Count)" -ForegroundColor White
        Write-Host "   Total en base: $($response.meta.total)" -ForegroundColor White
        Write-Host "   Page: $($response.meta.page)" -ForegroundColor White
        Write-Host "   Limit: $($response.meta.limit)" -ForegroundColor White
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "❌ Erreur 401: Authentification requise" -ForegroundColor Red
        Write-Host "   Cette API necessite un token JWT" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}
