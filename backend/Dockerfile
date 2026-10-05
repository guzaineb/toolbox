# syntax=docker/dockerfile:1

# ---------- Base de dépendances (avec devDependencies pour le build) ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Outils nécessaires aux modules natifs (bcrypt, onnxruntime) si pas de prebuild
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci


# ---------- Génération du client Prisma + compilation TypeScript ----------
FROM deps AS build
WORKDIR /app

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build


# ---------- Dépendances de production uniquement ----------
FROM node:20-bookworm-slim AS prod-deps
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force


# ---------- Image finale ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    UPLOADS_DIR=/app/uploads

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Utilisateur non-root
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs api

COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build     --chown=nodejs:nodejs /app/dist         ./dist
COPY --from=build     --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build     --chown=nodejs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Schéma + migrations Prisma (nécessaires pour `prisma migrate deploy`)
COPY --chown=nodejs:nodejs prisma ./prisma
COPY --chown=nodejs:nodejs package.json wait-for-db.js docker-entrypoint.sh ./

# Le bit d'exécution n'est pas garanti par COPY selon l'OS hôte (Windows).
RUN chmod +x ./docker-entrypoint.sh ./wait-for-db.js

# Dossier uploads monté en volume : il doit appartenir à l'utilisateur non-root
RUN mkdir -p /app/uploads/ai-documents /app/uploads/temp \
    && chown -R nodejs:nodejs /app/uploads

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS http://127.0.0.1:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/main"]
