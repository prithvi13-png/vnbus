# Supplier Integration

Milestone 11 keeps real suppliers disabled. BCI, RedBus, AbhiBus, TBO, and custom adapters remain stubs behind the shared supplier contract.

## Before Enabling Live Suppliers

1. Complete commercial onboarding and sandbox access.
2. Store credentials in a secret manager.
3. Add provider-specific API URL, auth, timeout, retry, and rate-limit settings.
4. Implement the adapter methods without changing frontend contracts.
5. Add contract tests for search, seat layout, hold, release, confirm, cancel, reschedule, ticket, tracking, and health.
6. Test duplicate trip detection and fare normalization.
7. Verify supplier request logs redact sensitive payloads.
8. Enable one supplier in staging with low traffic.
9. Monitor p95 latency, error rate, circuit breaker opens, and booking failure rate.
10. Prepare supplier-specific rollback: disable the supplier and route to mock/other adapters.

## Production Safeguards

- Keep `SUPPLIER_MODE=mock` until staging sign-off.
- Use circuit breakers and timeouts.
- Treat supplier booking IDs as external references, not internal truth.
- Never scrape supplier websites.
