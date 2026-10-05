# syntax=docker/dockerfile:1

# ---------- Base de dépendances ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci


# ---------- Build Next.js ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# URL publique de l'API, injectée à la construction (NEXT_PUBLIC_* = inline dans le bundle).
# En production derrière Nginx, on utilise un chemin relatif "/api" : même build
# valable pour toutes les IP/domaines, et requête same-origin (pas de CORS).
ARG NEXT_PUBLIC_API_URL=/api
# Nginx relaie déjà /uploads/ vers l'API : Next ne doit émettre aucune rewrite
# (sinon le conteneur web tenterait de joindre un localhost inexistant).
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    UPLOADS_PROXY_URL=none \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ---------- Image finale (standalone) ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs web

# Le serveur standalone embarque uniquement les fichiers traces par Next.js
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
# public/ et .next/static/ ne sont pas copiés par standalone : on les ajoute
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
