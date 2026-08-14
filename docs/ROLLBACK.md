# Rollback

## Application Rollback

1. Identify the last known-good image tags for API, worker, scheduler, and web.
2. Enable maintenance mode if customer booking integrity is at risk.
3. Roll back worker and scheduler first when background processing caused the incident.
4. Roll back API before web when API contract or booking flow is impacted.
5. Roll back web first when the issue is isolated to frontend rendering or routing.
6. Verify `/api/v1/health/ready`, frontend smoke checks, and one mock booking flow.

## Database Rollback

Prefer forward fixes for migrations. Use destructive rollback only when approved and after a fresh backup.

Procedure:

1. Stop writes or enable maintenance mode.
2. Capture a backup of the current failed state.
3. Restore the previous backup to a replacement database when data loss is acceptable under the defined RPO.
4. Repoint services through secret/config change.
5. Run consistency checks for bookings, tickets, payments, audit logs, and reservations.

## Configuration Rollback

- Revert environment variables to the last known-good secret version.
- Keep supplier and payment live modes disabled unless the incident is unrelated and validated.
- Record the exact variable diff in the incident log.

## Frontend Rollback

- Use Vercel's previous production deployment or redeploy the last known-good commit.
- Confirm canonical URLs, robots, and maintenance routing after rollback.

## Worker Rollback

- Drain or pause queues if a processor is producing bad state.
- Redeploy the previous worker image.
- Requeue only idempotent failed jobs.
