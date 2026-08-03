SHELL := /bin/bash

COMPOSE := docker compose
PNPM := corepack pnpm
MIGRATION := TMPDIR=/tmp $(PNPM) exec tsx migration/cli.ts

.DEFAULT_GOAL := help

.PHONY: build content-inventory db-shell dev doctor down help import-dry-run import-extract import-load import-pilot import-poc import-preflight import-transform import-validate install lint logs migrate setup status storage-init test test-setup typecheck up

help:
	@echo "Trayport web local commands"
	@echo ""
	@echo "  make setup         Create .env, install packages, and start local services"
	@echo "  make dev           Start services and run Next.js/Payload"
	@echo "  make up            Start PostgreSQL, MinIO, and Mailpit"
	@echo "  make down          Stop services without deleting their data"
	@echo "  make status        Show local service status"
	@echo "  make logs          Follow local service logs"
	@echo "  make db-shell      Open psql in the local Payload database"
	@echo "  make storage-init  Recreate/check the local media bucket"
	@echo "  make migrate       Apply committed Payload and application migrations"
	@echo "  make build         Build the production application"
	@echo "  make typecheck     Check TypeScript without emitting files"
	@echo "  make lint          Run ESLint"
	@echo "  make test-setup    Install the Playwright Chromium browser"
	@echo "  make test          Run the repository test suite"
	@echo "  make content-inventory  Inventory production and emit the verified target plan"
	@echo "  make import-pilot  Extract, validate, and publish the production-pilot content"
	@echo "  make import-dry-run  Validate the latest transformed run without writing Payload"
	@echo "  make doctor        Show required tool versions"

.env:
	cp .env.example .env

setup: .env install migrate

install:
	$(PNPM) install --frozen-lockfile

up: .env
	$(COMPOSE) up --detach --wait postgres minio mailpit
	$(MAKE) storage-init

storage-init: .env
	$(COMPOSE) run --rm --no-deps minio-init

down:
	$(COMPOSE) down --remove-orphans

status:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs --follow postgres minio mailpit

db-shell:
	$(COMPOSE) exec postgres sh -lc 'psql --username "$$POSTGRES_USER" --dbname "$$POSTGRES_DB"'

dev: up migrate
	$(PNPM) dev

migrate: up
	$(PNPM) payload migrate

build:
	$(PNPM) build

typecheck:
	$(PNPM) exec tsc --noEmit

lint:
	$(PNPM) lint

test:
	$(PNPM) test

test-setup: install
	$(PNPM) exec playwright install chromium

content-inventory:
	$(MIGRATION) inventory --scope production

import-preflight: up
	$(MIGRATION) preflight

import-extract: import-preflight
	$(MIGRATION) extract

import-transform:
	$(MIGRATION) transform

import-validate:
	$(MIGRATION) validate

import-dry-run: migrate
	$(MIGRATION) load --dry-run

import-load: migrate
	$(MIGRATION) load --publish

import-pilot: migrate import-extract
	$(MIGRATION) transform
	$(MIGRATION) validate
	$(MIGRATION) load --publish

import-poc: import-pilot

doctor:
	node --version
	corepack --version
	$(PNPM) --version
	docker --version
	$(COMPOSE) version
