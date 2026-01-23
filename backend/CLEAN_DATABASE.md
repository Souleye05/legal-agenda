# 🧹 Guide de Nettoyage de la Base de Données

## Options Disponibles

### Option 1 : Réinitialisation Complète (Recommandé)

**Supprime TOUTES les données et recrée les tables vides :**

```powershell
cd backend
npx prisma migrate reset --force
```

**Résultat :**
- ✅ Toutes les données supprimées
- ✅ Tables recréées
- ✅ Base vide (pas de seed)
- ✅ Parfait pour tester le premier utilisateur admin

**Quand l'utiliser :**
- Pour tester le système de gestion des utilisateurs
- Pour repartir de zéro
- Avant de déployer en production

---

### Option 2 : Supprimer Uniquement les Données du Seed

**Supprime seulement les utilisateurs créés par le seed :**

```powershell
cd backend
npm run prisma:clean
```

**Résultat :**
- ✅ Utilisateurs du seed supprimés :
  - `admin@legalagenda.com`
  - `collaborateur@legalagenda.com`
- ✅ Affaires et audiences liées supprimées (cascade)
- ✅ Garde les autres données que vous avez créées

**Quand l'utiliser :**
- Vous avez créé des données de test que vous voulez garder
- Vous voulez juste supprimer les utilisateurs par défaut
- Vous voulez recréer le seed avec de nouvelles données

---

### Option 3 : Recréer le Seed

**Supprime les données du seed puis les recrée :**

```powershell
cd backend
npm run prisma:clean
npm run prisma:seed
```

**Résultat :**
- ✅ Anciennes données du seed supprimées
- ✅ Nouvelles données du seed créées
- ✅ Utilisateurs par défaut disponibles

**Quand l'utiliser :**
- Vous avez modifié le fichier `seed.ts`
- Vous voulez réinitialiser les données de démo
- Vous voulez avoir des utilisateurs de test

---

## 🎯 Scénarios d'Utilisation

### Scénario 1 : Tester le Premier Utilisateur Admin

```powershell
# 1. Réinitialiser complètement
cd backend
npx prisma migrate reset --force

# 2. Démarrer le backend
npm run start:dev

# 3. Aller sur le frontend et créer le premier compte
# → Il deviendra automatiquement admin
```

### Scénario 2 : Nettoyer pour la Production

```powershell
# 1. Réinitialiser complètement
cd backend
npx prisma migrate reset --force

# 2. Vérifier que la base est vide
npx prisma studio

# 3. Déployer
# Le premier utilisateur qui s'inscrit sera l'admin
```

### Scénario 3 : Garder Vos Données, Supprimer le Seed

```powershell
# 1. Supprimer uniquement les données du seed
cd backend
npm run prisma:clean

# 2. Vos données personnelles sont conservées
# 3. Les utilisateurs du seed sont supprimés
```

### Scénario 4 : Réinitialiser les Données de Démo

```powershell
# 1. Supprimer les anciennes données du seed
cd backend
npm run prisma:clean

# 2. Recréer les données du seed
npm run prisma:seed

# 3. Utilisateurs disponibles :
# - admin@legalagenda.com / admin123
# - collaborateur@legalagenda.com / collab123
```

---

## 📊 Comparaison des Options

| Commande | Supprime Tout | Garde Vos Données | Recrée Tables | Exécute Seed |
|----------|---------------|-------------------|---------------|--------------|
| `prisma migrate reset --force` | ✅ Oui | ❌ Non | ✅ Oui | ❌ Non |
| `npm run prisma:clean` | ❌ Non | ✅ Oui | ❌ Non | ❌ Non |
| `npm run prisma:seed` | ❌ Non | ✅ Oui | ❌ Non | ✅ Oui |

---

## 🔍 Vérifier l'État de la Base

### Ouvrir Prisma Studio
```powershell
cd backend
npx prisma studio
```

Ouvre une interface web sur http://localhost:5555 pour voir toutes les données.

### Compter les Utilisateurs
```powershell
cd backend
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM utilisateurs;"
```

---

## ⚠️ Avertissements

### Réinitialisation Complète
```powershell
npx prisma migrate reset --force
```
**ATTENTION :** Cette commande supprime **TOUTES** les données de manière **IRRÉVERSIBLE** !

- ❌ Toutes les affaires supprimées
- ❌ Toutes les audiences supprimées
- ❌ Tous les utilisateurs supprimés
- ❌ Tout l'historique supprimé

**À utiliser uniquement :**
- En développement
- Pour les tests
- Quand vous êtes sûr de vouloir tout supprimer

### En Production
**NE JAMAIS** utiliser `prisma migrate reset` en production !

Pour la production, utilisez plutôt :
```powershell
# Créer une migration pour supprimer des données spécifiques
npx prisma migrate dev --name remove_test_data
```

---

## 🛠️ Dépannage

### Erreur : "Database is locked"
**Solution :** Arrêter le backend avant de nettoyer
```powershell
# Arrêter le backend (Ctrl+C)
# Puis exécuter la commande de nettoyage
```

### Erreur : "Cannot find module 'ts-node'"
**Solution :** Installer ts-node
```powershell
npm install -D ts-node
```

### Erreur : "Connection refused"
**Solution :** Vérifier que PostgreSQL est démarré
```powershell
# Vérifier le fichier .env
# DATABASE_URL doit pointer vers votre base
```

---

## 📝 Résumé Rapide

**Pour tester le premier admin :**
```powershell
npx prisma migrate reset --force
```

**Pour supprimer juste le seed :**
```powershell
npm run prisma:clean
```

**Pour recréer le seed :**
```powershell
npm run prisma:clean && npm run prisma:seed
```

**Pour voir les données :**
```powershell
npx prisma studio
```

---

**Bon nettoyage ! 🧹**
