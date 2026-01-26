# Système de Rappel d'Enrôlement - Implémentation

## Résumé
Implémentation complète d'un système de rappel d'enrôlement pour les audiences à venir, avec calcul automatique de la date de rappel (4 jours ouvrables avant l'audience).

## Fonctionnalités Implémentées

### Backend

#### 1. Base de Données (Prisma Schema)
**Fichier:** `backend/prisma/schema.prisma`

Ajout de champs au modèle Audience :
```prisma
model Audience {
  // ... champs existants
  rappelEnrolement  Boolean        @default(false)
  dateRappelEnrolement DateTime?   // Date calculée: 4 jours ouvrables avant
  
  @@index([rappelEnrolement, dateRappelEnrolement])
}
```

**Migration créée:** `20260125220423_add_enrollment_reminder`

#### 2. Utilitaires de Calcul
**Fichier:** `backend/src/hearings/utils/enrollment-reminder.util.ts`

Fonctions créées :
- `calculateEnrollmentReminderDate(hearingDate)` - Calcule 4 jours ouvrables avant
- `shouldShowEnrollmentReminder(hearingDate, reminderDate)` - Vérifie si rappel actif
- `getDaysUntilHearing(hearingDate)` - Compte les jours restants

**Logique des jours ouvrables :**
- Lundi à Vendredi = jours ouvrables
- Samedi et Dimanche = exclus du calcul
- Remonte dans le temps jusqu'à trouver 4 jours ouvrables

#### 3. Service Hearings
**Fichier:** `backend/src/hearings/hearings.service.ts`

**Modifications :**
- `create()` - Calcule et enregistre dateRappelEnrolement si rappelEnrolement=true
- `update()` - Recalcule la date si date d'audience ou rappel modifié
- `getEnrollmentReminders()` - Nouvelle méthode pour récupérer les rappels actifs

**Filtrage intelligent :**
```typescript
// Récupère uniquement les rappels à afficher aujourd'hui
hearings.filter(hearing => 
  shouldShowEnrollmentReminder(hearing.date, hearing.dateRappelEnrolement)
)
```

#### 4. DTOs
**Fichier:** `backend/src/hearings/dto/hearing.dto.ts`

Ajout du champ `rappelEnrolement?: boolean` dans :
- `CreateHearingDto`
- `UpdateHearingDto`

#### 5. Controller
**Fichier:** `backend/src/hearings/hearings.controller.ts`

Nouvel endpoint :
```typescript
GET /hearings/enrollment-reminders
```

### Frontend

#### 1. Types API
**Fichier:** `frontend/src/types/api.ts`

Ajout dans `Hearing` interface :
```typescript
rappelEnrolement: boolean;
dateRappelEnrolement?: string;
```

Ajout dans DTOs :
```typescript
CreateHearingDto { rappelEnrolement?: boolean }
UpdateHearingDto { rappelEnrolement?: boolean }
```

#### 2. Client API
**Fichier:** `frontend/src/lib/api.ts`

Nouvelle méthode :
```typescript
async getEnrollmentReminders(): Promise<Hearing[]>
```

#### 3. Page Rappels d'Enrôlement
**Fichier:** `frontend/src/pages/EnrollementReminders.tsx`

**État actuel :** Page existe avec UI complète mais utilise données mock
**À faire :** Connecter à l'API réelle

**Fonctionnalités UI :**
- Cartes de statistiques (En retard, Aujourd'hui, Effectués)
- Liste des rappels en attente avec badges de statut
- Bouton "Marquer effectué" pour chaque rappel
- Affichage des rappels complétés
- Calcul automatique des jours restants (J-X)
- Codes couleur selon urgence

#### 4. Formulaire Nouvelle Audience
**Fichier:** `frontend/src/pages/NewHearing.tsx`

**À ajouter :** Checkbox "Rappel d'enrôlement (4 jours ouvrables avant)"

#### 5. Dashboard
**À faire :** Afficher les rappels d'enrôlement dans le tableau de bord

## Workflow Utilisateur

### Création d'Audience avec Rappel

1. Utilisateur crée une nouvelle audience
2. Coche "Rappel d'enrôlement"
3. Backend calcule automatiquement la date de rappel (4 jours ouvrables avant)
4. Rappel enregistré en base de données

### Affichage des Rappels

1. Utilisateur accède à "Rappels enrôlement" ou Dashboard
2. Frontend appelle `/hearings/enrollment-reminders`
3. Backend filtre les audiences :
   - `rappelEnrolement = true`
   - `dateRappelEnrolement` non null
   - `statut = A_VENIR`
   - Date rappel <= Aujourd'hui < Date audience
4. Affichage avec badges de statut :
   - **En retard** : Date rappel < Aujourd'hui
   - **Aujourd'hui** : Date rappel = Aujourd'hui
   - **À venir** : Date rappel > Aujourd'hui

### Marquer comme Effectué

1. Utilisateur clique "Marquer effectué"
2. Frontend met à jour l'état local (pour l'instant)
3. **À implémenter :** Appel API pour persister l'état

## Exemples de Calcul

### Exemple 1 : Audience un Mercredi
- Audience : Mercredi 29 janvier 2026
- 4 jours ouvrables avant :
  - J-1 : Mardi 28
  - J-2 : Lundi 27
  - J-3 : Vendredi 24
  - J-4 : Jeudi 23
- **Date rappel : Jeudi 23 janvier 2026**

### Exemple 2 : Audience un Lundi
- Audience : Lundi 27 janvier 2026
- 4 jours ouvrables avant :
  - J-1 : Vendredi 24
  - J-2 : Jeudi 23
  - J-3 : Mercredi 22
  - J-4 : Mardi 21
- **Date rappel : Mardi 21 janvier 2026**

### Exemple 3 : Audience après un weekend
- Audience : Lundi 3 février 2026
- 4 jours ouvrables avant :
  - J-1 : Vendredi 30 janvier
  - J-2 : Jeudi 29 janvier
  - J-3 : Mercredi 28 janvier
  - J-4 : Mardi 27 janvier
- **Date rappel : Mardi 27 janvier 2026**

## Fichiers Modifiés/Créés

### Backend (7 fichiers)
1. ✅ `backend/prisma/schema.prisma` - Ajout champs rappel
2. ✅ `backend/prisma/migrations/20260125220423_add_enrollment_reminder/migration.sql` - Migration
3. ✅ `backend/src/hearings/utils/enrollment-reminder.util.ts` - Utilitaires (nouveau)
4. ✅ `backend/src/hearings/hearings.service.ts` - Logique métier
5. ✅ `backend/src/hearings/dto/hearing.dto.ts` - DTOs
6. ✅ `backend/src/hearings/hearings.controller.ts` - Endpoint API

### Frontend (4 fichiers)
7. ✅ `frontend/src/types/api.ts` - Types TypeScript
8. ✅ `frontend/src/lib/api.ts` - Client API
9. ⏳ `frontend/src/pages/EnrollementReminders.tsx` - Page (à connecter à l'API)
10. ⏳ `frontend/src/pages/NewHearing.tsx` - Formulaire (à ajouter checkbox)

## Tâches Restantes

### Frontend
1. ⏳ Ajouter checkbox "Rappel d'enrôlement" dans NewHearing.tsx
2. ⏳ Connecter EnrollementReminders.tsx à l'API réelle
3. ⏳ Ajouter section rappels dans Dashboard.tsx
4. ⏳ Ajouter route dans App.tsx si nécessaire
5. ⏳ Ajouter lien dans Sidebar.tsx si nécessaire
6. ⏳ Implémenter persistance "Marquer effectué" (optionnel)

### Tests
7. ⏳ Tester calcul 4 jours ouvrables
8. ⏳ Tester création audience avec rappel
9. ⏳ Tester affichage des rappels
10. ⏳ Tester filtrage par date

## Améliorations Futures

1. **Notifications** : Envoyer email/SMS le jour du rappel
2. **Personnalisation** : Permettre de choisir le nombre de jours
3. **Historique** : Garder trace des rappels effectués
4. **Récurrence** : Rappels multiples (J-7, J-4, J-1)
5. **Jours fériés** : Exclure les jours fériés du calcul
6. **Statut persistant** : Enregistrer "effectué" en base de données

## Statut Global
🟡 **EN COURS** - Backend complet, Frontend partiellement implémenté
