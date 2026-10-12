<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend conventions (ProjectStruct)

- Next.js 16.2.1 App Router + React 19. TypeScript is `strict` — `any` is flagged by lint; keep new code typed.
- Role dashboards live under `src/app/dashboard/{project-owner,expert,incubator}`; shared UI kit is `src/components/shared/ui.tsx` (`Card`, `CardHeader`, `Button` with `size="sm"`, `Badge` variants green/amber/red/blue/gray, `Input`, `Select`, `Textarea`, `Toggle`, ...). Prefer it over ad-hoc markup.
- Theme tokens are Tailwind 4 CSS variables in `src/app/globals.css`: `ink`, `ink-2`, `ink-3`, `moss`, `moss-dark`, `accent`, `amber`, `blue`, `green`, `surface`, `bg`. Only small fixed sizes (`text-[10px]`–`text-[13px]`) use arbitrary values; use tokens/standard classes elsewhere.
- Icons: `lucide-react` — verify an icon export exists before importing it.
- All UI copy is French.
- Feature API wrappers in `src/services/*.ts` wrap the shared axios instance `src/services/api.ts` (reads `localStorage.access_token`, redirects to `/login` on 401).
- Tests: vitest, `*.spec.ts` under `src/` (node env) — `npx vitest run <path-to-spec>`.
- **GBM**: step metadata lives in `src/data/gbm/steps.ts` (24 step metas `gbm_1`..`gbm_21`, incl. sub-steps `7a/7b`, `12a/12b`, `14a/14b`, across 5 phases; one-to-many and AI-generated steps are flagged) and must stay in sync with `backend/src/gbm/step-registry.ts`. Navigation is driven by the `?step=gbm_X` query param; a step unlocks only after the previous one is validated (backend `COMPLETED` status).