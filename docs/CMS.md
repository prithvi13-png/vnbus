# CMS Architecture

Milestone 8 introduces admin CMS page management for static platform content such as banners, policies, FAQs, SEO pages, announcements, and help content.

## API

```text
GET  /api/v1/cms/pages
POST /api/v1/cms/pages
PATCH /api/v1/cms/pages/:pageId
POST /api/v1/cms/pages/:pageId/publish
```

## Data Model

`cms_pages` stores:

- `key`
- `title`
- `section`
- `status`
- `content`
- `seo_title`
- `seo_description`
- `updated_by_id`
- `published_at`

The repository is in-memory for Milestone 8, while Prisma and the migration define the persistence target. Publishing is modeled as a state transition from draft/review state to published state.

## Future Work

Future CMS work should add revision history, preview URLs, asset management, approval workflow, scheduled publishing, and audit-log enforcement without coupling CMS content to supplier adapters.
