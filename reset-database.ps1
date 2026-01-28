# Script pour réinitialiser la base de données avec les nouvelles données de seed

Write-Host "🗑️  Nettoyage de la base de données..." -ForegroundColor Yellow

# Aller dans le dossier backend
Set-Location backend

# Reset de la base de données
Write-Host "`n📦 Reset de la base de données..." -ForegroundColor Cyan
npx prisma migrate reset --force

Write-Host "`n✅ Base de données réinitialisée avec succès!" -ForegroundColor Green
Write-Host "`n📊 Données créées:" -ForegroundColor Cyan
Write-Host "   - 2 utilisateurs (admin + collaborateur)" -ForegroundColor White
Write-Host "   - 9 affaires (8 actives + 1 clôturée)" -ForegroundColor White
Write-Host "   - 5 audiences (2 demain, 2 semaine prochaine, 1 passée non renseignée)" -ForegroundColor White
Write-Host "`n🔑 Identifiants de connexion:" -ForegroundColor Cyan
Write-Host "   Admin: admin@legalagenda.com / admin123" -ForegroundColor White
Write-Host "   Collaborateur: collaborateur@legalagenda.com / collab123" -ForegroundColor White
Write-Host "`n💡 Le Dashboard devrait afficher 8 affaires actives" -ForegroundColor Green

# Retour au dossier racine
Set-Location ..
