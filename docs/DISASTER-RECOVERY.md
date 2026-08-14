# Disaster Recovery

## Objectives

- Define RPO/RTO with the business before launch.
- Recommended initial target: RPO <= 15 minutes with PITR, RTO <= 2 hours for application recovery.

## Failure Procedures

- Database failure: switch to managed failover or restore latest verified backup to a replacement instance.
- Redis failure: restart/replace Redis, accept cache loss, replay durable jobs from PostgreSQL-backed records where available.
- Queue failure: pause public booking operations if seat holds or payment events cannot be processed reliably.
- API failure: roll back to previous Docker image and verify `/api/v1/health/ready`.
- Worker failure: scale workers to zero, deploy previous worker image, monitor failed and delayed queues.
- Scheduler failure: deploy previous scheduler image and manually run missed cleanup jobs after validation.
- Storage failure: pause ticket/report downloads, keep booking flow available if PDF generation is not required for confirmation.
- Email failure: continue booking, queue retry, and alert support.
- Supplier failure: keep mock or failover adapters isolated; do not enable live supplier mode until tested.
- Payment failure: do not capture live payments; keep mock provider until gateway validation is complete.

## DR Drill

Run a quarterly drill covering backup restore, API rollback, worker rollback, Redis rebuild, maintenance mode, and customer/support communication.
