# NexHire Web

> React 19 frontend for the NexHire multi-tenant campus placement platform.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

## Overview

NexHire Web is the frontend SPA serving three role-based dashboards:

| Role | Dashboard | Features |
|------|-----------|----------|
| **Super Admin** | `/admin` | Tenant management, platform analytics |
| **College Admin** | `/college` | Drive creation, company management, student overview |
| **Student** | `/student` | Drive discovery, applications, profile & resume |

## Tech Stack

- **Framework** — React 19 + TypeScript
- **Build** — Vite 6 with SWC
- **Styling** — Tailwind CSS 3.4 + shadcn/ui (Radix primitives)
- **State** — Zustand 5 (auth, notifications)
- **Data Fetching** — TanStack React Query 5
- **Forms** — React Hook Form + Zod validation
- **Routing** — React Router 7 (lazy-loaded routes)
- **Animations** — Framer Motion 11
- **Icons** — Lucide React
- **PWA** — Vite PWA Plugin + Workbox

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui primitives (Button, Card, Badge, etc.)
│   ├── shared/       # Logo, Sidebar, Topbar, StatCard, FileUploader, etc.
│   └── animations/   # FadeIn motion wrapper
├── features/
│   ├── auth/         # Login/signup hooks & schemas
│   ├── drives/       # Drive CRUD hooks & schemas
│   ├── companies/    # Company CRUD hooks & schemas
│   ├── students/     # Student listing hooks
│   ├── applications/ # Application tracking hooks
│   ├── profile/      # Profile & resume upload hooks
│   ├── tenants/      # Tenant management hooks (super admin)
│   └── notifications/# Notification hooks & store sync
├── layouts/          # AuthLayout, DashboardLayout
├── pages/            # Route-level page components
├── stores/           # Zustand stores (authStore, notificationStore)
├── types/            # TypeScript type definitions
└── lib/              # Utilities, API client, constants, logger
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- [nexhire-api](../nexhire-api) running on port 3000

### Install & Run

```bash
npm install
cp .env.example .env       # edit VITE_API_URL if needed
npm run dev                 # http://localhost:5173
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite HMR) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint check |
| `npm run test` | Run Vitest tests |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Backend API base URL |
| `VITE_APP_NAME` | `NexHire` | App display name |

## Docker

```bash
docker build -t nexhire-web .
docker run -p 80:80 nexhire-web
```

Multi-stage build: Node (build) → Nginx (serve). The `nginx.conf` proxies `/api/` and `/ws/` to the backend.

## Related Repos

| Repo | Description |
|------|-------------|
| [nexhire-api](../nexhire-api) | Fastify 5 backend API |
| [nexhire-engine](../nexhire-engine) | Go smart-match engine |
| [nexhire-proto](../nexhire-proto) | Shared gRPC contracts |
| [nexhire-infra](../nexhire-infra) | Docker Compose orchestration |

## License

Private — All rights reserved.
