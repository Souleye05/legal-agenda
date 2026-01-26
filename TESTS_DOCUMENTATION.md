# Documentation des Tests - Système de Rappels de Recours

## Vue d'ensemble

Cette documentation décrit tous les tests unitaires et d'intégration créés pour le système de rappels de recours.

## Tests Backend

### Tests Unitaires

#### 1. `appeals.service.spec.ts`

Tests du service AppealsService avec mocks de PrismaService et AuditService.

**Tests couverts :**
- ✅ Service initialization
- ✅ `findAll()` - Récupération de tous les rappels actifs
- ✅ `findAll()` - Retour d'un tableau vide si aucun rappel
- ✅ `findCompleted()` - Récupération des rappels effectués
- ✅ `findOne()` - Récupération d'un rappel spécifique
- ✅ `findOne()` - Exception NotFoundException si rappel introuvable
- ✅ `create()` - Création d'un nouveau rappel
- ✅ `create()` - Logging d'audit lors de la création
- ✅ `update()` - Mise à jour d'un rappel
- ✅ `update()` - Marquage comme effectué avec date
- ✅ `markComplete()` - Marquage d'un rappel comme effectué
- ✅ `remove()` - Suppression d'un rappel
- ✅ `remove()` - Logging d'audit lors de la suppression
- ✅ `calculateDefaultDeadline()` - Calcul de la date limite (+10 jours)

**Commande :**
```bash
cd backend
npm test -- appeals.service.spec.ts
```

#### 2. `appeals.controller.spec.ts`

Tests du contrôleur AppealsController avec mock du service.

**Tests couverts :**
- ✅ Controller initialization
- ✅ `GET /appeals` - Liste des rappels actifs
- ✅ `GET /appeals/completed` - Liste des rappels effectués
- ✅ `GET /appeals/:id` - Détails d'un rappel
- ✅ `POST /appeals` - Création d'un rappel
- ✅ `PUT /appeals/:id` - Mise à jour d'un rappel
- ✅ `PUT /appeals/:id/complete` - Marquage comme effectué
- ✅ `DELETE /appeals/:id` - Suppression d'un rappel
- ✅ Extraction correcte du userId depuis la requête

**Commande :**
```bash
cd backend
npm test -- appeals.controller.spec.ts
```

### Tests d'Intégration E2E

#### 3. `appeals.e2e-spec.ts`

Tests end-to-end complets avec base de données réelle.

**Tests couverts :**
- ✅ Setup : Création d'utilisateur et affaire de test
- ✅ `POST /appeals` - Création réussie d'un rappel
- ✅ `POST /appeals` - Échec sans authentification (401)
- ✅ `POST /appeals` - Échec avec données invalides (400)
- ✅ `GET /appeals` - Récupération de tous les rappels actifs
- ✅ `GET /appeals` - Échec sans authentification (401)
- ✅ `GET /appeals/:id` - Récupération d'un rappel spécifique
- ✅ `GET /appeals/:id` - 404 pour rappel inexistant
- ✅ `PUT /appeals/:id` - Mise à jour des notes
- ✅ `PUT /appeals/:id` - Mise à jour de la date limite
- ✅ `PUT /appeals/:id/complete` - Marquage comme effectué
- ✅ `GET /appeals/completed` - Liste des rappels effectués
- ✅ `DELETE /appeals/:id` - Suppression d'un rappel
- ✅ `DELETE /appeals/:id` - Vérification de la suppression (404)
- ✅ **Intégration avec Hearings** - Création automatique lors d'un DELIBERE

**Commande :**
```bash
cd backend
npm run test:e2e -- appeals.e2e-spec.ts
```

**Note :** Nécessite une base de données PostgreSQL de test configurée.

## Tests Frontend

### Tests Unitaires

#### 4. `AppealReminders.test.tsx`

Tests de la page principale AppealReminders.

**Tests couverts :**
- ✅ Rendu du titre de la page
- ✅ Affichage de l'état de chargement
- ✅ Affichage des rappels après chargement
- ✅ Cartes statistiques avec compteurs corrects
- ✅ Badges de statut (Expiré, Urgent, À venir)
- ✅ Texte de décompte des jours
- ✅ Ouverture du dialog de création
- ✅ Section des rappels effectués
- ✅ Appel de `markComplete` au clic
- ✅ État vide quand aucun rappel
- ✅ Filtrage des affaires dans le combobox

**Commande :**
```bash
cd frontend
npm test -- AppealReminders.test.tsx
```

#### 5. `AppealReminders.dashboard.test.tsx`

Tests du composant Dashboard pour les rappels urgents.

**Tests couverts :**
- ✅ Non-affichage si aucun rappel urgent
- ✅ Affichage des rappels urgents
- ✅ Badge "Expiré" pour rappels expirés
- ✅ Badge "Aujourd'hui" pour rappels du jour
- ✅ Badge "Urgent" pour rappels ≤ 3 jours
- ✅ Limitation à 3 rappels affichés
- ✅ Bouton "Voir tout" si plus de 3 rappels
- ✅ Non-affichage des rappels non urgents (>3 jours)

**Commande :**
```bash
cd frontend
npm test -- AppealReminders.dashboard.test.tsx
```

### Tests d'Intégration

#### 6. `RecordHearingResult.integration.test.tsx`

Tests d'intégration de la création de rappels depuis RecordHearingResult.

**Tests couverts :**
- ✅ Affichage de la checkbox pour type DELIBERE
- ✅ Checkbox cochée par défaut
- ✅ Affichage des champs de rappel quand checkbox cochée
- ✅ Masquage des champs quand checkbox décochée
- ✅ Non-affichage pour type RENVOI
- ✅ Non-affichage pour type RADIATION
- ✅ Soumission avec données de rappel pour DELIBERE
- ✅ Non-soumission des données si checkbox décochée
- ✅ Inclusion des notes personnalisées
- ✅ Validation des champs obligatoires

**Commande :**
```bash
cd frontend
npm test -- RecordHearingResult.integration.test.tsx
```

## Exécution de tous les tests

### Backend

```bash
cd backend

# Tests unitaires
npm test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend

```bash
cd frontend

# Tous les tests
npm test

# Mode watch
npm test -- --watch

# Coverage
npm test -- --coverage
```

## Configuration requise

### Backend
- Node.js 18+
- PostgreSQL (pour tests E2E)
- Variables d'environnement de test configurées

### Frontend
- Node.js 18+
- Vitest configuré
- React Testing Library

## Couverture de code

### Objectifs de couverture

- **Backend :**
  - Statements : > 80%
  - Branches : > 75%
  - Functions : > 80%
  - Lines : > 80%

- **Frontend :**
  - Statements : > 70%
  - Branches : > 65%
  - Functions : > 70%
  - Lines : > 70%

## Scénarios de test clés

### 1. Création automatique de rappel
**Scénario :** Lors de l'enregistrement d'un délibéré, un rappel est créé automatiquement.
- Test E2E : `appeals.e2e-spec.ts` - "Integration with Hearings"
- Test Frontend : `RecordHearingResult.integration.test.tsx`

### 2. Gestion des statuts urgents
**Scénario :** Les rappels sont classés par urgence (expiré, aujourd'hui, urgent, à venir).
- Test Frontend : `AppealReminders.dashboard.test.tsx`
- Test Frontend : `AppealReminders.test.tsx`

### 3. Marquage comme effectué
**Scénario :** Un utilisateur marque un rappel comme effectué.
- Test Backend : `appeals.service.spec.ts` - "markComplete"
- Test E2E : `appeals.e2e-spec.ts` - "PUT /appeals/:id/complete"
- Test Frontend : `AppealReminders.test.tsx`

### 4. Calcul de la date limite
**Scénario :** La date limite est calculée à 10 jours après le délibéré.
- Test Backend : `appeals.service.spec.ts` - "calculateDefaultDeadline"

## Mocking et fixtures

### Backend
- **PrismaService** : Mocké pour les tests unitaires
- **AuditService** : Mocké pour les tests unitaires
- **Base de données** : Réelle pour les tests E2E (nettoyée avant/après)

### Frontend
- **API calls** : Mockées avec Vitest
- **React Router** : Mocké avec BrowserRouter de test
- **Toast notifications** : Mockées avec Sonner

## Bonnes pratiques

1. **Isolation** : Chaque test est indépendant
2. **Cleanup** : Les données de test sont nettoyées après chaque test
3. **Mocks** : Utilisation de mocks pour les dépendances externes
4. **Assertions** : Assertions claires et spécifiques
5. **Coverage** : Viser une couverture élevée mais significative

## Dépannage

### Tests backend qui échouent
- Vérifier que PostgreSQL est démarré
- Vérifier les variables d'environnement
- Nettoyer la base de données de test

### Tests frontend qui échouent
- Vérifier que les dépendances sont installées
- Nettoyer le cache : `npm run test -- --clearCache`
- Vérifier les mocks dans `__mocks__`

## Prochaines étapes

- [ ] Ajouter tests de performance
- [ ] Ajouter tests de sécurité
- [ ] Ajouter tests d'accessibilité
- [ ] Augmenter la couverture à 90%+
- [ ] Ajouter tests de régression visuelle
