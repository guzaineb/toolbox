# ProjectStruct

Plateforme SaaS d'accompagnement et de structuration de projets entrepreneuriaux — de l'idée au lancement.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌────────────┐
│  Frontend    │────▶│  Backend API │────▶│ PostgreSQL │
│  Next.js 16  │     │  NestJS 11   │     │    PG 15   │
│  Port 3001   │     │  Port 3000   │     │  Port 5432 │
└──────────────┘     └──────────────┘     └────────────┘
```

- **Frontend** : Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript
- **Backend** : NestJS 11 modulaire, TypeORM, JWT, PostgreSQL
- **Déploiement** : Docker Compose (3 services : `db`, `api`, `web`)

## Fonctionnalités

### Sprint 1 — Socle
- Inscription/Connexion avec vérification email
- Gestion des profils : Porteur de projet, Expert, Incubateur
- Système d'experts avec matching et scoring
- Gestion des incubateurs (membres, documents, vérification)
- Envoi d'emails transactionnels (bienvenue, invitation, vérification)

### Sprint 2 — Parcours Entrepreneurial (13 étapes)
- Dashboard porteur de projet avec suivi d'avancement
- **13 étapes guidées** : Idéation → Validation → Business Model → Business Plan → Juridique → Financement → Développement → Marketing → Lancement → Suivi → Croissance
- Contenu pédagogique riche : objectifs, concepts clés, conseils, exemples, questions guidées
- Outils d'analyse intégrés : SWOT (2×2), PESTEL (2×3), Business Model Canvas (9 blocs)
- Assistant IA pour suggestions et questions
- Auto-save, checklist interactive, progression visuelle
- Workflow de soumission et revue par incubateur

## Démarrage rapide

### Avec Docker (recommandé)

```bash
# Créer le réseau
docker network create toolbox_net

# Lancer tous les services
docker compose up -d

# Frontend : http://localhost:3021
# API       : http://localhost:3020
```

### Sans Docker

**Backend**

```bash
cd backend
cp .env.example .env   # configurer les variables
npm install
npm run start:dev      # http://localhost:3000
```

**Frontend**

```bash
cd frontend
cp .env.example .env   # configurer NEXT_PUBLIC_API_URL
npm install
npm run dev            # http://localhost:3001
```

## Variables d'environnement

### Backend (`backend/.env`)

| Variable | Valeur par défaut | Description |
|---|---|---|
| `DB_HOST` | `localhost` | Hôte PostgreSQL |
| `DB_PORT` | `5432` | Port PostgreSQL |
| `DB_USER` | `postgres` | Utilisateur DB |
| `DB_PASSWORD` | `admin` | Mot de passe DB |
| `DB_NAME` | `db-toolbox` | Nom de la base |
| `JWT_SECRET` | — | Clé secrète JWT |
| `JWT_EXPIRES_IN` | `1d` | Durée de validité JWT |
| `MAIL_HOST` | — | Serveur SMTP |
| `MAIL_PORT` | `587` | Port SMTP |
| `SMTP_USER` | — | Utilisateur SMTP |
| `SMTP_PASS` | — | Mot de passe SMTP |
| `FRONTEND_URL` | `http://localhost:3001` | URL du frontend |

### Frontend (`frontend/.env`)

| Variable | Valeur par défaut | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | URL de l'API backend |

## Structure du projet

```
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentification JWT
│   │   ├── users/             # Gestion utilisateurs
│   │   ├── profiles/          # Profils personnels
│   │   ├── project-owner/     # Profils porteurs de projet
│   │   ├── expert/            # Profils experts + scoring
│   │   ├── incubators/        # Gestion incubateurs
│   │   ├── incubator-members/ # Membres d'incubateur
│   │   ├── incubator-documents/ # Documents de vérification
│   │   ├── projects/          # Projets entrepreneuriaux
│   │   ├── journey/           # Étapes du parcours (13 étapes)
│   │   ├── documents/         # Documents de projet
│   │   ├── reviews/           # Revues par incubateur
│   │   ├── progress/          # Suivi de progression
│   │   ├── ai-assistant/      # Assistant IA
│   │   ├── notifications/     # Notifications
│   │   ├── mail/              # Service d'email
│   │   ├── uploads/           # Gestion de fichiers
│   │   ├── database/          # Seeds et configuration DB
│   │   └── config/            # Configuration globale
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── app/               # Pages Next.js (App Router)
│   │   ├── components/
│   │   │   ├── shared/        # UI Kit (Button, Card, Input…)
│   │   │   ├── step-editor/   # Composants pédagogiques (SWOT, PESTEL, BMC…)
│   │   │   ├── project/       # ProjectCard, StepCard
│   │   │   ├── auth/          # Inscription multistep
│   │   │   ├── expert/        # Profil expert, scoring
│   │   │   ├── incubator/     # Onboarding incubateur
│   │   │   └── project-owner/ # Onboarding porteur
│   │   ├── hooks/             # Custom hooks (useSteps, useProjects…)
│   │   ├── services/          # API calls (axios)
│   │   ├── types/             # TypeScript interfaces
│   │   └── data/              # Contenu pédagogique statique
│   └── ...
├── docker-compose.yml
└── README.md
```

## Modules API (16 modules)

| Module | Routes principales |
|---|---|
| `auth` | `POST /auth/register`, `POST /auth/login`, `GET /auth/verify/:token` |
| `users` | `GET /users/profile`, `PATCH /users/profile` |
| `project-owner` | Complétude profil porteur |
| `expert` | Profils, domaines, scoring, matching |
| `incubators` | CRUD incubateurs |
| `incubator-members` | Membres, invitations |
| `incubator-documents` | Documents de vérification |
| `projects` | CRUD projets entrepreneuriaux |
| `journey` | Étapes du parcours (13 étapes) |
| `documents` | Documents attachés aux projets |
| `reviews` | Évaluations par les incubateurs |
| `progress` | KPIs et historique |
| `ai-assistant` | Chat IA, génération BMC/Business Plan |
| `notifications` | Notifications utilisateur |
| `uploads` | Upload de fichiers |
| `profiles` | Profils génériques |

## Scripts disponibles

### Backend

```bash
npm run start:dev    # Développement (watch mode)
npm run build        # Compilation
npm run lint         # ESLint
npm run test         # Tests unitaires
npm run seed         # Seeds (domaines d'expertise)
```

### Frontend

```bash
npm run dev          # Développement (port 3001)
npm run build        # Build production
npm run lint         # ESLint
```

## Stack technique

| Technologie | Version |
|---|---|
| Node.js | 20+ |
| NestJS | 11 |
| Next.js | 16.2.1 |
| React | 19.2.4 |
| TypeScript | 5.7 (back) / 5 (front) |
| PostgreSQL | 15 |
| TypeORM | 0.3.28 |
| Tailwind CSS | 4.2 |
| Docker | Compose V2 |

## Conventions

- **Langue** : français (UI, messages d'erreur, contenu pédagogique)
- **Backend** : architecture modulaire DDD, TypeORM avec `synchronize: true`
- **Frontend** : App Router, composants singleton, Tailwind v4, hooks personnalisés
- **Contenu pédagogique** : stocké côté client (`data/pedagogical-content.ts`) pour performances hors-ligne
- **Colonnes nullable** : utiliser `@Column({ type: 'varchar', nullable: true })` pour éviter l'erreur `DataTypeNotSupportedError` de TypeORM sur les unions `string | null`
