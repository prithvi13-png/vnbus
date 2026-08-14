# Idempotency Guide

Critical operations use idempotency architecture:

- Seat hold
- Booking confirmation
- Payment intent
- Payment capture
- Cancellation
- Refund
- Reschedule

The runtime service stores an operation scope, idempotency key, request fingerprint, status, response, and expiry. Reusing a key with the same payload returns the same response. Reusing a key with a different payload raises a conflict.

Prisma includes an `idempotency_keys` table for production persistence.
