# Backup

## PostgreSQL

- Enable daily automated backups.
- Enable point-in-time recovery where the managed provider supports it.
- Retain daily backups for at least 30 days and monthly archives for compliance-defined periods.
- Encrypt backups at rest and in transit.
- Test restores monthly into an isolated staging database.

## Redis

Redis is used for cache, BullMQ, locks, rate limits, and idempotency support. Enable persistence where appropriate, but treat PostgreSQL as the source of truth for durable booking, payment, ticket, audit, and supplier records.

## S3-Ready Storage

When S3 is enabled:

- Enable bucket versioning for ticket/report objects.
- Enable server-side encryption.
- Block public access.
- Retain object access logs if compliance requires them.

## Restore Test

1. Provision an empty staging database.
2. Restore the selected backup.
3. Run Prisma validation.
4. Start API against the restored database.
5. Run health, search, booking history, ticket, admin, and audit smoke checks.
6. Record restore time and issues.
