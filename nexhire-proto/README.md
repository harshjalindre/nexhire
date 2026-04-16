# NexHire Proto

> Shared Protocol Buffer contracts for inter-service communication in the NexHire platform.

![Protobuf](https://img.shields.io/badge/Protobuf-v3-4285F4?logo=google)

## Overview

This repo contains the `.proto` definitions that serve as the single source of truth for API contracts between NexHire microservices. Currently defines the gRPC interface between `nexhire-api` (Node.js) and `nexhire-engine` (Go).

## Structure

```
nexhire/
└── v1/
    └── engine.proto     # Match, Report, and BulkUpload services
```

## Services Defined

### `MatchService`

| RPC | Request | Response | Description |
|-----|---------|----------|-------------|
| `MatchStudents` | `MatchStudentsRequest` | `MatchStudentsResponse` | Evaluate student eligibility for a drive |
| `GenerateReport` | `ReportRequest` | `ReportResponse` | Generate placement report (PDF/CSV) |
| `ProcessBulkUpload` | `BulkUploadRequest` | `BulkUploadResponse` | Process CSV student uploads |

### Key Messages

| Message | Fields |
|---------|--------|
| `MatchStudentsRequest` | `tenant_id`, `drive_id` |
| `MatchResult` | `student_id`, `name`, `branch`, `cgpa`, `match_score`, `skill_match_count`, `eligible` |
| `ReportRequest` | `tenant_id`, `drive_id`, `type` |
| `BulkUploadRequest` | `tenant_id`, `csv_data`, `upload_type` |

## Code Generation

### Go (nexhire-engine)

```bash
protoc --go_out=. --go-grpc_out=. nexhire/v1/engine.proto
```

### TypeScript (nexhire-api)

```bash
npx grpc_tools_node_protoc \
  --ts_out=./src/proto \
  --grpc_out=./src/proto \
  nexhire/v1/engine.proto
```

## Versioning

Proto definitions follow `nexhire/v1/` namespace. Breaking changes require a new version (`v2/`).

## Related Repos

| Repo | Description |
|------|-------------|
| [nexhire-web](../nexhire-web) | React 19 frontend |
| [nexhire-api](../nexhire-api) | Fastify 5 backend API (consumer) |
| [nexhire-engine](../nexhire-engine) | Go smart-match engine (implementer) |
| [nexhire-infra](../nexhire-infra) | Docker Compose orchestration |

## License

Private — All rights reserved.
