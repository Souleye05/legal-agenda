# Système de Rappels de Recours - Implémentation Complète ✅

## Vue d'ensemble

Système complet de gestion des rappels de recours après délibéré, avec rappels quotidiens jusqu'à effectuation.

## Fonctionnalités implémentées

### 1. Backend (NestJS + Prisma)

#### Base de données
- ✅ Migration `20260126150613_add_appeal_reminders` créée et appliquée
- ✅ Modèle `RappelRecours` avec :
  - Lien vers l'affaire
  - Lien optionnel vers le résultat d'audience
  - Date limite du recours
  - Statut (effectué/non effectué)
  - Date d'effectuation
  - Notes

#### Service (`appeals.service.ts`)
- ✅ `findAll()` - Récupère tous les rappels actifs
- ✅ `findCompleted()` - Récupère les rappels effectués
- ✅ `findOne(id)` - Récupère un rappel spécifique
- ✅ `create(dto, userId)` - Crée un nouveau rappel
- ✅ `update(id, dto, userId)` - Met à jour un rappel
- ✅ `markComplete(id, userId)` - Marque un rappel comme effectué
- ✅ `remove(id, userId)` - Supprime un rappel
- ✅ `calculateDefaultDeadline(date)` - Calcule la date limite par défaut (10 jours)

#### Contrôleur (`appeals.controller.ts`)
- ✅ `GET /api/appeals` - Liste des rappels actifs
- ✅ `GET /api/appeals/completed` - Liste des rappels effectués
- ✅ `GET /api/appeals/:id` - Détails d'un rappel
- ✅ `POST /api/appeals` - Créer un rappel
- ✅ `PUT /api/appeals/:id` - Mettre à jour un rappel
- ✅ `PUT /api/appeals/:id/complete` - Marquer comme effectué
- ✅ `DELETE /api/appeals/:id` - Supprimer un rappel

#### Intégration avec Hearings
- ✅ Service des audiences mis à jour pour créer automatiquement un rappel lors d'un délibéré
- ✅ DTOs mis à jour avec champs `creerRappelRecours`, `dateLimiteRecours`, `notesRecours`
- ✅ Module AppealsModule importé dans HearingsModule

### 2. Frontend (React + TypeScript)

#### Types et API
- ✅ Interface `AppealReminder` dans `types/api.ts`
- ✅ DTOs `CreateAppealReminderDto` et `UpdateAppealReminderDto`
- ✅ Méthodes API dans `api.ts` :
  - `getAppealReminders()`
  - `getCompletedAppealReminders()`
  - `getAppealReminder(id)`
  - `createAppealReminder(data)`
  - `updateAppealReminder(id, data)`
  - `markAppealReminderComplete(id)`
  - `deleteAppealReminder(id)`

#### Page principale (`AppealReminders.tsx`)
- ✅ Liste des rappels actifs avec statuts :
  - Expiré (rouge)
  - Aujourd'hui (orange urgent)
  - Urgent (≤ 3 jours, jaune)
  - À venir (gris)
- ✅ Décompte des jours restants
- ✅ Cartes statistiques (Expirés, Urgents, Effectués)
- ✅ Dialog de création avec :
  - Combobox de recherche d'affaire
  - Sélecteur de date limite
  - Champ notes optionnel
- ✅ Bouton "Marquer effectué"
- ✅ Section des rappels effectués (historique)
- ✅ Refresh automatique toutes les minutes

#### Composant Dashboard (`AppealReminders.tsx`)
- ✅ Affiche les 3 rappels les plus urgents
- ✅ Badges de statut colorés
- ✅ Lien vers la page complète
- ✅ Compteur si plus de 3 rappels

#### Intégration dans RecordHearingResult
- ✅ Checkbox "Créer un rappel de recours" (activée par défaut)
- ✅ Sélecteur de date limite (défaut : +10 jours)
- ✅ Champ notes optionnel
- ✅ Création automatique lors de l'enregistrement du délibéré

#### Navigation
- ✅ Route `/recours` ajoutée dans App.tsx
- ✅ Lien dans la sidebar avec icône Scale
- ✅ Badge de compteur dans la sidebar
- ✅ Composant ajouté au Dashboard

### 3. Caractéristiques clés

#### Rappels quotidiens
- Les rappels restent visibles jusqu'à ce qu'ils soient marqués comme effectués
- Pas de suppression automatique
- Affichage permanent dans la sidebar et le dashboard

#### Gestion des délais
- Délai par défaut : 10 jours après le délibéré
- Personnalisable lors de la création
- Décompte en jours restants
- Statuts visuels selon l'urgence

#### Expérience utilisateur
- Recherche d'affaire par référence, titre ou parties
- Interface intuitive avec badges colorés
- Statistiques en temps réel
- Historique des recours effectués
- Refresh automatique

## Structure des fichiers

### Backend
```
backend/
├── prisma/
│   ├── schema.prisma (modèle RappelRecours)
│   └── migrations/
│       └── 20260126150613_add_appeal_reminders/
│           └── migration.sql
└── src/
    └── appeals/
        ├── appeals.module.ts
        ├── appeals.service.ts
        ├── appeals.controller.ts
        └── dto/
            └── appeal.dto.ts
```

### Frontend
```
frontend/src/
├── types/
│   └── api.ts (AppealReminder interface)
├── lib/
│   └── api.ts (méthodes API)
├── pages/
│   ├── AppealReminders.tsx (page principale)
│   └── RecordHearingResult.tsx (intégration)
└── components/
    ├── dashboard/
    │   └── AppealReminders.tsx (widget dashboard)
    └── layout/
        ├── Sidebar.tsx (lien + badge)
        └── MainLayout.tsx (query compteur)
```

## Utilisation

### Créer un rappel automatiquement
1. Aller sur une audience
2. Cliquer "Renseigner le résultat"
3. Sélectionner "Délibéré"
4. Cocher "Créer un rappel de recours" (activé par défaut)
5. Ajuster la date limite si nécessaire (défaut : +10 jours)
6. Ajouter des notes optionnelles
7. Enregistrer

### Créer un rappel manuellement
1. Aller sur "Recours à faire"
2. Cliquer "Nouveau rappel"
3. Rechercher l'affaire concernée
4. Sélectionner la date limite
5. Ajouter des notes optionnelles
6. Créer

### Marquer un recours comme effectué
1. Aller sur "Recours à faire"
2. Trouver le rappel dans la liste
3. Cliquer "Marquer effectué"
4. Le rappel passe dans l'historique

## Tests recommandés

1. ✅ Créer un rappel lors d'un délibéré
2. ✅ Créer un rappel manuellement
3. ✅ Vérifier l'affichage dans le dashboard
4. ✅ Vérifier le badge dans la sidebar
5. ✅ Marquer un rappel comme effectué
6. ✅ Vérifier les statuts (expiré, urgent, à venir)
7. ✅ Tester la recherche d'affaire
8. ✅ Vérifier le refresh automatique

## Notes techniques

- Les rappels sont liés aux affaires, pas aux audiences
- Un rappel peut être créé sans résultat d'audience (création manuelle)
- Les rappels effectués sont conservés dans l'historique
- Le système utilise React Query pour le cache et le refresh automatique
- Les dates sont gérées avec date-fns pour la localisation française

## Prochaines améliorations possibles

- [ ] Notifications par email pour les rappels urgents
- [ ] Export PDF de la liste des recours
- [ ] Filtres avancés (par juridiction, par statut)
- [ ] Statistiques détaillées (taux de respect des délais)
- [ ] Rappels récurrents pour les recours complexes
