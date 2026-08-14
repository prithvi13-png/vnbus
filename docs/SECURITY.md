# Security

## Implemented Controls

- Helmet security headers on the API.
- Next.js security headers for frame, content type, referrer, and browser permissions policy.
- CORS origin allowlist from `CORS_ORIGIN`.
- Global `/api/v1` prefix.
- Request body size limits via `REQUEST_BODY_LIMIT`.
- DTO validation with whitelist and `forbidNonWhitelisted`.
- JWT access tokens and refresh-token rotation.
- Secure/httpOnly refresh cookies with configurable secure and domain settings.
- Argon2 password hashing.
- RBAC and permission guards.
- Login and password-reset throttling.
- Standardized error envelopes with stack traces removed from production responses.
- Correlation/request/trace IDs on every request.
- Email addresses masked in structured email logs.
- Supplier and payment credentials remain behind environment variables and secret references.

## PII Policy

PII includes names, phone numbers, emails, passenger details, emergency contacts, booking references, PNR, and payment references. Production logs must not include passwords, tokens, API keys, supplier credentials, payment secrets, or full email addresses.

## Secret Management

- Do not commit `.env` files with real values.
- Use AWS Secrets Manager, Parameter Store, Doppler, 1Password Secrets Automation, or the hosting provider's encrypted secret store.
- Store only secret references in database configuration rows when a provider credential is needed.
- Never expose backend secrets through `NEXT_PUBLIC_*` variables.

## Pre-Launch Audit Items

- Confirm all production JWT secrets are unique and generated with high entropy.
- Confirm `COOKIE_SECURE=true` and the correct `COOKIE_DOMAIN`.
- Confirm Cloudflare WAF/rate-limit rules are active.
- Confirm admin accounts use strong credentials and forced password changes.
- Confirm dependency audit has no critical/high unresolved vulnerabilities.
- Confirm supplier/payment live modes remain disabled until onboarding checklists are complete.
