# Caching Guide

Milestone 9 defines a Redis cache strategy while keeping cache values mock-backed.

## Cached Namespaces

- Popular routes.
- Search results.
- Autocomplete.
- Popular searches.
- Recent searches.
- Operators.
- Bus types.
- Settings.
- Feature flags.
- Analytics.
- Dashboard widgets.

## API

```text
GET  /api/v1/cache
POST /api/v1/cache/warm
```

## Strategy

Search results use short route/date/filter TTLs. Autocomplete, operators, and bus types are warmed for longer windows. Settings and feature flags have short invalidation windows because admin changes should reflect quickly. Analytics and dashboard widgets are refreshed after snapshot jobs.

## Future Work

Future production work should add Redis client abstraction, cache stampede protection, distributed locks, cache tags, invalidation events, and hit/miss metrics sourced from real Redis operations.
