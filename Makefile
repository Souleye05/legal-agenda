# ============================================
# LEGAL AGENDA - Makefile
# Commandes pour la gestion du projet
# ============================================

# Variables de configuration
DOCKER_COMPOSE_PROD_FILE=docker-compose.prod.yml
ENV_FILE=.env

# 📖 AIDE
.PHONY: help
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "📦 LEGAL AGENDA - Commandes Make disponibles"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "🚀 PRODUCTION"
	@echo "  make build-prod          - Build les images Docker"
	@echo "  make up-prod             - Demarrer en production"
	@echo "  make start-prod          - Build + demarrer en prod"
	@echo "  make restart-prod        - Redemarrer en production"
	@echo "  make stop-prod           - Arreter la production"
	@echo "  make down-prod           - Arreter et supprimer les conteneurs"
	@echo "  make logs-prod           - Voir les logs"
	@echo "  make status-prod         - Status des conteneurs"
	@echo ""
	@echo "📦 MIGRATIONS PRISMA"
	@echo "  make prisma-migrate-deploy       - Appliquer les migrations"
	@echo "  make prisma-migrate-status       - Statut des migrations"
	@echo "  make prisma-generate             - Generer le client Prisma"
	@echo "  make prisma-studio               - Interface graphique DB"
	@echo ""
	@echo "🗄️  BASE DE DONNEES"
	@echo "  make db-shell            - Shell PostgreSQL"
	@echo "  make db-backup           - Sauvegarder la DB"
	@echo "  make db-restore FILE=x   - Restaurer depuis un backup"
	@echo ""
	@echo "🛠️  UTILITAIRES"
	@echo "  make app-shell           - Shell dans le conteneur Backend"
	@echo "  make frontend-shell      - Shell dans le conteneur Frontend"
	@echo "  make backend-logs        - Logs du backend"
	@echo "  make frontend-logs       - Logs du frontend"
	@echo "  make clean-all           - Nettoyer completement (volumes)"
	@echo ""
	@echo "📚 QUICK START"
	@echo "  1. Renommer env.prod en .env (a la racine)"
	@echo "  2. Modifier les variables dans .env et backend/.env"
	@echo "  3. make start-prod"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ============================================
# 🚀 COMMANDES PRODUCTION
# ============================================

# Build pour la production
build-prod:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) build --no-cache

# Demarrer en production (sans build)
up-prod:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) up -d

# Build + Demarrer en production
start-prod: build-prod up-prod
	@echo "✅ Legal Agenda demarre avec succes!"
	@echo "🌐 Frontend: https://app.legal-agenda.pgiis.sn"
	@echo "🔧 Backend:  https://api.legal-agenda.pgiis.sn"

# Arreter et supprimer les conteneurs
down-prod:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) down

# Redemarrer en production
restart-prod:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) down
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) up -d --build

# Arreter la production
stop-prod:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) stop

# Logs production
logs-prod:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) logs -f

# Status production
status-prod:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) ps

# ============================================
# 📦 MIGRATIONS PRISMA
# ============================================

# Appliquer les migrations Prisma en production
prisma-migrate-deploy:
	@echo "🚀 Deploiement des migrations Prisma..."
	docker exec -it legal-agenda-backend npx prisma migrate deploy

# Generer le client Prisma
prisma-generate:
	@echo "⚙️  Generation du client Prisma..."
	docker exec -it legal-agenda-backend npx prisma generate

# Verifier le statut des migrations
prisma-migrate-status:
	@echo "📊 Statut des migrations Prisma..."
	docker exec -it legal-agenda-backend npx prisma migrate status

# Ouvrir Prisma Studio (interface graphique pour la base de donnees)
prisma-studio:
	@echo "🎨 Ouverture de Prisma Studio..."
	@echo "⚠️  Vous devrez peut-etre exposer le port 5555"
	docker exec -it legal-agenda-backend npx prisma studio

# ============================================
# 🗄️ BASE DE DONNEES
# ============================================

# Variables de la base de donnees (lues depuis .env.prod)
ifneq (,$(wildcard $(ENV_FILE)))
DB_USER ?= $(shell grep -E "^DB_USER=" $(ENV_FILE) | cut -d '=' -f2)
DB_PASSWORD ?= $(shell grep -E "^DB_PASSWORD=" $(ENV_FILE) | cut -d '=' -f2)
DB_NAME ?= $(shell grep -E "^DB_NAME=" $(ENV_FILE) | cut -d '=' -f2)
DB_CONTAINER ?= $(shell grep -E "^DB_CONTAINER=" $(ENV_FILE) | cut -d '=' -f2)
endif

# Se connecter au container PostgreSQL
db-shell:
	@if [ -z "$(DB_USER)" ] || [ -z "$(DB_PASSWORD)" ] || [ -z "$(DB_NAME)" ] || [ -z "$(DB_CONTAINER)" ]; then \
		echo "❌ Variables DB introuvables. Verifiez $(ENV_FILE)"; \
		exit 1; \
	fi
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME)

# Sauvegarder la base (dump SQL)
db-backup:
	@if [ -z "$(DB_USER)" ] || [ -z "$(DB_NAME)" ] || [ -z "$(DB_CONTAINER)" ]; then \
		echo "❌ Variables DB introuvables. Verifiez $(ENV_FILE)"; \
		exit 1; \
	fi
	@if [ ! -d backups ]; then mkdir -p backups; fi
	@FILE="backups/$(DB_NAME)_$$(date +%Y%m%d_%H%M%S).sql"; \
	echo "📦 Backup -> $$FILE"; \
	docker exec $(DB_CONTAINER) pg_dump -U $(DB_USER) $(DB_NAME) > $$FILE; \
	echo "✅ Backup termine: $$FILE"

# Restaurer la base depuis un dump SQL
db-restore:
	@if [ -z "$(DB_USER)" ] || [ -z "$(DB_NAME)" ] || [ -z "$(DB_CONTAINER)" ]; then \
		echo "❌ Variables DB introuvables. Verifiez $(ENV_FILE)"; \
		exit 1; \
	fi
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Usage: make db-restore FILE=backup.sql"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		echo "❌ Fichier $(FILE) introuvable"; \
		exit 1; \
	fi
	@cat $(FILE) | docker exec -i $(DB_CONTAINER) psql -U $(DB_USER) $(DB_NAME)
	@echo "✅ Base restauree depuis $(FILE)"

# ============================================
# 🛠️ UTILITAIRES
# ============================================

# Ouvrir un shell dans le conteneur Backend
app-shell:
	docker exec -it legal-agenda-backend sh

# Ouvrir un shell dans le conteneur Frontend
frontend-shell:
	docker exec -it legal-agenda-frontend sh

# Logs du backend uniquement
backend-logs:
	docker logs -f legal-agenda-backend --tail 100

# Logs du frontend uniquement
frontend-logs:
	docker logs -f legal-agenda-frontend --tail 100

# Logs de la base de donnees
db-logs:
	docker logs -f legal-agenda-db --tail 100

# Afficher les conteneurs en cours
ps:
	docker ps

# Verifier la sante des services
health-check:
	@echo "🏥 Verification de la sante des services..."
	@docker compose -f $(DOCKER_COMPOSE_PROD_FILE) ps --format "table {{.Name}}\t{{.Status}}"

# Nettoyer completement (ATTENTION: supprime les volumes)
clean-all:
	@echo "⚠️  ATTENTION: Cette commande va supprimer tous les conteneurs et volumes!"
	@read -p "Etes-vous sur? [y/N] " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker compose -f $(DOCKER_COMPOSE_PROD_FILE) down --volumes --rmi all --remove-orphans; \
		echo "✅ Nettoyage termine"; \
	else \
		echo "❌ Operation annulee"; \
	fi

# ============================================
# 🛑 RACCOURCIS RAPIDES
# ============================================

# Arreter seulement le backend
stop-backend:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) stop legal-agenda-backend

# Redemarrer seulement le backend
restart-backend:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) restart legal-agenda-backend

# Arreter seulement le frontend
stop-frontend:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) stop legal-agenda-frontend

# Redemarrer seulement le frontend
restart-frontend:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) restart legal-agenda-frontend

# Gestion du conteneur PostgreSQL uniquement
start-db:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) up -d legal-agenda-db

stop-db:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) stop legal-agenda-db

restart-db:
	docker compose -f $(DOCKER_COMPOSE_PROD_FILE) restart legal-agenda-db
