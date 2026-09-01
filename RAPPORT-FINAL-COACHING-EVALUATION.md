# Rapport final — Audit & correction du module Coaching & Évaluation

**Projet** : ProjectStruct (backend NestJS 11 + Prisma 5.22 + PostgreSQL, frontend Next.js 16 App Router + React 19).
**Date** : 22/08/2026 · **Rapports liés** : `RAPPORT-PHASE-A-ANALYSE.md` (analyse), `RAPPORT-COACHING-EVALUATION.md` (mission initiale).

---

## 1. Architecture comprise

- **Modèles Prisma réellement utilisés** (aucun modèle créé) : `Cohort`, `CohortParticipation`, `CohortExpert` (COACH/JURY), `ProjectExpertAssignment` (COACH/JURY projet), `CoachingSession`, `CoachingRecommendation`, `CoachingAction`, `ActionEvidence`, `CoachingComment`, `EvaluationTemplate/Criterion/Score/Evaluation`, `EvaluationAssignment`, `JurySession`, `FinalDecision(+conditions)`, `AuditLog`.
- **Livrables = structures existantes** : `GeneratedDocument` (21 définitions IA, statuts NOT_GENERATED/GENERATED/UPDATED) + `StepProgress` (21 étapes GBM, 5 phases). Aucun modèle `Deliverable` n'a été créé.
- **Garde d'accès centrale** : `ModuleAccessService.assertCanAccessProject` (porteur ∪ coach affecté ∪ jury CohortExpert/EvaluationAssignment ∪ membre incubateur) — service `@Global()`, injectable partout sans modifier les modules NestJS.
- Workflow complet déjà en place de bout en bout : affectation → sessions/preuves/actions → grilles pondérées (note /20 calculée serveur) → synthèse → jury → décision finale conditionnelle.

## 2. Problème des livrables

**Cause** (tracée DB → Prisma → Service → Controller → API → UI) :
toutes les lectures de livrables passaient par `SectionStepService.ensureOwnership` →
`ProjectsService.findOwnedOrThrow` (**propriétaire uniquement**) → HTTP 403 pour coach/jury/incubateur :

| Lecture | Réf. avant correction |
|---|---|
| Liste documents | `documents.service.ts:49` |
| Contenu document | `documents.service.ts:73` |
| PDF document | `document-pdf.service.ts:15` (`owner_id !== userId`) |
| Données étape GBM | `gbm.service.ts:32` |
| Liste d'items GBM | `gbm.service.ts:107` |
| Progression GBM | `gbm.service.ts:223` |
| PDF BMC | `bmc-pdf.service.ts:21` |

Et côté frontend, le workspace coach n'avait **aucun onglet Livrables**.

**Correction** :
- Backend : les 7 lectures ci-dessus basculent sur `assertCanAccessProject`. Les écritures (generate, generate-all, PATCH/POST/DELETE steps, review, init-steps) restent strictement owner-only.
- Frontend : nouvel onglet **« Livrables »** dans `/dashboard/expert/coaching/[projectId]` (composant `DeliverablesPanel` : progression GBM par phase, 21 livrables avec statut/dates, consultation en lecture seule + téléchargement PDF).

## 3. Coaching

- **Sessions** : création/clôture/start + AI brief/summary — déjà fonctionnels ; vérifiés en e2e (scénario 2).
- **Observations** : compte-rendu de session + commentaires session/action — inchangés, opérationnels.
- **Recommandations** : CRUD + conversion IA (`from-ai`) — inchangés, opérationnels.
- **Actions** : durcies (voir §5 RBAC) — le porteur soumet des preuves, seul le coach valide/rejette.
- **Historique** : liste chronologique des sessions avec statuts dans l'onglet Sessions ; stats agrégées par projet enrichies (progression + livrables).

## 4. Jury

- **Assignments** : `EvaluationAssignment` + `canEvaluateProject` (jury de cohorte actif ou affectation) — inchangés.
- **Dashboard** : `/dashboard/expert/evaluations` (À faire / Brouillons / Soumises) — inchangé, opérationnel.
- **Évaluation** : critères servis par le backend (grille publiée verrouillée), score pondéré /20 serveur.
- **DRAFT → SUBMITTED** : sauvegarde/restauration et soumission définitive vérifiées en e2e (scénarios 4-5) ; lecture seule après soumission conservée.
- **Nouveau** : le jury consulte désormais aussi les livrables (scénario e2e 9) via la même garde de lecture.

## 5. RBAC

- **PORTEUR** : propriété complète de ses projets (génération de documents, édition GBM). Nouveau : ne peut plus **auto-valider** ses actions — transitions limitées à `PENDING/IN_PROGRESS/SUBMITTED`, aucune édition du périmètre défini par le coach (403 sinon). La restriction n'existe plus uniquement côté UI.
- **COACH** : lit les livrables/progression de ses projets coachés ; gère sessions/actions/recommandations/revue de preuves ; ne peut ni générer de livrables ni éditer les étapes du porteur ; ne touche pas aux évaluations jury.
- **JURY** : lit les livrables des projets qui lui sont assignés ; gère exclusivement ses évaluations ; interdit sur le coaching et sur les assignments d'autrui (e2e scénarios 9-11).
- **INCUBATEUR** : la gestion du coaching au niveau cohorte exige désormais `role ADMIN` ou `can_manage_cohorts` (alignement F3 — un simple membre ne peut plus créer sessions/actions) ; la **lecture** reste ouverte à tous les membres de l'incubateur.

## 6. Fichiers modifiés

### Backend (8)
| Fichier | Changement |
|---|---|
| `src/documents/documents.service.ts` | F1 : lectures → `assertCanAccessProject` ; injection `ModuleAccessService` |
| `src/documents/document-pdf.service.ts` | F1 : idem + re-fetch projet pour le PDF |
| `src/gbm/gbm.service.ts` | F1 : `getStepData`/`listStepItems`/`getProgress` → `assertCanAccessProject` |
| `src/gbm/bmc-pdf.service.ts` | F1 : idem |
| `src/coaching/coaching.service.ts` | F2 : restriction des statuts porteur dans `updateAction` (+ suppression no-op L504) · F3 : `isCohortManagerOfProject` + alignement `assertCanManageProjectCohort` |
| `src/cohorts/cohorts.service.ts` | `coaching-projects` : stats enrichies `gbm_progression` (%) + `documents_generated` (requêtes batchées, pas de N+1) |
| `test/coaching-evaluation.e2e-spec.ts` | Réparation de 2 erreurs de compilation obsolètes + 5 nouveaux scénarios (8-12) + utilisateur « stranger » + cleanup action |
| `src/notifications/notifications.service.spec.ts` | Référence enum obsolète `NEW_COACHING` → `COACHING_SESSION_SCHEDULED` |

### Frontend (3)
| Fichier | Changement |
|---|---|
| `src/components/coaching/DeliverablesPanel.tsx` | **Nouveau** : panneau livrables lecture seule (progression GBM 5 phases + 21 documents, consultation inline/modale + PDF) |
| `src/app/dashboard/expert/coaching/[projectId]/page.tsx` | Onglet « Livrables » câblé · lint (`getErrorMessage`, fetch async conforme react-hooks) |
| `src/app/dashboard/expert/cohorts/[cohortId]/page.tsx` | Cartes projets : barre de progression GBM % + compteur de livrables · lint (`any` supprimé) |

Aucun fichier supprimé, aucun modèle/endpoint créé, aucune migration Prisma requise.

## 7. Endpoints modifiés

| Endpoint | Avant | Après |
|---|---|---|
| `GET /projects/:id/documents` (+`/:key`, `/:key/pdf`) | owner only | coach / jury / membre incubateur en lecture |
| `GET /projects/:id/gbm/step/:key` (+`/list`, `/progress`) | owner only | idem |
| `GET /projects/:id/gbm/bmc-pdf` | owner only | idem |
| `PATCH /coaching/actions/:id` | porteur = tous statuts | porteur limité à PENDING/IN_PROGRESS/SUBMITTED, champs intouchables |
| `GET /cohorts/:id/coaching-projects` | stats coaching | + `stats.gbm_progression`, `stats.documents_generated` |

Inchangés (owner-only conservé) : `POST …/generate`, `POST generate-all`, écritures GBM, `review`, `init-steps`.

## 8. Tests exécutés

| Commande | Résultat |
|---|---|
| `npx nest build` (backend) | ✅ vert |
| `npx tsc --noEmit` (backend, src+test) | ✅ propre après réparation des specs obsolètes |
| `npm run test` (jest unitaire) | ✅ **28 suites / 114 tests** verts |
| `npm run test:e2e` (PostgreSQL réel db-toolbox) | ✅ `coaching-evaluation.e2e-spec.ts` **12/12** (7 existants + 5 nouveaux) · ⚠️ `app.e2e-spec.ts` échoue (problème préexistant, voir §10) |
| `npm run build` (frontend) | ✅ vert (34 routes) |
| `npx eslint` sur les 3 fichiers frontend touchés | ✅ 0 erreur / 0 warning |

### Nouveaux scénarios e2e (services réels contre PostgreSQL)
8. Le coach lit la liste des livrables, la progression GBM (5 phases) et une étape.
9. Le jury lit aussi les livrables.
10. Un expert non affecté → `ForbiddenException` (documents + progression).
11. Génération de document / PATCH étape par le coach → `ForbiddenException` (écriture porteur uniquement).
12. Porteur : `COMPLETED` refusé (403), `SUBMITTED` accepté, validation finale par le coach acceptée.

## 9. Tests réussis

114/114 unitaires · 12/12 e2e coaching-évaluation · builds backend/frontend verts · lint ciblé vert.

## 10. Erreurs restantes

- **Préexistant (hors périmètre)** : `test/app.e2e-spec.ts` ne compile pas sous jest-e2e — `uuid` ESM importé transitivement via `AppModule → incubator-documents.controller` sans `transformIgnorePatterns`/`moduleNameMapper` dans `jest-e2e.json`. Déjà documenté dans le rapport de mission initiale (§H) ; non corrigé ici pour ne pas élargir le périmètre.
- Docker daemon inactif sur cette machine : runtime docker-compose non exercé (identique aux sessions précédentes).

## 11. Risques éventuels

- **F3 resserre le RBAC** : un membre d'incubateur sans `can_manage_cohorts` perd le droit de *gérer* le coaching (création de sessions/actions). Choix justifié par l'alignement avec `assertCanManageIncubator` ; la lecture reste ouverte.
- La progression affichée est **0 %** tant que le porteur n'a pas initialisé/sauvegardé d'étapes (`StepProgress` créé à la volée) — fidèle aux données réelles, état vide géré dans l'UI.
- Les e2e sont des tests d'intégration services (pas supertest/HTTP) — design hérité de la mission initiale ; les gardes testées sont celles appelées par les controllers.

## 12. Recommandations

1. Corriger `jest-e2e.json` (`transformIgnorePatterns: ['node_modules/(?!uuid)']` ou mapper `uuid` en CJS) puis réintégrer `app.e2e-spec.ts`.
2. Ajouter `prisma migrate deploy` au pipeline CI/Docker (drift base/schéma constaté historiquement).
3. À terme, dupliquer quelques scénarios e2e en HTTP pur (supertest) pour couvrir guards + DTOs.
4. Optionnel : réutiliser `DeliverablesPanel` côté page évaluation jury (le backend l'autorise déjà) et afficher l'objectif de la prochaine session sur la vue d'ensemble coach (donnée déjà présente dans `stats.next_session_at`).
