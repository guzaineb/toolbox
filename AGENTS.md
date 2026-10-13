# AGENTS.md — ProjectStruct

Monorepo with **no workspaces and no root `package.json`**: `backend/` and `frontend/` are independent npm packages — run every command from inside the relevant directory.

**ProjectStruct** is a French-language platform guiding green entrepreneurs through structured project building (GBM, business plan, eco-design, funding, market, impact) plus incubator, cohort, coaching, and evaluation workflows.

## Layout

- `backend/` — NestJS 11 + Prisma 5 + PostgreSQL. Entry `src/main.ts`; modules wired in `src/app.module.ts`. Feature modules are folders under `src/` (gbm, business-plan, eco-design, funding, market, impact, swot, cohorts, evaluations, coaching, juries, assignments, maturity, dashboard, notifications, audit, plus `ai/` for LLM/embeddings/RAG/chatbot). 77 Prisma models in `backend/prisma/schema.prisma`.
- `frontend/` — Next.js 16 App Router + React 19 + Tailwind 4. Role dashboards under `src/app/dashboard/{project-owner,expert,incubator}`. API clients under `src/services/` all route through the axios instance `src/services/api.ts` (JWT read from `localStorage.access_token`).
- `docker-compose.yml` + `nginx/default.conf` + `deploy.sh` — production: **only Nginx is published on the host** (port `HTTP_PORT`, default 80); Postgres, API, and Next stay on the internal `toolbox_net`.
- `README.md` has product context but predates the coaching/evaluation modules and its port diagram is stale. Trust `docker-compose.yml`, `package.json`, and `prisma/schema.prisma` over it.

## Commands (run in `backend/` or `frontend/`)

Backend:
- `npm run start:dev` — watch server on :3000
- `npm run build` (`nest build`); `npm run start:prod` runs `node dist/src/main`
- `npm test` — jest; one suite: `npx jest gbm.service`. `npm run test:e2e` requires a **real PostgreSQL**; unit suites are DB-mocked and need none.
- `npm run seed` (= `seed:users` + `seed:prisma`); `npm run demo:reset` = `migrate reset --force` + seed + verify
- **Tout** (données de démo **et** jeu de test matching + vérification) : `npm run seed:all` (= `seed:users` + `seed:matching` = `seed:prisma --matching` + `verify:demo`). Base neuve complète : `npm run demo:reset:all`. Les seeds sont idempotents (IDs déterministes/`upsert`) et rejouables ; `seed:matching` saute si des comptes `@test.com` existent déjà.
- `npm run verify:matching` (algorithme de matching) n'est pas un seed : vérification autonome.

Frontend:
- `npm run dev` — dev server on **:3001** (`next dev -p 3001 -H 0.0.0.0`)
- `npm test` — vitest; one file: `npx vitest run src/lib/resolve-module-route.spec.ts`
- `npm run lint` — eslint (flat config)
- `npm run build` / `npm run start`

CI (GitHub Actions):
- `.github/workflows/ci.yml` — runs on every push/PR (Node 20). Two parallel jobs (no workspaces): **backend** (`npx prisma generate` + lint + jest unit + `nest build`) and **frontend** (lint + vitest + `next build` with `NEXT_PUBLIC_API_URL=/api`). Unit tests only; no PostgreSQL needed.

## Local dev setup

- Start Postgres: `docker run -d --name toolbox-pg -p 5432:5432 -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=db-toolbox postgres:15-alpine`
- `backend/.env` (copy `backend/.env.example`) must set `DATABASE_URL` for local dev. In Docker, `DATABASE_URL` is **assembled by docker-compose from `DB_*` vars** — never set it there.
- `frontend/.env`: `NEXT_PUBLIC_API_URL=http://localhost:3000`
- After editing `schema.prisma`, run `npx prisma generate` locally (Docker runs it during image build).

## Database / migrations

- Migrations use hand-written descriptive names (e.g. `20260918000000_core_schema_drift_sync`). Create them with `npx prisma migrate dev --name core_<change>` from `backend/`.
- The `202608xxxx`/`202609xxxx` "drift-sync" migrations are **idempotent fixes for existing DBs**. The historical committed versions of `20260822080001_coaching_ai_schema_sync` and `20260901163135_core_d6_action_objective_link` were **not replayable on a fresh DB** (P3018: unconditional `RENAME COLUMN "session_summary"`); the fixed idempotent versions plus `20260918000000_core_schema_drift_sync` are committed (migrations are 15 in total). A fresh deploy only works when this corrected migration set is present — sync `prisma/migrations/` before deploying to a new volume.
- SQL that Prisma does **not** apply: `backend/new_migration.sql`, `migrations/**/migration.sql.bak`, `prisma/templates/001_triggers.sql` (applied manually).
- In Docker, `backend/docker-entrypoint.sh` waits for the DB (`wait-for-db.js`), then runs `prisma migrate deploy` on **every** API boot; `SEED_ON_START=true` additionally seeds demo data (leave `false` in prod).

## Gotchas

- Restart `nginx` after recreating `api`/`web` containers — upstreams are resolved at Nginx startup (`deploy.sh up|update|restart` already does this). Note: `deploy.sh repair-db` is referenced in the entrypoint but is **not implemented** as a subcommand.
- AI needs `GROQ_API_KEY`. Without `CHROMA_URL`, Chroma is mocked: summaries/chat work, RAG semantic search does not. `EMBEDDING_PROVIDER=local` downloads the Xenova model (~90 MB) on the first AI call.
- Backend ESLint: `no-explicit-any` is off, prettier enforced (single quotes, trailing commas). `.gitattributes` pins LF for `*.sh` and `Dockerfile` (breaks shebangs otherwise). Frontend TS is `strict`.
- Node 20+.

## Existing instruction files

- `frontend/AGENTS.md` — read before touching frontend (Next 16 breaking changes, UI conventions, GBM step sync).
- `frontend/CLAUDE.md` — only contains `@AGENTS.md`.