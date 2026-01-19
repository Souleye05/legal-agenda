# Script PowerShell pour mettre le projet sur GitHub
# Legal Agenda - Setup GitHub

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SETUP GITHUB - LEGAL AGENDA" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Git est installé
Write-Host "Vérification de Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git installé : $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git n'est pas installé !" -ForegroundColor Red
    Write-Host "Téléchargez Git depuis : https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Vérifier si déjà initialisé
if (Test-Path ".git") {
    Write-Host "✓ Git déjà initialisé" -ForegroundColor Green
} else {
    Write-Host "Initialisation de Git..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git initialisé" -ForegroundColor Green
}
Write-Host ""

# Configuration Git
Write-Host "Configuration Git" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

$userName = git config --global user.name
$userEmail = git config --global user.email

if ([string]::IsNullOrEmpty($userName)) {
    Write-Host "Configuration du nom d'utilisateur..." -ForegroundColor Yellow
    $name = Read-Host "Entrez votre nom"
    git config --global user.name "$name"
    Write-Host "✓ Nom configuré : $name" -ForegroundColor Green
} else {
    Write-Host "✓ Nom déjà configuré : $userName" -ForegroundColor Green
}

if ([string]::IsNullOrEmpty($userEmail)) {
    Write-Host "Configuration de l'email..." -ForegroundColor Yellow
    $email = Read-Host "Entrez votre email GitHub"
    git config --global user.email "$email"
    Write-Host "✓ Email configuré : $email" -ForegroundColor Green
} else {
    Write-Host "✓ Email déjà configuré : $userEmail" -ForegroundColor Green
}
Write-Host ""

# Vérifier .gitignore
Write-Host "Vérification .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "✓ .gitignore présent" -ForegroundColor Green
} else {
    Write-Host "✗ .gitignore manquant !" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Vérifier qu'il n'y a pas de .env
Write-Host "Vérification des fichiers sensibles..." -ForegroundColor Yellow
$envFiles = Get-ChildItem -Path . -Filter ".env" -Recurse -File | Where-Object { $_.Name -eq ".env" }
if ($envFiles.Count -gt 0) {
    Write-Host "⚠️  ATTENTION : Fichiers .env détectés !" -ForegroundColor Red
    Write-Host "Ces fichiers ne doivent PAS être commités !" -ForegroundColor Red
    Write-Host ""
    foreach ($file in $envFiles) {
        Write-Host "  - $($file.FullName)" -ForegroundColor Yellow
    }
    Write-Host ""
    $continue = Read-Host "Continuer quand même ? (oui/non)"
    if ($continue -ne "oui") {
        Write-Host "Annulé." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✓ Pas de fichiers .env détectés" -ForegroundColor Green
}
Write-Host ""

# Ajouter les fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .
Write-Host "✓ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Afficher le statut
Write-Host "Statut Git :" -ForegroundColor Cyan
git status --short
Write-Host ""

# Créer le commit
Write-Host "Création du commit..." -ForegroundColor Yellow
$commitMessage = Read-Host "Message du commit (ou Entrée pour 'Initial commit')"
if ([string]::IsNullOrEmpty($commitMessage)) {
    $commitMessage = "Initial commit - Legal Agenda Application"
}
git commit -m "$commitMessage"
Write-Host "✓ Commit créé" -ForegroundColor Green
Write-Host ""

# Demander l'URL du dépôt
Write-Host "Configuration du dépôt distant" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "Créez d'abord un dépôt sur GitHub :" -ForegroundColor Yellow
Write-Host "  1. Allez sur https://github.com/new" -ForegroundColor White
Write-Host "  2. Nom : legal-agenda" -ForegroundColor White
Write-Host "  3. Visibilité : Private (recommandé)" -ForegroundColor White
Write-Host "  4. NE PAS cocher 'Initialize with README'" -ForegroundColor White
Write-Host "  5. Cliquez sur 'Create repository'" -ForegroundColor White
Write-Host ""

$repoUrl = Read-Host "Entrez l'URL du dépôt (ex: https://github.com/username/legal-agenda.git)"

if ([string]::IsNullOrEmpty($repoUrl)) {
    Write-Host "✗ URL non fournie" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour ajouter le remote plus tard :" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/username/legal-agenda.git" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
    exit 0
}

# Vérifier si remote existe déjà
$remoteExists = git remote | Select-String -Pattern "origin"
if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' existe déjà" -ForegroundColor Yellow
    $replace = Read-Host "Remplacer ? (oui/non)"
    if ($replace -eq "oui") {
        git remote remove origin
        git remote add origin $repoUrl
        Write-Host "✓ Remote remplacé" -ForegroundColor Green
    }
} else {
    git remote add origin $repoUrl
    Write-Host "✓ Remote ajouté" -ForegroundColor Green
}
Write-Host ""

# Renommer la branche en main
Write-Host "Configuration de la branche..." -ForegroundColor Yellow
git branch -M main
Write-Host "✓ Branche renommée en 'main'" -ForegroundColor Green
Write-Host ""

# Pousser le code
Write-Host "Push vers GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Si demande d'authentification :" -ForegroundColor Yellow
Write-Host "  - Username : votre username GitHub" -ForegroundColor White
Write-Host "  - Password : utilisez un Personal Access Token" -ForegroundColor White
Write-Host "    (pas votre mot de passe GitHub !)" -ForegroundColor White
Write-Host ""
Write-Host "Pour créer un token :" -ForegroundColor Yellow
Write-Host "  https://github.com/settings/tokens/new" -ForegroundColor White
Write-Host "  Permissions : repo (tous)" -ForegroundColor White
Write-Host ""

$push = Read-Host "Pousser maintenant ? (oui/non)"
if ($push -eq "oui") {
    try {
        git push -u origin main
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  ✓ SUCCÈS !" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "Votre projet est maintenant sur GitHub ! 🎉" -ForegroundColor Green
        Write-Host ""
        Write-Host "URL du dépôt : $repoUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Prochaines étapes :" -ForegroundColor Yellow
        Write-Host "  1. Vérifier sur GitHub que tout est là" -ForegroundColor White
        Write-Host "  2. Inviter des collaborateurs (Settings → Collaborators)" -ForegroundColor White
        Write-Host "  3. Voir DEPLOY.md pour déployer en production" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host ""
        Write-Host "✗ Erreur lors du push" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Host "Pour pousser manuellement :" -ForegroundColor Yellow
        Write-Host "  git push -u origin main" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "Pour pousser plus tard :" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TERMINÉ" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
