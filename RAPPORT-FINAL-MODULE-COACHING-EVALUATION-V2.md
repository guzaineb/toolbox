# Rapport final — Module Coaching & Évaluation (corrections et validation)

**Date :** 23 août 2026
**Périmètre :** audit complet du module Coaching & Évaluation (backend NestJS 11 + Prisma/PostgreSQL, frontend Next.js 16 App Router), correction des écarts au cahier des charges, tests e2e, layouts dashboard par rôle.
**Rapports antérieurs :** `RAPPORT-PHASE-A-ANALYSE.md`, `RAPPORT-FINAL-COACHING-EVALUATION.md` (session précédente — corrections « livrables » déjà appliquées et re-vérifiées ici).

---

## 1. Rappel du problème initial

Le coach ne voyait pas les livrables du porteur dans l'espace coaching (`/dashboard/expert/coaching/[projectId]`). **Cause racine confirmée** : les services backend (GBM, documents) refusaient l'accès expert faute d'affectation `CohortExpert` active, alors que le coach était affecté via `coaching_assignments`. Corrigé en session précédente par le hub RBAC centralisé `ModuleAccessService.assertCanAccessProject` (owner OU coach affecté OU jury affecté OU membre incubateur).

## 2. Décision d'architecture — « livrables »

Il n'existe **aucun modèle `Deliverable`** dans `schema.prisma`, et il ne faut pas en créer un (pas de système parallèle). Les livrables sont :

| Source | Contenu | Accès |
|---|---|---|
| `GeneratedDocument` | 21 définitions (`DOCUMENT_DEFINITIONS` dans `documents.service.ts`) : BMC, GBM, pitch, etc., avec export PDF | `documents.service.ts` via `assertCanAccessProject` |
| `StepProgress` (+ sections GBM) | progression Business Model Canvas (21 étapes, phases 1→5, déblocage séquentiel) | `gbm.service.ts` via `assertCanAccessProject` |
| `EvaluationAssignment` / `CohortExpert` | rôles jury/coach par projet ou cohorte | hub RBAC |

Le composant réutilisable **`frontend/src/components/coaching/DeliverablesPanel.tsx`** (progression GBM lecture seule + liste des 21 documents avec téléchargement PDF) est branché dans l'onglet « Livrables » du workspace coach **et** sur la page d'évaluation jury (voir §4/F2).

## 3. Corrections backend appliquées (cette session)

### B1 — Verrouillage des sessions clôturées (`backend/src/coaching/coaching.service.ts`)
- `updateSession` : si la session est `COMPLETED` / `CANCELLED` / `MISSED`, toute modification des champs de planification (`title`, `scheduledAt`, `durationMinutes`, `sessionType`, `objective`, `agenda`) ou un changement de `status` → **400** *« Cette session est clôturée : seuls les champs de compte-rendu (notes, décisions, rapport, résumé, prochaines étapes) peuvent être mis à jour »*.
- Seuls `notes`, `decisions`, `report`, `summary`, `nextObjectives` restent modifiables après clôture (l'historique reste intact).
- Test e2e n°13 ajouté : replanification refusée, compte-rendu accepté.

### B2 — Restriction d'accès aux affectations d'évaluation (`backend/src/evaluations/evaluation-assignments.service.ts`)
- `findOne` : suppression du contournement `hasActiveAssignment(projectId, userId, 'JURY')` qui permettait à **n'importe quel jury d'un même projet** de lire l'évaluation d'un autre jury (fuite de scores/commentaires).
- Nouvelle règle (scénarios 15/20) : accès limité au **jury affecté**, au **porteur du projet**, ou à un **membre de l'incubateur** de la cohorte ; sinon **403 Forbidden** (au lieu de l'ancien 400 incohérent).
- Test e2e n°14 ajouté : étranger → 403 ; porteur → 200 ; jury affecté → 200 avec ses scores.

## 4. Corrections frontend appliquées

| # | Fichier | Correction | Scénario |
|---|---|---|---|
| F1 | `expert/evaluations-todo/[assignmentId]/page.tsx` | Modale de confirmation avant soumission (« Cette action est définitive… », Annuler / Confirmer) ; la validation des critères manquants se fait avant l'affichage | 18 |
| F2 | idem | Section « Livrables du projet » (`DeliverablesPanel`, consultation seule) toujours visible + description du projet sous l'en-tête | 16 |
| F3 | `components/coaching/CoachingPanels.tsx` (`AddSessionModal`) | Ajout des champs **Type de session** (select : Suivi/Diagnostic/Travail/Validation/Financement/Stratégie/Autre — pas d'enum Prisma existant, chaîne libre ≤50 côté API) et **Objectif** (textarea), envoyés à `createSession` | 7, 8 |
| F4 | `expert/coachings/page.tsx`, `expert/evaluations/page.tsx` | Erreurs React Compiler `set-state-in-effect` corrigées (chargement async dans `useEffect` avec garde `cancelled`, tous les setState après le premier await) ; imports inutilisés supprimés (`Clock`, `Button`) | lint |

Composants module (`ImprovementPlanPanel.tsx`, `SessionWorkspace.tsx`) : apostrophes non échappées corrigées, type mort `EvidenceDraft` supprimé, état `error` du formulaire d'action désormais affiché.

## 5. Validation (tout vert)

| Contrôle | Résultat |
|---|---|
| `prisma validate` | ✅ |
| Backend `nest build` + `tsc --noEmit` | ✅ 0 erreur |
| Backend unit tests (`npm test`) | ✅ **28 suites / 114 tests** |
| Backend e2e PostgreSQL réel (`npm run test:e2e`) | ✅ **2 suites / 15 tests** (dont 2 nouveaux : verrou session, 403 cross-jury) |
| Lint frontend module coaching/évaluations | ✅ **0 erreur 0 warning** sur les fichiers du module |
| Frontend `next build` | ✅ toutes routes générées |

Infra e2e (session précédente, conservée) : `test/jest-e2e.json` avec `moduleNameMapper` vers le stub `uuid-stub.cjs` (uuid v13 ESM-only).

## 6. Layouts dashboard par rôle (vérifiés)

`DashboardLayout.tsx` adapte la navigation au rôle (`session.user.role`), chaque arborescence étant protégée par `RoleGuard` dans son `layout.tsx` :

- **ADMIN** : `/dashboard/admin/*` — incubateurs, utilisateurs, porteurs, projets, cohortes, notifications.
- **EXPERT (coach / jury)** : `/dashboard/expert/*` — Coachings (liste cohortes où `role=COACH` actif) → workspace `/coachings?project=` à onglets (Sessions, Recommandations, Actions, Livrables, Plan d'amélioration, IA, Maturité…) ; Évaluations (todo jury) → grille notée `/evaluations-todo/[id]` avec livrables + confirmation ; Cohortes (gestion/affectation) ; Matching ; Profil.
- **PORTEUR (PROJECT_OWNER)** : `/dashboard/project-owner/*` — Mes projets (détail avec onglets coaching/évaluations/documents/GBM/funding/eco-design/market/impact), Participations, Cohortes, profil ; wizard GBM `/projects/[id]/gbm` (21 étapes, navbar horizontale par phase, chatbot IA).
- **INCUBATEUR_MEMBER** : `/dashboard/incubator*` — incubateurs, création, gestion membres/projets.
- Commun : `/dashboard/profile`, `/dashboard/notifications`.

## 7. Restant connu (hors périmètre, pré-existant)

- Lint : erreurs pré-existantes hors module (ex. `expert/profile/[id]/page.tsx`, `expert/recommendations/page.tsx`, `accept-invite`) — baseline non nulle documentée dans AGENTS.md, non touchées.
- Avertissement Jest « worker process has failed to exit gracefully » (cosmétique, teardown, pré-existant).
- Docker daemon non lancé : pas d'exécution docker-compose (API testée en local contre PostgreSQL réel).
- Audit antérieur non re-vérifié : correspondance UUID `gbm_8` vs `GbmStepParams` — à contrôler au runtime quand Docker sera disponible.

## 8. Fichiers modifiés (cette session)

Backend :
- `src/coaching/coaching.service.ts` (B1)
- `src/evaluations/evaluation-assignments.service.ts` (B2)
- `test/coaching-evaluation.e2e-spec.ts` (tests 13–14 + import `BadRequestException`)

Frontend :
- `src/app/dashboard/expert/evaluations-todo/[assignmentId]/page.tsx` (F1, F2)
- `src/components/coaching/CoachingPanels.tsx` (F3)
- `src/app/dashboard/expert/coachings/page.tsx`, `src/app/dashboard/expert/evaluations/page.tsx` (F4)
- `src/components/coaching/SessionWorkspace.tsx`, `src/components/coaching/ImprovementPlanPanel.tsx` (lint module)

**Conclusion :** le module Coaching & Évaluation est conforme aux scénarios 1–20, sécurisé (RBAC centralisé, historique de sessions immuable, cloisonnement inter-jurys), testé (129 tests verts) et intégré aux dashboards des quatre rôles.

---

## 9. Re-vérification du 24/08/2026

Contrôles rejoués sur l'état actuel du dépôt (modifications non commitées de la session précédente) :

| Contrôle | Résultat |
|---|---|
| Backend `nest build` + `tsc --noEmit` | ✅ 0 erreur |
| Backend unit tests (`npm test`) | ✅ **28 suites / 115 tests** |
| Backend e2e PostgreSQL réel (`npm run test:e2e`) | ✅ **2 suites / 15 tests** |
| ESLint frontend (pages expert + `components/coaching/**`) | ✅ 0 erreur 0 warning |

Point ouvert clôturé :
- **`gbm_8` vs `GbmStepParams`** : aucune anomalie. Le frontend envoie les clés d'étape (`gbm_8`, …) comme chaînes dans `stepId`, validé par `@IsString()` (`gbm/dto/gbm-params.dto.ts:8-9`) ; seul `itemId` exige un UUID (`@IsUUID()`), ce qui correspond aux identifiants des enregistrements one-to-many. Aucune correction nécessaire.

Ménage : suppression des fichiers temporaires `backend/inspect-db-tmp.js` et `backend/inspect-db-tmp2.js`.

Restant inchangé : erreurs lint pré-existantes hors module, avertissement Jest sur le teardown e2e (cosmétique), Docker daemon indisponible pour docker-compose. Les modifications restent à committer.
