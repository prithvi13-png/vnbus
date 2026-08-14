# Payment Integration Guide

Payment architecture lives in `apps/api/src/modules/payment`.

Provider contract:

- `createIntent`
- `capturePayment`
- `refund`
- `getStatus`
- `verifyWebhookSignature`
- `parseWebhook`

Adapters:

- `MockPaymentAdapter`
- `RazorpayAdapter`
- `CashfreeAdapter`
- `PhonePeAdapter`
- `StripeAdapter`
- `CustomPaymentAdapter`

Milestone 10 behavior:

- `PAYMENT_PROVIDER=MOCK` is active.
- Live gateway adapters compile but throw provider-unavailable errors.
- No gateway SDK, API key, or live endpoint is used.
- `POST /payments/webhooks/:provider` supports signature verification and duplicate event protection.

Steps to connect a real payment gateway later:

1. Store API keys and webhook secrets in a secret manager.
2. Add only secret references to platform configuration.
3. Install the provider SDK only if direct HTTP is not preferred.
4. Implement provider adapter methods.
5. Verify webhook signatures with provider documentation.
6. Store transaction and webhook events.
7. Add idempotency keys to payment intent, capture, refund, and webhook processing.
8. Enable the provider through configuration and run payment contract tests.
