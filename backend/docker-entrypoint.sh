#!/bin/sh
set -e

echo "==> Attente de la base de données..."
node wait-for-db.js

echo "==> Application des migrations Prisma..."
npx prisma migrate deploy

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "==> SEED_ON_START=true : chargement des données de démonstration"
  node dist/prisma/seeds/user-seed.js
  node dist/prisma/seed.js
else
  echo "==> SEED_ON_START=false : seed ignoré (migrations uniquement)"
fi

echo "==> Démarrage de l'API"
exec "$@"
