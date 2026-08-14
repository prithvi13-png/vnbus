# Payment Integration

Milestone 11 keeps `PAYMENT_PROVIDER=MOCK`. Razorpay, Cashfree, PhonePe, Stripe, and custom provider adapters remain placeholders until gateway onboarding is complete.

## Before Enabling A Live Gateway

1. Complete gateway onboarding and sandbox setup.
2. Store API keys and webhook secrets in a secret manager.
3. Implement provider adapter create, capture, refund, status, and webhook parsing.
4. Add signature verification tests with official sandbox examples.
5. Add idempotency tests for create intent, capture, refund, and webhook replay.
6. Map gateway statuses to internal payment and booking states.
7. Test refund and failed-payment recovery.
8. Run staging E2E for booking, capture, confirmation, ticket, email, cancellation, and refund.
9. Reconcile transactions against gateway dashboard exports.
10. Enable production with a small monitored release window.

## Production Safeguards

- Do not log card, UPI, token, webhook secret, or API key values.
- Keep payment state changes transactional.
- Use duplicate webhook protection.
- Keep rollback able to switch back to `PAYMENT_PROVIDER=MOCK` for non-production and disable live capture in production emergencies.
