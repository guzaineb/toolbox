#!/usr/bin/env bash
# ============================================================
#  Déploiement ProjectStruct sur le serveur (Docker Compose)
#  Usage : ./deploy.sh [up|down|logs|restart|update|status]
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"

COMPOSE="docker compose"

info()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn()  { printf '\033[1;33m[ATTENTION]\033[0m %s\n' "$*"; }
fail()  { printf '\033[1;31m[ERREUR]\033[0m %s\n' "$*" >&2; exit 1; }

require_docker() {
  command -v docker >/dev/null 2>&1 || fail "Docker n'est pas installé."
  docker info >/dev/null 2>&1 || fail "Le démon Docker ne tourne pas. Lancez : sudo systemctl start docker"
  docker compose version >/dev/null 2>&1 || fail "Le plugin Docker Compose v2 est requis."
}

ensure_env() {
  if [ ! -f .env ]; then
    info "Création de .env à partir de .env.example"
    cp .env.example .env
    warn ".env créé : renseignez DATABASE_PASSWORD et JWT_SECRET avant de continuer."
    warn "Génération de secrets :  openssl rand -hex 48"
    fail "Complétez .env puis relancez ./deploy.sh up"
  fi
  # Vérifie que les secrets critiques ne sont pas restés à leur valeur d'exemple
  if grep -q "CHANGE_MOI" .env; then
    fail "Secrets non remplacés dans .env (CHANGE_MOI...). Éditez le fichier."
  fi
  if ! grep -qE '^DATABASE_PASSWORD=[A-Za-z0-9]+$' .env; then
    fail "DATABASE_PASSWORD doit être non vide et alphanumérique uniquement (openssl rand -hex 48)."
  fi
  if [ "$(grep -c '^SEED_ON_START=true$' .env || true)" -gt 0 ]; then
    warn "SEED_ON_START=true : les données de démo seront (re)chargées à chaque redémarrage."
  fi
}

# Lit une valeur de .env sans l'exporter dans l'environnement du script.
env_value() {
  sed -n "s/^$1=//p" .env 2>/dev/null | head -n 1
}

wait_healthy() {
  info "Attente que l'API soit saine (timeout 180s)..."
  local i
  for i in $(seq 1 60); do
    if docker compose exec -T api curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1; then
      info "API saine."
      return 0
    fi
    sleep 3
  done
  warn "L'API ne répond pas encore. Consultation des journaux : $COMPOSE logs -f api"
  return 1
}

case "${1:-up}" in
  up)
    require_docker
    ensure_env
    info "Construction des images..."
    $COMPOSE build
    info "Démarrage des services..."
    $COMPOSE up -d --remove-orphans
    wait_healthy || true
    # Nginx résout les upstreams au démarrage : on le redémarre après les
    # recréations de conteneurs pour éviter des IP devenues obsolètes.
    $COMPOSE restart nginx
    info ""
    info "Application déployée :  $(env_value FRONTEND_URL)"
    info "Suivre les journaux :  $COMPOSE logs -f"
    ;;

  update)
    require_docker
    ensure_env
    info "Récupération de la dernière version du dépôt..."
    git pull --ff-only
    info "Construction et redémarrage..."
    $COMPOSE build
    $COMPOSE up -d --remove-orphans
    wait_healthy || true
    $COMPOSE restart nginx
    info "Mise à jour terminée."
    ;;

  down)
    require_docker
    info "Arrêt des services (les volumes et la base sont conservés)..."
    $COMPOSE down
    ;;

  restart)
    require_docker
    $COMPOSE restart
    $COMPOSE restart nginx
    ;;

  logs)
    require_docker
    $COMPOSE logs -f --tail=100 "${2:-}"
    ;;

  status)
    require_docker
    $COMPOSE ps
    ;;

  *)
    fail "Commande inconnue : $1 (utilisez up, down, logs, restart, update, status)"
    ;;
esac
