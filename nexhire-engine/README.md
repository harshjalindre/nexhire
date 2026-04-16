# NexHire Engine

> Go-based smart-match engine for high-performance student–drive eligibility matching and report generation.

![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go)
![Fiber](https://img.shields.io/badge/Fiber-v3-00ACD7)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)

## Overview

NexHire Engine is a separate microservice that handles compute-heavy operations the Node.js API offloads:

- **Smart Matching** — Concurrent student eligibility evaluation using a worker pool
- **Report Generation** — Placement reports (PDF/CSV) for drives
- **Bulk Processing** — CSV student uploads with validation

## Tech Stack

- **Language** — Go 1.22
- **HTTP** — Fiber v3 (beta)
- **ORM** — GORM (MySQL driver)
- **Logging** — Uber Zap (structured logging)
- **Config** — godotenv

## Architecture

```
┌─────────────────────────────────────────┐
│              Fiber HTTP Server           │
│  POST /api/match                         │
│  POST /api/reports                       │
│  POST /api/bulk/students                 │
│  GET  /health                            │
└──────────────┬──────────────────────────┘
               │
    ┌──────────▼──────────┐
    │  SmartMatchEngine    │
    │  ┌────────────────┐  │
    │  │  Worker Pool    │  │
    │  │  (8 goroutines) │  │
    │  └────────────────┘  │
    └──────────┬───────────┘
               │
    ┌──────────▼──────────┐
    │  MySQL (shared DB)   │
    └──────────────────────┘
```

### Match Scoring Algorithm

Each student is scored (0–100) based on four criteria:

| Criteria | Weight | Logic |
|----------|--------|-------|
| CGPA | 40% | `min(cgpa/10, 1.0) × 40` |
| Backlogs | 20% | `20` if zero backlogs |
| Branch | 20% | `20` if branch matches drive |
| Skills | 20% | `matchCount / totalSkills × 20` |

Students are marked **ineligible** if CGPA < min, backlogs > max, or branch doesn't match.

## Project Structure

```
├── main.go                  # Entry point
├── go.mod                   # Dependencies
├── Dockerfile               # Multi-stage (Go build → Alpine)
└── internal/
    ├── config/
    │   └── database.go      # GORM MySQL connection
    ├── models/
    │   └── models.go        # Student, Drive, Match types
    ├── matcher/
    │   └── engine.go        # Worker pool + scoring logic
    └── handler/
        └── server.go        # Fiber routes
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/match` | Match students to a drive |
| `POST` | `/api/reports` | Generate placement report |
| `POST` | `/api/bulk/students` | Bulk student CSV upload |

### Match Request

```json
POST /api/match
{
  "tenantId": "uuid",
  "driveId": "uuid"
}
```

### Match Response

```json
{
  "driveId": "uuid",
  "totalFound": 150,
  "eligible": 42,
  "processedMs": 12,
  "results": [
    {
      "studentId": "uuid",
      "branch": "Computer Science",
      "cgpa": 9.1,
      "matchScore": 95.5,
      "skillMatchCount": 3,
      "eligible": true
    }
  ]
}
```

## Getting Started

### Prerequisites

- Go 1.22+
- MySQL 8 running on port 3306

### Run Locally

```bash
cp .env.example .env         # configure DB credentials
go mod download
go run main.go               # http://localhost:50051
```

### Build

```bash
go build -o engine ./main.go
./engine
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENV` | `development` | Environment mode |
| `ENGINE_PORT` | `50051` | Server port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | `password` | MySQL password |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `nexhire` | Database name |
| `DATABASE_URL` | — | Full DSN (overrides above) |

## Docker

```bash
docker build -t nexhire-engine .
docker run -p 50051:50051 --env-file .env nexhire-engine
```

## Related Repos

| Repo | Description |
|------|-------------|
| [nexhire-web](../nexhire-web) | React 19 frontend |
| [nexhire-api](../nexhire-api) | Fastify 5 backend API |
| [nexhire-proto](../nexhire-proto) | Shared gRPC contracts |
| [nexhire-infra](../nexhire-infra) | Docker Compose orchestration |

## License

Private — All rights reserved.
