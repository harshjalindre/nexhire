# NexHire API

> Fastify 5 backend API for the NexHire multi-tenant campus placement platform.

![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)

## Overview

RESTful API powering all NexHire operations with multi-tenant isolation, JWT authentication, and real-time WebSocket notifications.

## Tech Stack

- **Runtime** — Node.js 20+
- **Framework** — Fastify 5 (with CORS, Helmet, Rate Limiting, Multipart)
- **Database** — MySQL 8 via Prisma ORM 6
- **Cache** — Redis 7 (ioredis)
- **Auth** — JWT (@fastify/jwt) + bcryptjs
- **Validation** — Zod
- **Storage** — AWS S3 (resume uploads)
- **Logging** — Pino + pino-pretty
- **WebSocket** — @fastify/websocket (real-time notifications)

## API Modules

| Prefix | Module | Description |
|--------|--------|-------------|
| `/api/auth` | Auth | Login, signup (multi-tenant) |
| `/api/drives` | Drives | CRUD + student applications |
| `/api/companies` | Companies | Company CRUD per tenant |
| `/api/students` | Students | Student listing & detail |
| `/api/profile` | Profile | Student profile & resume upload |
| `/api/applications` | Applications | Application tracking & withdrawal |
| `/api/tenants` | Tenants | Tenant CRUD (super admin only) |
| `/api/notifications` | Notifications | List, mark read, mark all read |
| `/api/health` | Health | Server health check |
| `/ws/notifications` | WebSocket | Real-time notification stream |

## Database Schema

8 Prisma models with multi-tenant row-level isolation:

```
Tenant → User → Student → Application
                           ↑
Tenant → Company → Drive ──┘
                   
User → Notification
User → AuditLog
```

## Project Structure

```
├── prisma/
│   ├── schema.prisma    # 8 models, indexes, relations
│   └── seed.ts          # Demo data (MIT Pune, Google, Microsoft)
└── src/
    ├── config/          # env, logger, prisma, redis
    ├── plugins/         # auth (JWT), tenant (isolation)
    ├── utils/           # errors, pagination, audit logging
    ├── modules/
    │   ├── auth/        # schema, service, routes
    │   ├── drives/      # schema, service, routes
    │   ├── companies/   # routes (inline schema)
    │   ├── students/    # routes
    │   ├── profile/     # routes
    │   ├── applications/# routes
    │   ├── tenants/     # routes
    │   └── notifications/# routes
    └── server.ts        # App bootstrap & route registration
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- MySQL 8 running on port 3306
- Redis 7 running on port 6379

### Install & Run

```bash
npm install
cp .env.example .env           # configure DATABASE_URL, JWT_SECRET, etc.
npx prisma generate            # generate Prisma client
npx prisma db push             # create tables
npm run db:seed                # seed demo data
npm run dev                    # http://localhost:3000
```

### Demo Logins (after seeding)

| Email | College Code | Role |
|-------|-------------|------|
| `admin@nexhire.com` | `SYSTEM` | Super Admin |
| `admin@mitpune.edu` | `MIT2024` | College Admin |
| `rahul@mitpune.edu` | `MIT2024` | Student |

> Password for all: `password123`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with tsx watch (hot reload) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled output |
| `npm run db:migrate` | Create Prisma migration |
| `npm run db:push` | Push schema to DB (no migration) |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm test` | Run Vitest tests |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | MySQL connection string |
| `JWT_SECRET` | ✅ | — | JWT signing secret (min 16 chars) |
| `JWT_EXPIRES_IN` | | `7d` | Token expiration |
| `REDIS_URL` | | `redis://localhost:6379` | Redis connection |
| `PORT` | | `3000` | Server port |
| `HOST` | | `0.0.0.0` | Server host |
| `NODE_ENV` | | `development` | Environment |
| `CORS_ORIGIN` | | `http://localhost:5173` | Allowed CORS origin |
| `ENGINE_GRPC_URL` | | `http://localhost:50051` | Go engine URL |
| `AWS_REGION` | | `ap-south-1` | S3 region |
| `S3_BUCKET` | | `nexhire-resumes` | S3 bucket for resumes |

## Docker

```bash
docker build -t nexhire-api .
docker run -p 3000:3000 --env-file .env nexhire-api
```

## Related Repos

| Repo | Description |
|------|-------------|
| [nexhire-web](../nexhire-web) | React 19 frontend |
| [nexhire-engine](../nexhire-engine) | Go smart-match engine |
| [nexhire-proto](../nexhire-proto) | Shared gRPC contracts |
| [nexhire-infra](../nexhire-infra) | Docker Compose orchestration |

## License

Private — All rights reserved.
