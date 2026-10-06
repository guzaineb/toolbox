#!/bin/sh
set -e

echo "==> Attente de la base de données..."
node wait-for-db.js

echo "==> Application des migrations Prisma..."
if ! npx prisma migrate deploy; then
  echo "ERREUR : application des migrations impossible." >&2
  echo "Si l'erreur est P3009 (migration en échec), exécutez sur le serveur :" >&2
  echo "    bash deploy.sh repair-db" >&2
  exit 1

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "==> SEED_ON_START=true : chargement des données de démonstration"
  node dist/prisma/seeds/user-seed.js
  node dist/prisma/seed.js
else
  echo "==> SEED_ON_START=false : seed ignoré (migrations uniquement)"


echo "==> Démarrage de l'API"
exec "$@"
