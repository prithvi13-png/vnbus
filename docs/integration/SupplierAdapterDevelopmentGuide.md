# Supplier Adapter Development Guide

To add a supplier:

1. Implement `SupplierAdapter` from `@vnbus/supplier-sdk`.
2. Keep raw supplier payloads inside the adapter.
3. Return only normalized models.
4. Never expose credentials or internal secrets to the frontend.
5. Implement `healthCheck` without faking success.
6. Add contract tests for every method.
7. Add timeout, retry, failover, and circuit breaker tests.
8. Register the adapter with `SupplierManagerService`.
9. Add configuration and admin metadata.
10. Keep mock mode working.

Adapters should preserve supplier-specific IDs internally:

- `supplierCode`
- `supplierTripId`
- `supplierOperatorId`
- `supplierBookingId`
- `supplierSeatId`

Frontend-safe identifiers must be opaque and must not include credentials.
