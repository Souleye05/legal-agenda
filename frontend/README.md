# Legal Agenda Frontend

Interface utilisateur moderne pour l'application d'agenda juridique collaborative.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20+
- npm

### Installation

```bash
cd frontend
npm install
```

### Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec l'URL de votre backend
# VITE_API_URL=http://localhost:3001/api
```

### Développement

```bash
# Démarrer le serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:5173
```

### Build Production

```bash
# Build pour production
npm run build

# Preview du build
npm run preview
```

## 🏗️ Stack Technique

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **shadcn/ui** - Composants UI (Radix UI + Tailwind CSS)
- **React Router v6** - Routing
- **React Query** - Gestion état serveur
- **React Hook Form** - Gestion formulaires
- **Zod** - Validation
- **date-fns** - Manipulation dates
- **Tailwind CSS** - Styling

## 📁 Structure

```
frontend/src/
├── components/
│   ├── ui/              # Composants shadcn/ui
│   ├── layout/          # Layout (MainLayout, Sidebar, PageHeader)
│   ├── cases/           # Composants affaires
│   ├── hearings/        # Composants audiences
│   ├── dashboard/       # Composants tableau de bord
│   └── calendar/        # Composants calendrier
├── pages/
│   ├── Index.tsx        # Dashboard (/)
│   ├── Cases.tsx        # Liste affaires (/affaires)
│   ├── Agenda.tsx       # Calendrier (/agenda)
│   ├── UnreportedHearings.tsx  # À renseigner (/a-renseigner)
│   └── TomorrowHearings.tsx    # Demain (/demain)
├── lib/
│   ├── api.ts           # Client API
│   ├── utils.ts         # Utilitaires
│   └── mock-data.ts     # Données de test
├── types/
│   └── legal.ts         # Types TypeScript
├── hooks/
│   └── use-toast.ts     # Hooks personnalisés
├── App.tsx              # Composant racine
└── main.tsx             # Point d'entrée
```

## 🔌 API Client

Le client API (`src/lib/api.ts`) fournit toutes les méthodes pour communiquer avec le backend :

```typescript
import { api } from '@/lib/api';

// Authentification
await api.login(email, password);
await api.register(email, password, fullName);

// Affaires
const cases = await api.getCases();
const caseData = await api.getCase(id);
await api.createCase(data);

// Audiences
const hearings = await api.getHearings();
const unreported = await api.getUnreportedHearings();
const tomorrow = await api.getTomorrowHearings();
await api.recordHearingResult(id, result);
```

## 🎨 Composants UI

L'application utilise **shadcn/ui** pour les composants :

```bash
# Ajouter un nouveau composant
npx shadcn-ui@latest add [component-name]
```

Composants disponibles :
- Button, Card, Dialog, Form, Input, Select
- Table, Tabs, Toast, Tooltip
- Calendar, Dropdown, Sheet, Sidebar
- Et 40+ autres composants

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch
```

## 📝 Linting

```bash
# Linter
npm run lint

# Fix automatique
npm run lint -- --fix
```

## 🎯 Pages principales

### Dashboard (/)
- Statistiques en temps réel
- Affaires actives
- Audiences à venir
- Alertes urgentes
- Actions rapides

### Affaires (/affaires)
- Liste de toutes les affaires
- Filtrage par statut
- Recherche
- Création/modification

### Agenda (/agenda)
- Vue calendrier mensuelle
- Liste des audiences
- Filtrage par date/type
- Création d'audiences

### À renseigner (/a-renseigner)
- Audiences passées non renseignées
- Affichage urgent
- Renseignement rapide des résultats

### Audiences de demain (/demain)
- Liste des audiences du lendemain
- Notes de préparation
- Marquer comme préparée

## 🔐 Authentification

L'authentification utilise JWT stocké dans localStorage :

```typescript
// Login
const { access_token, user } = await api.login(email, password);
// Token automatiquement stocké

// Logout
api.logout();
// Token automatiquement supprimé
```

Toutes les requêtes API incluent automatiquement le token JWT.

## 🎨 Personnalisation

### Thème
Modifier `src/index.css` pour personnaliser les couleurs :

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... */
}
```

### Juridictions et Chambres
Modifier `src/lib/mock-data.ts` :

```typescript
export const jurisdictionOptions = [
  'Tribunal Judiciaire',
  'Tribunal de Commerce',
  // Ajouter vos juridictions
];

export const chamberOptions = [
  'Chambre civile',
  'Chambre commerciale',
  // Ajouter vos chambres
];
```

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Production
vercel --prod
```

### Netlify

```bash
# Build
npm run build

# Déployer le dossier dist/
```

### Variables d'environnement production

```env
VITE_API_URL=https://your-backend-api.com/api
```

## 🐳 Docker

```bash
# Build
docker build -t legal-agenda-frontend .

# Run
docker run -p 5173:5173 legal-agenda-frontend
```

## 📚 Documentation

- **shadcn/ui** : https://ui.shadcn.com
- **React** : https://react.dev
- **Vite** : https://vitejs.dev
- **Tailwind CSS** : https://tailwindcss.com
- **React Router** : https://reactrouter.com

## 🆘 Dépannage

### Port déjà utilisé
```bash
# Changer le port dans vite.config.ts
server: {
  port: 3000
}
```

### Erreurs de build
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### API non accessible
```bash
# Vérifier VITE_API_URL dans .env
# Vérifier que le backend tourne
curl http://localhost:3001/api
```

## 💡 Astuces

### Développement rapide
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd ../backend && npm run start:dev
```

### Hot Module Replacement
Vite supporte le HMR - les modifications sont visibles instantanément sans recharger la page.

### TypeScript
Tous les types sont dans `src/types/legal.ts` et synchronisés avec le backend.

---

**Frontend développé avec React + TypeScript + shadcn/ui**
