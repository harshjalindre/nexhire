# NexHire Infra

> Docker Compose orchestration and deployment configuration for the NexHire platform.

![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)

## Overview

This repo provides the infrastructure configuration to spin up the entire NexHire platform — all 5 containers — with a single command.

## Architecture

```
                  ┌──────────┐
                  │  Nginx   │ :80
                  │ (Web SPA)│
                  └────┬─────┘
                       │ /api/* proxy
                  ┌────▼─────┐        ┌────────────┐
                  │ Fastify  │───────►│  Go Engine  │ :50051
                  │  (API)   │ :3000  │ (Matcher)   │
                  └────┬─────┘        └──────┬──────┘
                       │                     │
              ┌────────▼─────────────────────▼────────┐
              │              MySQL 8                    │ :3306
              └───────────────────────────────────────┘
              ┌───────────────────────────────────────┐
              │              Redis 7                    │ :6379
              └───────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | **Full stack** — all 5 services (MySQL, Redis, API, Engine, Web) |
| `docker-compose.dev.yml` | **Dev only** — infrastructure services (MySQL + Redis) for local development |
| `.env.example` | Environment variables template |

## Quick Start

### Full Stack (Production-like)

```bash
cp .env.example .env
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| API | http://localhost:3000 |
| Engine | http://localhost:50051 |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

### Dev Mode (Infrastructure Only)

Run MySQL + Redis in Docker, apps locally:

```bash
docker compose -f docker-compose.dev.yml up -d

# Terminal 1: API
cd ../nexhire-api
npm install && cp .env.example .env
npx prisma db push && npm run db:seed
npm run dev

# Terminal 2: Web
cd ../nexhire-web
npm install
npm run dev
```

### Tear Down

```bash
docker compose down           # stop containers
docker compose down -v        # stop + delete volumes (wipes DB)
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_ROOT_PASSWORD` | `password` | MySQL root password |
| `JWT_SECRET` | `supersecretjwtkey12345678` | JWT signing secret |
| `CORS_ORIGIN` | `http://localhost` | Allowed CORS origin |

## Repo Layout

All service repos must be siblings in the same parent directory:

```
parent/
├── nexhire-web/        # React frontend
├── nexhire-api/        # Fastify backend
├── nexhire-engine/     # Go engine
├── nexhire-proto/      # Proto contracts
└── nexhire-infra/      # ← This repo (docker-compose references ../nexhire-*)
```

## Useful Commands

```bash
# View logs
docker compose logs -f nexhire-api

# Rebuild a single service
docker compose up -d --build nexhire-api

# Run DB seed inside API container
docker compose exec nexhire-api npx prisma db push
docker compose exec nexhire-api npm run db:seed

# Open Prisma Studio
cd ../nexhire-api && npx prisma studio
```

## Related Repos

| Repo | Description |
|------|-------------|
| [nexhire-web](../nexhire-web) | React 19 frontend |
| [nexhire-api](../nexhire-api) | Fastify 5 backend API |
| [nexhire-engine](../nexhire-engine) | Go smart-match engine |
| [nexhire-proto](../nexhire-proto) | Shared gRPC contracts |

## License

Private — All rights reserved.
