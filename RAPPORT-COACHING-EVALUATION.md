# Rapport final — Module Coaching & Évaluation

**Projet** : ProjectStruct — Gestion de cohortes d'incubateurs (backend NestJS 11 + Prisma 5.22 + PostgreSQL, frontend Next.js 16 App Router + React 19).
**Date** : 14/08/2026
**Portée** : mission complète, section A à I ci-dessous.

---

## A. Objectif

Permettre à un incubateur de piloter l'accompagnement et la validation finale des projets de cohorte : affectation d'experts (coach, évaluateur, jury), sessions de coaching, grilles d'évaluation pondérées, jury de délibération, décision finale (conditionnelle / prolongation / réévaluation / acceptation / rejet) — sans réécrire l'existant (réutilisation des services, modèles, RBAC, notifications, suivi de progression).

## B. Livrable

### Backend — nouveaux modules (sous `backend/src/`)
| Module | Rôle |
|---|---|
| `assignments/` | Affectation d'experts aux projets (`project_expert_assignments` : COACH / EVALUATOR / JURY). |
| `coaching/` | Sessions, actions, recommandations, feedbacks de coaching. |
| `evaluations/` | Grilles + critères (`evaluation_templates`), affectation évaluateurs, notation/soumission, **synthèse par projet** (moyenne/20, min, max, par critère, par évaluateur). |
| `juries/` | Sessions de délibération avec membres validés. |
| `final-decisions/` | Décisions finales + conditions (validation individuelle). |
| `common/services/module-access.service.ts` | Garde d'accès unifiée (module actif, rôle, assignation, accès porteur) + helper de notification. |
| `audit/` | Journal d'audit (`audit_logs`) pour toutes les actions sensibles. |

Migration Prisma `20260813120000_coaching_evaluation_module` (tables + enums `EVALUATOR`, `CoachingSessionStatus`, `EvaluationStatus`, `EvaluationStage`, `FinalDecisionType`, `ConditionStatus`, `JurySessionStatus`, types de notification…).

### Frontend — nouvelles pages
- **Porteur de projet** : `projects/[projectId]/coachings` (sessions, actions, recommandations) et `projects/[projectId]/evaluations` (détail des évaluations + synthèse). Cartes « Suivi » déverrouillées sur le hub.
- **Expert** : `expert/coaching/[projectId]` (workspace coach), `expert/evaluations-todo` + détail d'une tâche d'évaluation.
- **Incubateur** : 3 onglets dans la cohorte — `CoachingTab`, `EvaluationTab` (grilles + affectation + synthèse par projet), `JuryTab` (sessions + décisions + conditions).

## C. Décisions d'architecture
1. **Score calculé côté backend** : `evaluations/score.util.ts` (`computeWeightedScore`) — jamais de calcul de note dans le frontend. La note sur 20 est stockée à la soumission.
2. **Permissions par affectation**, pas par rôle seul : un expert n'agit que sur les projets qui lui sont assignés (`project_expert_assignments`) ou sur lesquels il est membre actif de cohorte (`cohort_experts`, rôle étendu à `EVALUATOR`).
3. **Transactions Prisma** pour toute opération groupée (création de grille + critères, décision + conditions, affectation multi-évaluateurs).
4. **Notifications réutilisées** : `NotificationEvent`/`NotificationMessageBuilder` étendus (14 nouveaux événements, ex. `notification.coaching.session.scheduled`, `notification.final_decision.made`) → notifications DB + emails, sans duplication du canal.
5. **Garde d'accès unique** centralisée dans `ModuleAccessService` (vérification module actif, rôle minimal, assignation, propriétaire) — aucun contrôle « maison » dispersé.
6. **Publication des grilles verrouillante** : la grille publiée est immutable (critères verrouillés) pour garantir la cohérence des notations ; la publication exige des poids totaux = 100 (±0,5) et ≥ 1 critère.
7. **Décision conditionnelle** : `FinalDecision` unique par projet + cohorte (création ou mise à jour si décision inchangée), `conditions` avec statut `PENDING → COMPLETED` et validation tracée (validateur + date). Une décision `CONDITIONAL` exige ≥ 1 condition ; `EXTENDED` exige une nouvelle date de fin.

## D. RBAC & sécurité
- Porteur : accès limité à ses propres projets (synthèse, détails).
- Expert : accès limité à ses assignations actives (COACH → sessions/actions, EVALUATOR → sa notation, JURY → sessions de jury).
- Incubateur : membres avec `can_manage_cohorts` (ou rôle admin/program manager) pour affectations, grilles, jury, décisions.
- Vérifications systématiques : module actif, statut du projet/cohorte, unicité d'affectation, soumission propre, non-modification post-soumission.

## E. Frontend — conventions respectées
- Pages `'use client'`, singletons de services API (`services/coaching.service.ts`, `services/evaluation.service.ts`), composants `@/components/shared/ui`.
- Modes « lecture seule » quand l'utilisateur n'est pas autorisé (canManage) ; états vides explicites ; progression du hub conservée.

## F. Tests
### Unitaires (backend) — 12 tests, 5 suites, tous verts
- `evaluations/score.util.spec.ts` (4) : pondération, /20, arrondi, critères incomplets.
- `assignments/assignments.service.spec.ts` (2) : affectation, unicité/statut.
- `juries/juries.service.spec.ts` (2) : création, validation des membres.
- `final-decisions/final-decisions.service.spec.ts` (2) : décision + conditions, validation de condition.
- `evaluations/evaluation-templates.service.spec.ts` (2) : création, publication + verrouillage.

### E2E — `backend/test/coaching-evaluation.e2e-spec.ts` — 7 scénarios, verts
Parcours complet contre une vraie base PostgreSQL (Postgres local, migrations appliquées de zéro) :
1. Affectation COACH → 2. session + clôture → 3. grille + publication (poids 60/40) → 4. affectation évaluateur, notation (5/5 et 8/10 ⇒ total 92, /20 = 18,4), soumission → 5. synthèse porteur (average 18,4) → 6. session de jury → 7. décision conditionnelle + validation de condition.
- Notifications réellement émises via `EventEmitter2` (assertions sur `notification.coaching.session.completed`, `notification.evaluation.submitted`, `notification.final_decision.made`, `notification.condition.validated`).
- Audit tracé à chaque action ; fixtures créées puis nettoyées (afterAll) ; base revenue vide après exécution.

## G. Vérifications
- `nest build` backend : **vert** (BUILD_OK).
- `next build` frontend : **vert** (Type error corrigé sur `EvaluationModule.template` — `stage`/`published` ajoutés au type).
- 12 tests unitaires : **verts**. E2E : **7/7 verts**.
- Base locale resynchronisée avec `schema.prisma` (les tables/module et l'enum `EVALUATOR` étaient absents de la base bien que la migration fût marquée appliquée — corrigé par `prisma migrate reset`, base vide au préalable).

## H. Points préexistants (non liés à cette mission)
- 14 suites de tests existantes échouent (`users`, `auth`, `cohorts`, `incubators`, `mail`, …) : specs compilant des `TestingModule` partiels sans les providers requis (ex. `users.controller.spec.ts`). Non causés par ce travail (aucun de ces fichiers modifié).
- `npm run test:e2e` historique (`app.e2e-spec.ts`) ne peut pas compiler : alias `src/mail/mail.service` non résolu dans `test/jest-e2e.json` (pas de `moduleNameMapper`). Le scénario E2E de cette mission contourne le problème en n'important pas `AppModule`.

## I. Prochaines étapes recommandées
1. Corriger les 14 specs existants (fournir les providers manquants) et le `moduleNameMapper` de `jest-e2e.json`.
2. Ajouter `prisma migrate deploy` au pipeline CI/Docker (le drift base/schéma constaté en G n'aurait pas dû exister).
3. UI : rétro-planning des sessions, rappels « deadline » (déjà supportés par `evaluationDeadlineSoon`/`reevaluationRequested` dans le builder de notifications).
4. Statistiques incubateur : agrégats cross-cohorte (moyennes/20, taux d'acceptation conditionnelle).
