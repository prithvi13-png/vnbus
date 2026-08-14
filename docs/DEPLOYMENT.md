# Deployment

Milestone 11 prepares the platform for production deployment without connecting live supplier APIs or a live payment gateway.

## Target Architecture

```mermaid
flowchart TD
  User["User"] --> Cloudflare["Cloudflare DNS, TLS, WAF, rate limits"]
  Cloudflare --> Vercel["Vercel Next.js frontend"]
  Vercel --> API["NestJS API Docker service"]
  API --> Postgres["Managed PostgreSQL"]
  API --> Redis["Managed Redis"]
  API --> Queues["BullMQ queues"]
  API --> S3["S3-compatible storage"]
  API --> Email["Email provider interface"]
  API --> Suppliers["Supplier adapter layer"]
  API --> Payments["Payment adapter layer"]
  Queues --> Worker["Worker Docker service"]
  Queues --> Scheduler["Scheduler Docker service"]
```

## Environments

- Development: `.env.development`, local Docker PostgreSQL/Redis, mock supplier, mock payment.
- Test: `.env.test`, isolated test database, mock supplier, mock payment.
- Staging: `.env.staging`, production-shaped infrastructure, mock supplier, mock payment.
- Production: `.env.production`, production infrastructure and secret references, mock supplier/payment until onboarding is complete.

## Frontend Deployment

- Deploy `apps/web` to Vercel from the monorepo using `vercel.json`.
- Set only public variables in Vercel: `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_MAINTENANCE_MODE`.
- Keep backend secrets out of Vercel client variables.
- Configure the production domain behind Cloudflare and point it to Vercel.

Recommended Vercel settings:

- Production branch: `main`
- Build command: `pnpm --filter @vnbus/web build`
- Install command: `pnpm install --frozen-lockfile`
- Output directory: `apps/web/.next`
- Preview deployments: use staging API URL and mock supplier/payment.

## Cloudflare

Recommended Cloudflare setup:

- DNS proxied for the frontend domain.
- TLS mode set to full/strict when the origin supports it.
- Always HTTPS enabled.
- WAF rules enabled for common application attacks.
- Rate limits for auth, search, booking, and admin paths.
- Bot protection enabled for public search and auth routes.
- Cache only static frontend assets; do not cache authenticated, booking, payment, supplier, admin, or API mutation routes.
- Add security headers at the edge only when they do not conflict with app headers.

## Backend Deployment

Build separate images:

```bash
docker build -f apps/api/Dockerfile -t vnbus-api .
docker build -f apps/api/Dockerfile.worker -t vnbus-worker .
docker build -f apps/api/Dockerfile.scheduler -t vnbus-scheduler .
docker build -f apps/web/Dockerfile -t vnbus-web .
```

Run separate services:

- API: `node dist/main.js`
- Worker: `node dist/worker.js`
- Scheduler: `node dist/scheduler.js`

## Migration Procedure

1. Take a verified database backup.
2. Run `pnpm db:generate`.
3. Run Prisma migrations against staging.
4. Run smoke and production-style E2E tests.
5. Run migrations against production during an approved release window.
6. Deploy API, worker, scheduler, then frontend.

## Health Checks

- Liveness: `GET /api/v1/health/live`
- Readiness: `GET /api/v1/health/ready`
- Full health: `GET /api/v1/health`
- Prometheus metrics: `GET /api/v1/metrics/prometheus`

In staging/production, readiness reports `DOWN` when required database or Redis config is missing or still a placeholder.
