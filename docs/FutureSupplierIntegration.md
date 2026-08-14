# Future Supplier Integration Plan

Milestone 8 keeps all supplier APIs out of scope. The platform continues to use `MockSupplierAdapter` and supplier configuration placeholders only.

## Current Boundary

- Search, seat layout, seat hold, release, and mock confirmation use `MockSupplierAdapter`.
- Admin supplier configuration stores enablement, priority, environment, health status, and secret-reference metadata.
- `BCIAdapter`, `RedBusAdapter`, `AbhiBusAdapter`, `TBOAdapter`, and `CustomAdapter` remain intentionally unimplemented.
- Admin UI and API contracts use internal platform models, not supplier response shapes.

## Future Steps

1. Add supplier credential storage through secret references only.
2. Implement one supplier adapter behind the existing `SupplierAdapter` contract.
3. Add contract tests for search, seat layout, hold, release, confirm, cancel, reschedule, tracking, and ticket download.
4. Add supplier health checks that update `supplier_configurations` and `monitoring_snapshots`.
5. Add reconciliation tables for supplier booking reference, supplier PNR, supplier cancellation status, and supplier ticket payloads.
6. Add per-supplier retry, timeout, circuit breaker, and rate-limit policies.
7. Expose normalized internal records to customer, agent, and admin portals.
8. Invalidate Redis search, operator, bus-type, analytics, and dashboard caches on supplier catalog changes.
9. Route supplier polling, ticket download, cancellation, reschedule, and reconciliation work through BullMQ queues.
10. Emit health, metrics, structured logs, correlation IDs, and dead-letter events for every supplier adapter.
11. Keep AI recommendations supplier-neutral by ranking internal route/trip models, not raw supplier payloads.

Supplier integrations should map into internal search, seat, booking, ticket, timeline, notification, and report models before reaching frontend code.
