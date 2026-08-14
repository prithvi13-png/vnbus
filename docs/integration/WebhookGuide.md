# Webhook Guide

Endpoint:

```http
POST /api/v1/payments/webhooks/:provider
```

Webhook processing stages:

1. Resolve provider adapter.
2. Verify signature through the provider interface.
3. Parse provider payload into a normalized event.
4. Check duplicate event ID.
5. Record event status.
6. Apply transaction update.
7. Return a normalized webhook result.

Milestone 10 includes mock signature verification. Real provider signatures stay deferred until gateway credentials are added.
