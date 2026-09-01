# Rapport Phase A — Audit du module Coaching & Évaluation

**Projet** : ProjectStruct — backend NestJS 11 + Prisma 5.22 + PostgreSQL, frontend Next.js 16 App Router + React 19.
**Date** : 22/08/2026 · **Périmètre** : audit complet du module Coaching & Évaluation (aucun fichier modifié).

---

## 1. État des lieux

### 1.1 Modèle de données (`backend/prisma/schema.prisma`)
Le socle est complet et cohérent :

| Domaine | Modèles |
|---|---|
| Affectations | `CohortExpert` (role `JURY\|COACH`, status `PENDING/ACTIVE/INACTIVE`), `ProjectExpertAssignment` (COACH/JURY) |
| Coaching | `CoachingSession` (→ assignment), `CoachingRecommendation`, `CoachingAction`, `ActionEvidence` (`review_status` PENDING/APPROVED/REJECTED), `CoachingComment` |
| Évaluation | `EvaluationTemplate` (+ publication verrouillante), `EvaluationCriterion`, `EvaluationScore`, `Evaluation` (DRAFT/SUBMITTED), `EvaluationAssignment` |
| Jury | `JurySession`, `FinalDecision` (+ conditions), `AuditLog` |
| Livrables | `GeneratedDocument` (clé/titre/statut/content), `StepProgress` (step_key/status/completed_at) |

**Point d'architecture clé** : il n'existe **pas** de modèle `Deliverable`. Les « livrables » =
`GeneratedDocument` (21 définitions dans `DOCUMENT_DEFINITIONS`) + `StepProgress` + sections GBM.

### 1.2 Backend
- `coaching/coaching.controller.ts` : sessions (create/list/get/patch/start/complete + AI brief/summary),
  recommandations (+ conversion IA), actions, preuves (soumission porteur + revue coach), commentaires,
  dashboard `GET projects/:id/coaching`, vues expert. Complet.
- `evaluations/` : templates (création/publication), affectations jury, notation pondérée
  (`score.util.ts` → note /20 côté serveur), synthèse par projet. Complet.
- Garde d'accès centralisée `common/services/module-access.service.ts` :
  - `assertCanAccessProject` : porteur **ou** coach affecté **ou** jury (CohortExpert/EvaluationAssignment) **ou** membre incubateur ;
  - `CommonModule` est `@Global()` → injectable partout sans modifier les modules.
- Le service coaching utilise ses propres gardes granulaires (`assertCanViewCoaching`,
  `assertCanCoachOrManage`, `assertCanCoachOwnerOrManage`, `assertCanManageProjectCohort`) : correct.

### 1.3 Frontend
- Parcours coach : `/dashboard/expert/coachings` (filtre COACH+ACTIVE sur `GET /cohorts/my`)
  → `/dashboard/expert/cohorts/[cohortId]` (projets coachés + stats sessions/actions/recommandations)
  → workspace `/dashboard/expert/coaching/[projectId]` : onglets overview, ai, plan, sessions,
  actions, recommandations, progress. Workspace session dédié (`sessions/[sessionId]`).
- Panneaux réutilisables `components/coaching/CoachingPanels.tsx` (Sessions/Actions/Recommandations,
  preuves avec revue coach). Services `coaching.service.ts`, `evaluation.service.ts`,
  `documents.service.ts` (déjà prêts côté client).

---

## 2. Constats confirmés

### F1 — BLOQUANT : les livrables sont invisibles pour le coach/jury/incubateur
Toutes les lectures de livrables exigent d'être **propriétaire** du projet → HTTP 403 pour tout autre rôle :

| Endpoint lu par le coach | Garde appliquée | Réf. |
|---|---|---|
| `GET /projects/:id/documents` (liste) | `ensureOwnership` → `findOwnedOrThrow` | `documents/documents.service.ts:49` |
| `GET /projects/:id/documents/:key` (contenu) | idem | `documents/documents.service.ts:73` |
| `GET /projects/:id/documents/:key/pdf` | `project.owner_id !== userId` → Forbidden | `documents/document-pdf.service.ts:15` |
| `GET /projects/:id/gbm/step/:key` + `/list` | `ensureOwnership` | `gbm/gbm.service.ts:32,107` |
| `GET /projects/:id/gbm/progress` | `ensureOwnership` | `gbm/gbm.service.ts:223` |
| `GET /projects/:id/gbm/bmc-pdf` | `owner_id !== userId` → Forbidden | `gbm/bmc-pdf.service.ts:21` |

(`SectionStepService.ensureOwnership` = `ProjectsService.findOwnedOrThrow`, `section-step.service.ts:14`.)

Côté frontend, le workspace coach **n'a aucun onglet « Livrables »**, et la page cohorte
n'affiche ni progression GBM ni livrables générés. Le coach ne peut donc **pas consulter le travail
du porteur** — exactement le symptôme remonté (« rien n'est visible sur son dashboard »).

Les écritures (generate, generate-all, PATCH/POST steps, review, init-steps) sont également
owner-only — ce qui est **correct** et doit le rester.

### F2 — SÉCURITÉ : le porteur peut auto-valider ses actions
`updateAction` (`coaching/coaching.service.ts:494`) passe par `assertCanCoachOwnerOrManage`
(L948) : si l'appelant est le porteur, **aucune restriction de statut** n'est appliquée. La limite
`OWNER_STATUSES = [PENDING, IN_PROGRESS, SUBMITTED]` n'existe que dans l'UI
(`CoachingPanels.tsx:494`). Via un appel API direct, le porteur peut poser `COMPLETED`, `REJECTED`
ou `CANCELLED` sur ses propres actions — court-circuitant la validation du coach. La ligne 504-505
(`dto.status === COMPLETED ? COMPLETED : dto.status`) est un no-op à nettoyer au passage.

### F3 — INCOHÉRENCE RBAC : tout membre d'incubateur « gère » le coaching
`assertCanManageProjectCohort` (`coaching.service.ts:1004-1010`) accepte **n'importe quel**
membre de l'incubateur (sans vérifier `role === 'ADMIN'` ni `can_manage_cohorts`), alors que
`ModuleAccessService.assertCanManageIncubator` exige ADMIN ou `can_manage_cohorts`.
Un simple membre peut donc créer sessions/actions/recommandations sur les projets de la cohorte.

### Observations mineures (sans action)
- `evaluations-todo/page.tsx` : simple redirection legacy vers `/dashboard/expert/evaluations` — OK.
- La liste des coachings filtre `role/status` côté client — fonctionnel, dépend de `GET /cohorts/my`.

---

## 3. Plan de correction proposé

### Phase B — Corrections backend
1. **F1** : basculer les **lectures** sur `ModuleAccessService.assertCanAccessProject` (déjà global) :
   - `documents.service.ts` : `getDocumentsList`, `getDocument` ;
   - `document-pdf.service.ts` et `bmc-pdf.service.ts` : même garde ;
   - `gbm.service.ts` : `getStepData`, `listStepItems`, `getProgress`.
   Les écritures restent strictement owner-only (aucun changement).
2. **F2** : dans `updateAction`, si l'appelant est uniquement le porteur, restreindre les transitions
   autorisées à `PENDING/IN_PROGRESS/SUBMITTED` (403 sinon) ; supprimer le no-op.
3. **F3** : aligner `assertCanManageProjectCohort` sur `assertCanManageIncubator`
   (ADMIN ou `can_manage_cohorts`) — la vue (read) reste ouverte aux membres.

### Phase C — Frontend
4. Nouvel onglet **« Livrables »** dans `/dashboard/expert/coaching/[projectId]` :
   grille des 21 livrables (statuts NOT_GENERATED/GENERATED/UPDATED), consultation du contenu en
   lecture seule, téléchargement PDF ; encart progression GBM (phases + %). Boutons de génération
   masqués pour les non-porteurs.
5. Page cohorte `[cohortId]` : colonnes « Progression GBM % » et « Livrables générés » par projet
   (réutilisation de `GET gbm/progress` + liste documents désormais accessibles).

### Phase D — Tests & validation
6. Spec backend accès livrables (coach/jury lisent ; écriture 403 ; tiers 403 ; porteur inchangé).
7. Extension e2e `coaching-evaluation.e2e-spec.ts` : assertions 200/403 sur documents+progress,
   et tentative d'auto-validation d'action par le porteur → 403.
8. `nest build` + `next build` verts ; rapport final consolidé.

---

## 4. Risques & garanties
- `CommonModule` étant `@Global()`, aucune modification de modules NestJS n'est nécessaire.
- Aucun changement de schéma Prisma requis → aucune migration.
- Le comportement du porteur reste identique (mêmes endpoints, mêmes réponses) ; seuls les rôles
  autorisés en **lecture** s'élargissent (coach/jury/incubateur), les écritures restent verrouillées.
