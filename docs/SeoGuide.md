# SEO Guide

Milestone 9 adds an SEO engine and Next.js SEO route handlers.

## Coverage

- Dynamic metadata records.
- OpenGraph.
- Twitter cards.
- JSON-LD.
- Schema.org `WebPage` and search page schema.
- Canonical URLs.
- Robots.
- Sitemap.
- Breadcrumb schema records.

## API And Routes

```text
GET /api/v1/seo/metadata
GET /api/v1/seo/sitemap
GET /robots.txt
GET /sitemap.xml
```

Search pages continue to generate route-aware metadata and `SearchResultsPage` JSON-LD from search params.

## Future Work

Future SEO work should connect CMS pages to SEO routes, add route-specific images, publish localized city-pair pages, generate operator pages, and add stale-route invalidation when CMS content changes.
