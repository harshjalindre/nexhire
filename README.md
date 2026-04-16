# NexHire — Multi-Tenant Campus Placement SaaS Platform

> A production-grade, microservices-based SaaS platform that digitizes and automates the entire campus placement lifecycle for colleges, students, and recruiters.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify)
![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)

---

## 🧩 Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                        CLIENTS                                │
│              Browser / Mobile / PWA                           │
└──────────────────────────┬────────────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   nexhire-web   │  :5173 (dev) / :80 (prod)
                  │  React 19 + SPA │
                  │  Nginx Reverse  │
                  │     Proxy       │
                  └────────┬────────┘
                           │ /api/*   /ws/*
                  ┌────────▼────────┐        ┌──────────────────┐
                  │   nexhire-api   │───────►│  nexhire-engine  │
                  │  Fastify 5 API  │ :3000  │  Go Match Engine │ :50051
                  │  JWT + RBAC     │        │  Worker Pool     │
                  └──┬──────────┬───┘        └────────┬─────────┘
                     │          │                     │
              ┌──────▼──┐  ┌───▼────┐         ┌──────▼──┐
              │PostgreSQL│  │ Redis  │         │PostgreSQL│
              │  :5432   │  │ :6379  │         │ (shared) │
              └──────────┘  └────────┘         └──────────┘
```

---

## 📂 Repository Structure

```
nexhire/
├── nexhire-web/        → Frontend SPA
├── nexhire-api/        → Backend REST API
├── nexhire-engine/     → Smart-Match Microservice
├── nexhire-proto/      → Shared gRPC Contracts
├── nexhire-infra/      → Docker Compose & Deployment
└── README.md
```

### [`nexhire-web/`](./nexhire-web) — Frontend

**React 19 • TypeScript • Vite 6 • Tailwind CSS • shadcn/ui • Zustand • React Query**

The user-facing SPA with three role-based dashboards:

| Role | Pages | Key Features |
|------|-------|-------------|
| **Super Admin** | Admin Dashboard, Tenant Management | Create/edit/delete colleges, platform-wide analytics |
| **College Admin** | College Dashboard, Drives, Companies, Students | Full CRUD on drives & companies, student overview, eligibility tracking |
| **Student** | Student Dashboard, Drive Listings, Applications, Profile, Resume | Browse & apply to drives, track applications, build profile |

**Highlights:** Debounced search (300ms), skeleton loading states, lazy-loaded routes, Framer Motion animations, PWA-ready, dark/light theme, responsive sidebar layout.

---

### [`nexhire-api/`](./nexhire-api) — Backend API

**Fastify 5 • TypeScript • Prisma 6 • PostgreSQL 17 • Redis 7 • Zod • JWT**

RESTful API serving 10 route groups with multi-tenant row-level isolation:

| Endpoint | Module | Operations |
|----------|--------|-----------|
| `/api/auth` | Authentication | Login, signup (tenant-scoped) |
| `/api/drives` | Placement Drives | CRUD + student apply with eligibility checks |
| `/api/companies` | Companies | CRUD per tenant |
| `/api/students` | Students | List, filter, search |
| `/api/profile` | Student Profile | Get/update profile, resume upload |
| `/api/applications` | Applications | List, withdraw |
| `/api/tenants` | Tenant Management | CRUD (super admin only) |
| `/api/notifications` | Notifications | List, mark read, mark all read |
| `/api/health` | Health Check | Server status |
| `/ws/notifications` | WebSocket | Real-time notification stream |

**Database:** 8 Prisma models — `Tenant`, `User`, `Student`, `Company`, `Drive`, `Application`, `Notification`, `AuditLog` — with composite indexes and unique constraints.

**Security:** JWT authentication, role-based authorization, tenant isolation middleware, bcrypt password hashing, Helmet headers, CORS, rate limiting (100 req/min).

---

### [`nexhire-engine/`](./nexhire-engine) — Smart-Match Engine

**Go 1.22 • Fiber v3 • GORM • MySQL/PostgreSQL • Zap Logger**

High-performance microservice for compute-intensive operations:

| Endpoint | Function |
|----------|----------|
| `POST /api/match` | Match students to drives using weighted scoring (CGPA 40%, backlogs 20%, branch 20%, skills 20%) |
| `POST /api/reports` | Generate placement reports (PDF/CSV) |
| `POST /api/bulk/students` | Bulk CSV student imports |

Uses a **concurrent worker pool** (8 goroutines) for parallel student evaluation — processes thousands of students in milliseconds.

---

### [`nexhire-proto/`](./nexhire-proto) — Shared Contracts

**Protocol Buffers v3**

Single source of truth for inter-service API contracts. Defines `MatchService` with 3 RPCs: `MatchStudents`, `GenerateReport`, `ProcessBulkUpload`.

---

### [`nexhire-infra/`](./nexhire-infra) — Infrastructure

**Docker Compose • Nginx • Multi-stage Dockerfiles**

- `docker-compose.yml` — Full-stack: 5 containers (PostgreSQL, Redis, API, Engine, Web)
- `docker-compose.dev.yml` — Dev mode: infrastructure only (PostgreSQL + Redis)
- Nginx reverse proxy config with `/api/` and `/ws/` proxying

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20
- PostgreSQL 17
- Go 1.22+ (for engine)
- Redis 7 (optional)

### Local Development

```bash
# 1. Backend API
cd nexhire-api
npm install
cp .env.example .env          # set DATABASE_URL, JWT_SECRET
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts         # seed demo data
npx tsx src/server.ts          # → http://localhost:3000

# 2. Frontend (new terminal)
cd nexhire-web
npm install
npm run dev                    # → http://localhost:5173

# 3. Engine (new terminal, optional)
cd nexhire-engine
cp .env.example .env
go run main.go                 # → http://localhost:50051
```

### Demo Accounts

| Email | College Code | Password | Role |
|-------|-------------|----------|------|
| `admin@nexhire.com` | `SYSTEM` | `password123` | Super Admin |
| `admin@mitpune.edu` | `MIT2024` | `password123` | College Admin |
| `rahul@mitpune.edu` | `MIT2024` | `password123` | Student |

---

## 🛠 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 3.4, shadcn/ui, Zustand 5, React Query 5, React Hook Form, Zod, Framer Motion |
| Backend | Fastify 5, TypeScript, Prisma 6, Zod, Pino, JWT, bcryptjs |
| Engine | Go 1.22, Fiber v3, GORM, Zap |
| Database | PostgreSQL 17, Redis 7 |
| DevOps | Docker, Docker Compose, Nginx, multi-stage builds |
| Contracts | Protocol Buffers v3 |

---

## 📄 License

Private — All rights reserved.
