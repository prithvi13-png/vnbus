# Operations

## Daily Checks

- Verify `/api/v1/health/ready` is not `DOWN`.
- Review API error rate, latency, queue backlog, failed jobs, supplier health, payment health, and email failures.
- Confirm PostgreSQL automated backups completed and a recent backup is restorable.
- Confirm Redis memory and eviction metrics are within limits.

## Maintenance Mode

API:

```http
GET /api/v1/maintenance
PATCH /api/v1/maintenance
```

The `PATCH` route requires `ADMIN`. When enabled, the global guard blocks customer-facing API routes and leaves health, maintenance, auth, docs, and admin routes reachable.

Frontend:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

When enabled, customer pages redirect to `/maintenance`; `/admin` and `/login` remain accessible.

## Queue Operations

BullMQ queue names:

- `EMAIL_QUEUE`
- `NOTIFICATION_QUEUE`
- `PDF_QUEUE`
- `ANALYTICS_QUEUE`
- `AI_QUEUE`
- `RESERVATION_CLEANUP_QUEUE`
- `SUPPLIER_REQUEST_QUEUE`
- `PAYMENT_EVENT_QUEUE`
- `SCHEDULER_QUEUE`
- `DEAD_LETTER_QUEUE`

Default production behavior uses 5 attempts, exponential backoff, bounded completed-job retention, and longer failed-job retention.

## Feature Flags

Verify these flags before launch:

- AI recommendations
- Live tracking
- Coupons
- Offers
- Email
- Agent portal
- Supplier integrations
- Payments
- Maintenance mode

## Data Retention

- Bookings: retain according to finance, tax, and customer-support requirements.
- Tickets: retain while bookings are legally supportable; archive PDFs in S3 with lifecycle policies after the active support window.
- Audit logs: retain for the compliance-defined period; do not auto-delete without policy approval.
- Activity logs: retain long enough for incident and fraud investigation.
- Email logs: retain delivery metadata; avoid retaining full rendered bodies when a live provider is integrated.
- Supplier logs: retain request metadata and redacted payload summaries for reconciliation and dispute handling.
- Payment transactions: retain according to finance and gateway reconciliation requirements.
- Notifications: expire or archive low-risk user notifications after the configured product-support window.

## Release Order

1. Freeze risky configuration changes.
2. Confirm backup and rollback plan.
3. Run migrations.
4. Deploy API.
5. Deploy worker and scheduler.
6. Deploy frontend.
7. Run smoke, E2E, and health checks.
8. Watch dashboards and alerts for at least one booking cycle.
