# Troubleshooting

## API Readiness Is Down

1. Check `/api/v1/health/ready`.
2. Verify `DATABASE_URL` and `REDIS_URL` are not placeholders.
3. Confirm PostgreSQL and Redis network access from the API service.
4. Confirm migrations have been applied.

## High Booking Failures

1. Enable maintenance mode if customers are at risk.
2. Check seat hold, booking, payment, supplier, and queue logs by correlation ID.
3. Inspect `DEAD_LETTER_QUEUE`.
4. Roll back the API or worker image if the issue began after deploy.

## Queue Backlog

1. Scale worker replicas.
2. Check Redis health and memory.
3. Inspect failed jobs and retry reasons.
4. Pause non-critical queues such as analytics before booking-critical queues.

## Email Not Sending

1. Verify feature flag and `EMAIL_PROVIDER`.
2. Confirm SMTP/provider secrets are present only in the secret manager.
3. Inspect email logs; addresses should be masked in structured logs.

## Supplier Or Payment Issues

Live suppliers and live gateways are intentionally disabled in Milestone 11. If a live provider is accidentally selected without credentials, readiness should show degraded/down provider state and the adapter should not make a real request.
