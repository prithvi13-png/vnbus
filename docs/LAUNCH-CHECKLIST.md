# Launch Checklist

## Infrastructure

- Cloudflare DNS, TLS, WAF, DDoS protection, bot protection, and rate-limit rules configured.
- Vercel production and preview projects configured.
- Backend API, worker, and scheduler services deployed separately.
- PostgreSQL, Redis, S3-compatible storage, and email provider configured.
- Domains, SSL, redirects, and canonical URLs verified.

## Configuration

- `.env.production` values supplied through secret manager or hosting secrets.
- No real secrets committed to Git.
- `SUPPLIER_MODE=mock` until supplier go-live.
- `PAYMENT_PROVIDER=MOCK` until gateway go-live.
- Maintenance mode tested.
- Feature flags reviewed.

## Security

- Admin accounts created and reviewed.
- RBAC and permissions checked.
- JWT/cookie settings production-safe.
- Dependency audit reviewed.
- Privacy, terms, error pages, noindex private pages, and support contacts verified.

## Validation

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`
- `pnpm prisma:validate`
- Docker image build
- Docker Compose startup where Docker is available
- Security/dependency audit
- k6 staging smoke load test

## Launch

- Backup verified.
- Rollback image tags recorded.
- Monitoring dashboards and alerts active.
- Test booking completed in staging.
- Support team briefed.
