# Supplier Integration Guide

The supplier framework lives in `packages/supplier-sdk` and `apps/api/src/modules/integration`.

Supplier contract:

- `searchTrips`
- `getTripDetails`
- `getSeatLayout`
- `holdSeats`
- `releaseSeats`
- `confirmBooking`
- `getBookingStatus`
- `cancelBooking`
- `rescheduleBooking`
- `getTicket`
- `trackBus`
- `getCancellationPolicy`
- `getBoardingPoints`
- `getDroppingPoints`
- `healthCheck`

Built-in adapters:

- `MockSupplierAdapter`
- `BCIAdapter`
- `RedBusAdapter`
- `AbhiBusAdapter`
- `TBOAdapter`
- `CustomApiAdapter`

Milestone 10 behavior:

- Mock supplier is active.
- Real supplier adapters compile and return not-configured responses.
- No live HTTP request is made.
- Supplier priority is configuration-driven through `SUPPLIER_PRIORITY`.
- Search fan-out uses safe settled concurrency.
- Duplicate trip detection flags possible duplicate inventory but does not merge it.

Steps to connect a real supplier later:

1. Store the supplier API key and secret in a secret manager.
2. Set the supplier API URL and secret reference in environment/configuration.
3. Implement HTTP client mapping inside the supplier adapter.
4. Map raw supplier payloads into normalized models only.
5. Add contract fixtures for search, seats, hold, booking, cancel, reschedule, ticket, tracking, and health.
6. Enable the supplier in admin configuration.
7. Place it in `SUPPLIER_PRIORITY`.
8. Run contract, failover, timeout, circuit breaker, booking, and E2E tests.
