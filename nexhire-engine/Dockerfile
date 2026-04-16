# ─── Stage 1: Build ─────────────────────────────────
FROM golang:1.22-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /engine ./main.go

# ─── Stage 2: Production ────────────────────────────
FROM alpine:3.20 AS production
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /engine .
EXPOSE 50051
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:50051/health || exit 1
CMD ["./engine"]
