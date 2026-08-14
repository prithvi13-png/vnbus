# Feature Flag Architecture

Milestone 8 adds admin-managed feature flag records for rollout planning and platform control. It does not add a runtime feature flag SDK or external feature flag provider.

## API

```text
GET   /api/v1/feature-flags
PATCH /api/v1/feature-flags/:flagId
```

## Data Model

`feature_flags` stores:

- `key`
- `name`
- `description`
- `enabled`
- `audience`
- `rollout_percentage`
- `owner`

## Intended Use

Flags model platform controls such as coupons, offers, agent portal, email queue, tracking placeholder, AI placeholder, and maintenance mode. In Milestone 8 they are admin configuration records only.

## Future Work

Future flag evaluation should add environment scoping, percentage bucketing, user targeting, approval workflow, audit logging, cache invalidation, and server/client SDK helpers.
