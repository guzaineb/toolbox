# ProjectStruct - Plateforme de structuration de projets entrepreneuriaux verts

**ProjectStruct** est une plateforme complète d'accompagnement des entrepreneurs et incubateurs dans la structuration de projets à impact. Elle guide le porteur de projet à travers un parcours structuré couvrant l'idéation, le modèle économique, le plan d'affaires, l'écoconception, la maturité financière, l'accès au marché et la mesure d'impact — le tout assisté par l'IA.

---

## Fonctionnalités

### 🧭 Modules principaux

| Module | Description |
|--------|-------------|
| **GBM** (Green Business Model) | Parcours de 20 étapes réparties en 4 phases pour modéliser un projet entrepreneurial vert : ébauche, construction, test, mesure |
| **Business Plan** | Plan d'affaires complet en 6 sections : gestion, marketing, financier, juridique, KPI, résumé exécutif |
| **Éco-conception** | Diagnostic en 5 phases pour intégrer l'éco-conception dans le projet |
| **Accès au Financement** | Questionnaire de maturité (12 questions) avec scoring et classification en phases (Idéation → Scale-up) |
| **Accès au Marché** | Stratégie de marque et marketing : essence, positionnement, identité visuelle, canaux |
| **Mesure d'Impact** | KPIs environnementaux, sociaux et économiques avec écart objectifs/résultats + rapport IA |

### 🤖 Intelligence Artificielle

- **Résumés automatiques** : génération de résumés de contexte (GBM étape 6), d'activités (étape 15), financiers (étape 18) et de résumés exécutifs
- **Rapport d'impact** : génération automatique d'un rapport narratif d'impact
- **Reformulation pédagogique** : adaptation du contenu pour 3 niveaux (débutant, intermédiaire, avancé)
- **Chatbot RAG** : assistant conversationnel avec recherche vectorielle sur les données du projet
- **Modèle** : Llama 3.3 70B via Groq API, embeddings via API externe ou (Xenova/all-MiniLM-L6-v2)

### 👥 Gestion des utilisateurs

- **4 rôles** : Admin, Expert, Porteur de projet, Membre d'incubateur
- **Inscription** avec confirmation email (code ou lien)
- **Connexion** JWT avec réinitialisation de mot de passe
- **Profils** utilisateurs avec informations personnelles

### 🏢 Gestion des incubateurs

- Création et gestion d'incubateurs (statut, vérification)
- **Membres** avec rôles et permissions granulaires
- **Invitations** par email avec acceptation/déclin
- **Documents** : upload, types documentaires, workflow de vérification
- **Cohortes** et participations de projets

### 👨‍💼 Porteurs de projet

- Profil avec compétences (niveau) et expériences professionnelles
- Création et gestion de projets
- Parcours d'onboarding en 3 étapes

### 👨‍🔬 Experts

- Profil détaillé (headline, bio, organisation, expérience)
- Domaines d'expertise (36 domaines dans 7 catégories)
- **Scoring IA** : score calculé selon expérience, diversité, niveaux, disponibilité
- **Matching** avec projets : recommandation automatique basée sur les compétences
- **Recommandations** : jury pour projet, coachs pour cohorte

---

## Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
│                    Réseau : toolbox_net                     │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │   db      │    │   api    │    │   web    │              │
│  │ PostgreSQL│◄───│ NestJS   │◄───│ Next.js  │              │
│  │ :15       │    │ :3000    │    │ :3000    │              │
│  │           │    │ port     │    │ port     │              │
│  │ volume:   │    │ 3020:3000│    │ 3021:3000│              │
│  │ pgdata    │    │          │    │          │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                         │                                   │
│                         ▼                                   │
│                   Services externes :                       │
│                   - Groq LLM API (Llama 3.3 70B)            │
│                   - API Embeddings (bge-m3)                 │
│                   - ChromaDB (vecteurs)                     │
│                   - SMTP (Gmail)                            │
└─────────────────────────────────────────────────────────────┘
```

### Stack technique

| Couche | Technologie |
|--------|-------------|
| **Backend** | NestJS 11 (TypeScript), PostgreSQL 15, Prisma 5 |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Auth** | JWT (Passport), bcrypt |
| **IA** | Groq SDK, ChromaDB, Xenova Transformers |
| **Email** | Nodemailer (SMTP Gmail) |
| **PDF** | PDFKit (Business Model Canvas) |
| **Upload** | Multer (stockage disque, limite 10 Mo) |
| **Validation** | class-validator, class-transformer (back), zod + react-hook-form (front) |
| **Containerisation** | Docker Compose (3 services) |

---

## Structure du backend (NestJS)

```
backend/src/
├── ai/              # Module IA (LLM, embeddings, ChromaDB, résumés, chatbot, reformulation)
├── auth/            # Authentification (register, login, email verification, reset password)
├── business-plan/   # Plan d'affaires (6 sections + génération IA du résumé exécutif)
├── config/          # Configuration (mail, frontend URL)
├── eco-design/      # Éco-conception (5 phases)
├── expert/          # Experts (profils, scoring, matching, recommandations)
├── funding/         # Accès au financement (questionnaire de maturité, scoring)
├── gbm/             # Green Business Model (20 étapes, 4 phases, export BMC PDF)
├── impact/          # Mesure d'impact (KPIs, écart, rapport IA)
├── incubator-documents/ # Documents d'incubateur (upload, vérification)
├── incubator-members/   # Membres d'incubateur (invitations, rôles, permissions)
├── incubators/      # Incubateurs (CRUD, statut, vérification)
├── mail/            # Service email (inscription, invitation, notification)
├── market/          # Accès au marché (marque, positionnement, canaux)
├── prisma/          # ORM (connexion DB, lifecycle)
├── profiles/        # Profils utilisateur
├── project-owner/   # Porteurs de projet (profil, compétences, expériences)
├── projects/        # Projets (création, liste, propriété)
├── uploads/         # Fichiers statiques
└── users/           # Utilisateurs (CRUD, admin)
```

### Endpoints API

#### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Inscription avec email de vérification |
| GET | `/auth/verify-email?token=` | Vérification d'email par lien |
| POST | `/auth/verify-code` | Vérification d'email par code |
| POST | `/auth/login` | Connexion (retourne JWT) |
| POST | `/auth/forgot-password` | Demande de réinitialisation |
| POST | `/auth/reset-password` | Réinitialisation du mot de passe |

#### Projets
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/projects` | Créer un projet |
| GET | `/projects` | Lister mes projets |
| GET | `/projects/:id` | Détail d'un projet |

#### GBM (Green Business Model)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/PATCH | `/projects/:id/gbm/step/:stepId` | Lire/Mettre à jour une étape |
| POST | `/projects/:id/gbm/step/:stepId/add` | Ajouter un élément (1:N) |
| GET | `/projects/:id/gbm/step/:stepId/list` | Lister les éléments (1:N) |
| DELETE | `/projects/:id/gbm/step/:stepId/:itemId` | Supprimer un élément (1:N) |
| POST | `/projects/:id/gbm/review` | Valider la revue GBM |
| GET | `/projects/:id/gbm/progress` | Progression GBM (4 phases) |
| POST | `/projects/:id/gbm/init-steps` | Initialiser les 20 étapes |
| GET | `/projects/:id/gbm/bmc-pdf` | Télécharger le BMC en PDF |

#### Business Plan
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/PATCH | `/projects/:id/business-plan/management` | Plan de gestion |
| GET/PATCH | `/projects/:id/business-plan/marketing` | Plan marketing |
| GET/PATCH | `/projects/:id/business-plan/financial` | Plan financier |
| GET/PATCH | `/projects/:id/business-plan/legal` | Plan juridique |
| GET/PATCH | `/projects/:id/business-plan/kpis` | KPI |
| GET/PATCH | `/projects/:id/business-plan/executive-summary` | Résumé exécutif |
| POST | `/projects/:id/business-plan/executive-summary/generate` | Générer le résumé exécutif (IA) |
| GET | `/projects/:id/business-plan/progress` | Progression |

#### IA
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/ai/llm/generate` | Générer du texte |
| POST | `/ai/llm/chat` | Chat conversationnel |
| POST | `/ai/summary/context/:projectId` | Résumé de contexte (GBM étape 6) |
| POST | `/ai/summary/activity/:projectId` | Résumé d'activités (GBM étape 15) |
| POST | `/ai/summary/cost-revenue/:projectId` | Résumé coûts/revenus (GBM étape 18) |
| POST | `/ai/summary/executive/:projectId` | Résumé exécutif (Business Plan) |
| POST | `/ai/chatbot/ask` | Poser une question (RAG) |
| POST | `/ai/chatbot/index` | Indexer un projet dans ChromaDB |
| POST | `/ai/reformulation/step` | Reformuler une étape GBM |
| POST | `/ai/reformulation/text` | Reformuler un texte libre |

#### Experts
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/experts` | Créer un profil expert |
| GET | `/experts/me` | Mon profil expert |
| PATCH | `/experts/me` | Mettre à jour mon profil |
| GET | `/experts` | Lister les experts (filtres) |
| GET | `/experts/expertise-areas` | Domaines d'expertise |
| GET | `/experts/me/score` | Mon score expert |
| POST | `/experts/me/match-project` | Matching avec un projet |
| GET | `/experts/analytics/top-experts` | Top experts |
| POST | `/experts/recommendations/jury` | Recommander un jury |
| POST | `/experts/recommendations/coachs` | Recommander des coachs |

#### Incubateurs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/incubators` | Créer un incubateur |
| GET | `/incubators` | Lister les incubateurs |
| GET | `/incubators/:id` | Détail d'un incubateur |
| PATCH | `/incubators/:id` | Modifier un incubateur |
| DELETE | `/incubators/:id` | Supprimer un incubateur |
| PATCH | `/incubators/:id/status` | Changer le statut |
| PATCH | `/incubators/:id/verification` | Vérifier un incubateur |

#### Membres d'incubateur
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/incubators/:id/members` | Ajouter un membre |
| GET | `/incubators/:id/members` | Lister les membres |
| PATCH | `/incubators/:id/members/:memberId` | Modifier un membre |
| DELETE | `/incubators/:id/members/:memberId` | Supprimer un membre |
| POST | `/incubators/:id/members/invite` | Inviter par email |
| POST | `/incubators/:id/members/accept` | Accepter l'invitation |
| POST | `/incubators/:id/members/decline` | Décliner l'invitation |

#### Autres modules
| Méthode | Endpoint | Module |
|---------|----------|--------|
| GET/PATCH | `/projects/:id/eco-design` | Éco-conception |
| GET | `/projects/:id/funding/questions` | Financement - questions |
| POST | `/projects/:id/funding/questionnaire` | Financement - soumettre |
| GET/PATCH | `/projects/:id/funding` | Financement - CRUD |
| GET/PATCH | `/projects/:id/market` | Accès au marché |
| GET/PATCH | `/projects/:id/impact` | Mesure d'impact |
| POST | `/projects/:id/impact/report/generate` | Générer rapport d'impact (IA) |
| POST | `/project-owner` | Créer profil porteur |
| GET/PATCH | `/project-owner/me` | Mon profil porteur |

---

## Structure du frontend (Next.js)

```
frontend/src/
├── app/                          # Pages (App Router)
│   ├── page.tsx                  # Page d'accueil
│   ├── login/page.tsx            # Connexion
│   ├── register/page.tsx         # Inscription (3 étapes)
│   ├── auth/                     # Email vérification, reset password
│   ├── dashboard/                # Tableau de bord, profil, admin
│   ├── expert/                   # Dashboard expert, création, matching
│   ├── incubator/                # Gestion des incubateurs
│   └── project-owner/            # Dashboard porteur, projets, modules
│       └── projects/[projectId]/
│           ├── gbm/              # Éditeur GBM (20 étapes)
│           ├── business-plan/    # Plan d'affaires (6 sections)
│           ├── eco-design/       # Éco-conception
│           ├── funding/          # Maturité financement
│           ├── impact/           # Mesure d'impact
│           └── market/           # Accès au marché
├── components/                   # Composants React
│   ├── shared/                   # UI kit (Badge, Button, Card, Input, etc.)
│   ├── auth/                     # Auth shell, formulaires, étapes
│   ├── dashboard/                # Layout dashboard
│   ├── expert/                   # Scoring, expertise, disponibilité
│   ├── project-owner/            # Onboarding, compétences, expériences
│   ├── incubator/                # Gestion incubateur
│   └── gbm/                      # GbmStepper (20 étapes, 4 phases)
├── services/                     # Clients API (Axios)
├── hooks/                        # Hooks React (auth, profils, scoring)
├── types/                        # Types TypeScript
├── i18n/                         # Traductions (fr, en, ar)
└── lib/                          # Utilitaires (cn, countries)
```

### Pages principales

| Route | Page |
|-------|------|
| `/` | Landing page (Hero, Features, Stats, Roles, CTA) |
| `/login` | Connexion |
| `/register` | Inscription (3 étapes : Compte → Profil → Rôle) |
| `/dashboard` | Tableau de bord (stats, progression, accès rapide) |
| `/expert/` | Dashboard expert (score, expertise, disponibilité) |
| `/project-owner/` | Dashboard porteur de projet |
| `/incubator/[id]/` | Détail incubateur, membres, documents, paramètres |
| `/project-owner/projects/[id]/gbm` | Éditeur GBM complet |
| `/project-owner/projects/[id]/business-plan` | Plan d'affaires |
| `/project-owner/projects/[id]/eco-design` | Éco-conception |
| `/project-owner/projects/[id]/funding` | Maturité financement |
| `/project-owner/projects/[id]/impact` | Mesure d'impact |
| `/project-owner/projects/[id]/market` | Accès au marché |

---

## Base de données (PostgreSQL + Prisma)

**38 modèles** organisés par domaine :

| Domaine | Modèles |
|---------|---------|
| Identité | User, UserProfile |
| Expert | ExpertProfile, ExpertiseArea, ExpertProfileExpertiseArea |
| Incubateur | Incubator, IncubatorMember, IncubatorInvitation, IncubatorDocument |
| Porteur de projet | ProjectOwnerProfile, ProjectOwnerSkill, ProjectOwnerExperience |
| Core | Project, StepProgress, Cohort, CohortParticipation, AiInteraction |
| GBM Phase 1 | IdeaSketch, ProblemsNeeds, Pestel, Objective, MissionVision, ContextSummary |
| GBM Phase 2 | Stakeholder, StakeholderMap, CustomerSegment, ValueProposition, TestDiscovery, ValuePropositionPivot, CustomerRelationsChannel, CustomerJourney, KeyActivitiesResource, EcoDesign, EcoDesignResult, SummaryActivity, CostStructure, RevenueStream, CostRevenueSummary |
| GBM Phase 3 | TestPreparation |
| GBM Phase 4 | Indicator |
| Business Plan | ManagementPlan, MarketingPlan, FinancialPlan, LegalPlan, Kpi, ExecutiveSummary |
| Financement | FundingAssessment |
| Marché | MarketAccess |
| Impact | ImpactMeasure |

---

## IA - Génération de résumés

Le système génère automatiquement des résumés à partir des données insérées par l'utilisateur :

| Résumé | Déclencheur | Données sources | Modèle de sortie |
|--------|-------------|-----------------|------------------|
| **Contexte & Objectifs** | Auto après GBM étape 5 | IdeaSketch, ProblemsNeeds, PESTEL, Objectives, MissionVision | `ContextSummary` |
| **Activités & Ressources** | Auto après GBM étape 14b | KeyActivitiesResource, EcoDesign, EcoDesignResult | `SummaryActivity` |
| **Coûts & Revenus** | Auto après GBM étape 17 | CostStructure, RevenueStream | `CostRevenueSummary` |
| **Résumé Exécutif** | Manuel (POST generate) | ManagementPlan, MarketingPlan, FinancialPlan, LegalPlan, Kpi | `ExecutiveSummary` |
| **Rapport d'Impact** | Manuel (POST generate) | KPIs environnementaux, sociaux, économiques | `ImpactMeasure.rapport_impact` |

**Flux** : Données insérées → Construction du prompt → Appel Groq API → Sauvegarde du résumé → Indexation ChromaDB → Badge "Généré par IA"

---

## Installation et démarrage

### Prérequis
- Docker et Docker Compose
- Node.js 20+ (pour développement sans Docker)

### Avec Docker (déproduction)

L'orchestration repose sur 4 services : `db` (PostgreSQL), `api` (NestJS),
`web` (Next.js standalone) et `nginx` (unique service exposé sur l'hôte).
La base et l'API ne sont **pas** publiées sur l'hôte : tout passe par Nginx.

```
Navigateur ──HTTP──▶ nginx :80 ─┬── /api/*       ──▶ api:3000
                                 ├── /uploads/*   ──▶ api:3000
                                 ├── /socket.io/  ──▶ api:3000
                                 └── /            ──▶ web:3000
```

```bash
# 1. Configuration
cp .env.example .env
chmod 600 .env

# Générer les secrets (uniquement hexadécimal : DATABASE_PASSWORD est injecté
# tel quel dans DATABASE_URL, donc aucun caractère '@', ':', '/' ou '%')
sed -i "s|^DATABASE_PASSWORD=.*|DATABASE_PASSWORD=$(openssl rand -hex 48)|" .env
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 48)|" .env

# Renseigner aussi : FRONTEND_URL, GROQ_API_KEY, SMTP_USER, SMTP_PASS

# 2. Démarrage (migrations Prisma appliquées automatiquement au boot de l'API)
bash deploy.sh up        # ou : docker compose up -d --build

# 3. Vérification
# /health n'est pas exposé publiquement : on interroge l'API depuis le réseau interne.
docker compose exec api curl -fsS http://127.0.0.1:3000/health
#   => {"status":"ok","database":"up",...}

docker compose ps               # tous les services doivent être "healthy"
docker compose logs -f api
```

L'application est accessible sur `http://<IP-DU-SERVEUR>` (port modifiable via
`HTTP_PORT` dans `.env`).

Chemins exposés par Nginx :

| URL | Service | Exemple |
|-----|---------|---------|
| `/` | Frontend Next.js | `http://<IP>/dashboard` |
| `/api/*` | API REST (préfixe retiré) | `http://<IP>/api/auth/login` |
| `/socket.io/*` | WebSocket Socket.IO | `http://<IP>/socket.io/?EIO=4&transport=polling` |
| `/uploads/*` | Fichiers téléversés | `http://<IP>/uploads/<fichier>` |

Le port `80` est le seul ouvert sur l'hôte : ni PostgreSQL (5432) ni l'API
(3000) ni le frontend (3000) ne sont exposés.

Le script `deploy.sh` regroupe les opérations courantes :

```bash
bash deploy.sh up         # build + démarrage
bash deploy.sh update     # rebuild + recréation des conteneurs
bash deploy.sh down       # arrêt (les volumes sont conservés)
bash deploy.sh logs       # logs de tous les services
bash deploy.sh restart    # redémarrage
bash deploy.sh status     # état des services
```

#### Données persistantes

| Volume | Contenu |
|--------|---------|
| `toolbox_pgdata` | Base PostgreSQL (migrations + données) |
| `toolbox_uploads` | Fichiers téléversés par les utilisateurs |

#### Seed de démonstration

`SEED_ON_START=false` (défaut) : seules les migrations sont appliquées.
Passer à `true` puis `bash deploy.sh update` pour charger les utilisateurs de
démonstration. **À laisser désactivé en production.**

#### RAG / ChromaDB

ChromaDB n'est pas inclus dans `docker-compose.yml`. Sans `CHROMA_URL`, un
client mock est utilisé : les résumés IA fonctionnent, mais la recherche
sémantique est indisponible. Pour l'activer, renseignez `CHROMA_URL` avec
l'URL d'une instance ChromaDB existante.

Avec `EMBEDDING_PROVIDER=local` (défaut), `@xenova/transformers` télécharge le
modèle d'embeddings depuis huggingface.co **au premier appel IA** (~90 Mo, cache
écrit dans le conteneur). Sur un serveur sans accès sortant à huggingface.co,
préférez `EMBEDDING_PROVIDER=api` avec `EMBEDDINGS_API_URL` vers un service
d'embeddings interne.

#### HTTPS

Aucun certificat n'est configuré (l'accès se fait par IP). Les identifiants
circulent donc en clair. Pour passer en HTTPS, il faut un nom de domaine :
décommentez le port `443` dans `docker-compose.yml`, montez le certificat dans
`nginx/default.conf` et renseignez `FRONTEND_URL` en `https://`.

### Sans Docker (développement)

```bash
# Base de données locale
docker run -d --name toolbox-pg -p 5432:5432 \
  -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=db-toolbox postgres:15-alpine

# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy   # ou: npm run seed pour les données de démo
npm run start:dev            # http://localhost:3000

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev              # http://localhost:3001
```

En développement, le frontend appelle l'API via `frontend/.env` :

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Le socket Socket.IO en déduit automatiquement l'origine de l'API
(`NEXT_PUBLIC_SOCKET_URL` peut être surchargé explicitement). En production,
`NEXT_PUBLIC_API_URL=/api` : tout est same-origin derrière Nginx.

### Variables d'environnement

`backend/.env` (développement) — voir `backend/.env.example`.

| Variable | Description |
|----------|-------------|
| `HOST` / `PORT` | Interface et port d'écoute de l'API (`0.0.0.0:3000`) |
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `UPLOADS_DIR` | Dossier des fichiers téléversés |
| `CORS_ORIGINS` | Origines autorisées, séparées par des virgules (vide = toutes) |
| `RATE_LIMIT_PER_MINUTE` | Requêtes/minute/IP (défaut : 600) |
| `JWT_SECRET` | Clé secrète pour les tokens JWT |
| `JWT_EXPIRES_IN` | Durée de validité du token (ex: `1d`) |
| `MAIL_HOST`/`MAIL_PORT`/`SMTP_USER`/`SMTP_PASS` | Configuration SMTP |
| `FRONTEND_URL` | URL du frontend (pour les liens dans les emails) |
| `GROQ_API_KEY` | Clé API Groq pour l'IA |
| `GROQ_MODEL` | Modèle LLM (défaut: `llama-3.3-70b-versatile`) |
| `EMBEDDING_PROVIDER` | `local` (transformers embarqué) ou `api` |
| `CHROMA_URL` | URL de ChromaDB (vide = RAG désactivé) |

`.env` à la racine (production, voir `.env.example`) en reprend l'essentiel et
pilote `docker-compose.yml`.

---

## Scripts disponibles

### Backend
```bash
npm run build        # Compiler
npm run start:dev    # Développement (watch)
npm run start:prod   # Production
npm run seed         # Initialiser les données de démo
npm run lint         # Linter
npm run test         # Tests
```

### Frontend
```bash
npm run dev          # Développement (port 3001)
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linter
```

---

## Utilisateurs de démonstration (seed)

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | `admin@toolbox.com` | `password123` |
| Expert | `expert@toolbox.com` | `password123` |
| Porteur de projet | `porteur@toolbox.com` | `password123` |
| Membre incubateur | `incubateur@toolbox.com` | `password123` |

---

## Licence

Propriétaire - Tous droits réservés.
