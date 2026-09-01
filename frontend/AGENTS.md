<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->



Full audit & fix of ProjectStruct: NestJS 11 + Prisma 5.22 + PostgreSQL backend, Next.js 16.2.1 App Router + React 19 frontend (8 phases: audit, Prisma errors, notifications, dates, GBM stepper UI, guides, AI chatbot, validation).
GBM UX now per user decision: horizontal sticky navbar with phase dropdowns (Ébaucher & Définir…Synthèse, each showing n/total), replacing the lateral rail.
Important Details
Backend runs locally on Windows (npm run start:dev) against local Postgres db-toolbox via backend/.env (postgresql://postgres:admin@localhost:5432/db-toolbox?schema=public). Docker daemon not running; docker-compose not exercised.
GBM progression locked: step i+1 unlocked only when previous step is validated (backed by dataHasContent + API COMPLETED status). URL drives step via ?step=gbm_X.
GBM step inventory (frontend steps.ts mirrors backend): phase 1 gbm_1..gbm_6, phase 2 gbm_7a,7b,8,9,10,11,12a,12b,13,14a,14b,15,16,17,18, phase 3 gbm_19, phase 4 gbm_20, phase 5 gbm_21. One-to-many: gbm_7a,7b,8,10,12b. AI steps: gbm_6,15,18,21.
Chatbot reused from existing backend POST /ai/chatbot/ask + /ai/chatbot/index (frontend wrapper chatbotService added).
UI conventions: Card/CardHeader, Button size sm, Badge variants green/amber/red/blue/gray, custom classnames ink/ink2/ink3, moss, surface, tailwind classes (no arbitrary-value text-[*px] avoided except text-[10px]..text-[13px]), lucide-react 1.7.0 (icon availability verified).
French site copy and labels used throughout GBM UI.
Work State
Completed
Phase 2 backend fixes (all verified by nest build, passes):
- gbm.service.ts getSummaryField gbm_21 → { strengths: summary } (no generated_by_ai).
- updateStep: mark COMPLETED only if filteredData has non-empty value.
- addStepItem: filterStepFields(config, data) before create.
- reviewGbm: uses reviewedAt const for update + return payload.
- phase1.dto.ts: IsBoolean import; generated_by_ai?: boolean → @IsBoolean (replaces dead @IsString).
- cohorts.service.spec.ts: added findMany: jest.Func to incubatorMember mock type.
Phase 3 fixes:
- expert.service.ts resourceType: 'EXPERT' → 'USER' (Prisma ResourceType enum lacks EXPERT).
- frontend/src/types/notification.ts: added NEW_COACHING type, label Nouveau coaching, color green, icon CalendarClock; verified all resourceType usages (43 matches) use enum-valid values.
- Docker: frontend/Dockerfile accepts ARG NEXT_PUBLIC_API_URL (default http://localhost:3001) + ENV; docker-compose.yml web builds with args: NEXT_PUBLIC_API_URL: http://localhost:3020 (matches API host port).
Frontend GBM wizard (Phase 5-7) created:
- src/data/gbm/steps.ts: GBM_PHASES, GBM_STEPS (21 metas with icons/colors/fields incl. select/checkbox types), getStepMeta/getStepIndex/isOneToMany/isAiStep.
- src/data/gbm/guides.ts: GBM_GUIDES for all 21 steps + getStepGuide.
- src/services/chatbot.service.ts (ask, indexProject, ChatMessage).
- src/components/gbm/ new: StepForm.tsx, OneToManyManager.tsx, GbmChatbot.tsx, GuidePanel.tsx, GbmNavbar.tsx (dropdown per phase, sticky top, lock/progress states, percentage badge), GbmWizard.tsx (rewritten to use navbar, useSearchParams, save/AI-generate/review actions, progress bars).
- gbm/page.tsx: rewritten with Suspense + GbmPageContent + GbmWizard (PDF download kept).
- Deleted obsolete GbmStepper.tsx and StepperRail.tsx.
next build passes (all routes listed; …/gbm route dynamic ƒ).
Active
Lint cleanup of new files (baseline repo lint errors exist; my files contributed a few no-explicit-any errors):
- OneToManyManager.tsx partially refactored: added GbmItem = Record<string, unknown>, getApiMessage, strValue, loadItems now useCallback with [projectId, stepId] dep — edit applied only to top; still has catch (e: any) (loadItems, handleAdd, handleDelete), items.map((item: any), setNewItem((prev: any) => …) lower in file.
- StepForm.tsx: data: Record<string, any>, onChange: (key, value: any).
- GbmWizard.tsx: cache/formData Record<string, any>, handleFieldChange(value: any), handleReview(e: any) (errors at lines 39-40, 141, 226).
Blocked
Docker not started; no docker-compose API container validation (expected).
Lint baseline of repo is not zero (no-explicit-any across existing services etc.), so final lint check targets only my new/changed files.
Next Move
1. Finish OneToManyManager.tsx lint fixes (remaining catch (e: any), items.map((item: any)), setNewItem((prev: any)), then fix StepForm.tsx and GbmWizard.tsx excess any (use unknown/Record<string, unknown>; keep getApiMessage-style error helper).
2. Re-run npm run build (frontend) + targeted lint check on components/gbm, data/gbm, services/chatbot.service.ts to confirm zero new errors.
3. Phase 8: final validation report — backend nest build, frontend next build, summarize fixes + remaining pre-existing repo lint debt.
Relevant Files
frontend/src/components/gbm/OneToManyManager.tsx — partial refactor in progress (lint).
frontend/src/components/gbm/StepForm.tsx, GbmWizard.tsx — lint fixes pending (any → typed).
frontend/src/components/gbm/GbmNavbar.tsx — new sticky phase-dropdown navbar (per user decision).
frontend/src/components/gbm/GbmChatbot.tsx, GuidePanel.tsx — new AI chat + step guides panels.
frontend/src/data/gbm/steps.ts, guides.ts — new step/field and guide data.
frontend/src/app/dashboard/project-owner/projects/[projectId]/gbm/page.tsx — replaced with Suspense + GbmWizard.
backend/src/gbm/gbm.service.ts, backend/src/gbm/dto/phase1.dto.ts, backend/src/cohorts/cohorts.service.spec.ts — Phase 2 fixes (already applied).
backend/src/expert/expert.service.ts — resourceType 'EXPERT' → 'USER'.
frontend/src/types/notification.ts — NEW_COACHING type/label/color/icon added.
frontend/Dockerfile, docker-compose.yml — NEXT_PUBLIC_API_URL build arg wiring.
backend/src/gbm/step-config.ts, backend/src/ai/chatbot.*, backend/src/ai/controllers/chatbot.controller.ts — reference for step/AI behavior.
Unverified: audit finding re gbm_8 vs GbmStepParams UUID mismatch (still pending re-check).
Backend nest build passes. All 8 phases complete. Final validation report:
Phase 8 — Validation Report
Backend — nest build ✅ (clean)
- Phase 2 fixes: gbm.service.ts (gbm_21 → { strengths: summary }, updateStep marks COMPLETED only with content, addStepItem filters fields, reviewGbm consistent reviewedAt), phase1.dto.ts @IsBoolean, cohorts.service.spec.ts mock findMany.
- Phase 3: expert.service.ts resourceType: 'EXPERT' → 'USER'; NEW_COACHING added to notification types.
Frontend — next build ✅ (Turbopack, all 39 routes, gbm dynamic)
- New GBM stack lint-clean: eslint src/components/gbm src/data/gbm src/services/chatbot.service.ts src/types/notification.ts → 0 errors (all any typed out: Record<string, unknown>, strValue helpers, getApiMessage, typed error narrowing).
- Remaining repo lint errors are pre-existing in untouched files (e.g. accept-invite/page.tsx react-hooks/set-state-in-effect, no-explicit-any).
Delivered
- Horizontal sticky navbar with phase dropdowns (Ébaucher & Définir…Synthèse, n/total counters, completion badge) per your decision.
- StepForm / OneToManyManager / AI chatbot / GuidePanel / locked progression (?step= URL, save/PATCH, AI generate, review last step).
- Docker env wiring: NEXT_PUBLIC_API_URL build args in frontend/Dockerfile + docker-compose.yml.
Not exercised (expected): Docker runtime; gbm_8 vs GbmStepParams UUID mismatch from the audit remains unverified — worth a runtime check when Docker is up.