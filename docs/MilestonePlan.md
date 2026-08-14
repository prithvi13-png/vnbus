# Next Milestone Plan

## Milestone 2

Completed scope: authentication and user management only.

1. Added Customer, Travel Agent, and Admin roles with DB-backed permissions.
2. Added Argon2 password hashing, access JWTs, secure refresh cookies, refresh rotation, and token reuse revocation.
3. Added register, login, logout, refresh, forgot password, reset password, verify email, change password, users, roles, permissions, profile, and activity endpoints.
4. Added provider-free email template preparation for welcome, verify email, forgot password, and password changed messages.
5. Seeded the default admin account `admin@vriddhinexus.com` with password `ChangeMe@123` and forced password change.
6. Added frontend auth pages, profile editing, change password, 403, and session expired pages.
7. Added backend service tests and frontend route smoke coverage for auth screens.

## Milestone 3

Completed scope: UI design system and application layout only.

1. Added a shared shadcn-style `@vnbus/ui` component library with form controls, feedback, overlays, navigation, tables, charts, uploads, date/time controls, state blocks, and layout primitives.
2. Added Storybook configuration and grouped stories for primitives, overlays/navigation, and data/visual components.
3. Added theme provider, toast provider, dark-mode styling, design tokens, typography helpers, and Framer Motion helpers.
4. Rebuilt the public landing page with hero, search banner, features, why choose us, how it works, popular routes, testimonials, FAQ, app-coming-soon, and footer sections.
5. Added sticky public header behavior with navigation, login, register, theme toggle, mobile drawer, and authenticated profile dropdown.
6. Added dashboard shell with sidebar, top navigation, notifications, profile dropdown, command palette, search trigger, and mobile drawer.
7. Added UI-only customer, travel agent, admin, and general operations dashboards with dummy data, Recharts charts, DataTable records, timelines, tabs, badges, progress, and state blocks.
8. Added loading, error, unauthorized, session expired, and maintenance state layouts.
9. Added component, design, theme, and layout documentation.
10. Kept auth architecture and booking implementation unchanged.

Deferred by design:

1. Booking implementation and booking persistence.
2. Supplier booking, payment, ticket PDF, email provider, map provider, AI provider, and S3 integrations.
3. Backend changes for booking, seat block, passenger validation, confirmation, coupon CRUD, offer CRUD, CMS CRUD, and notification jobs.

## Milestone 4

Completed scope: mock-backed bus search experience only.

1. Added a production-feeling `/search` route with source/destination autocomplete, popular cities, popular routes, recent searches, favorite routes, route swap, journey-date validation, URL query-state persistence, sticky search header, loading skeletons, empty results, server error retry, filters, sorting, pagination, result cards, and bus details.
2. Added shared mock search data generation with at least 500 buses, 100 operators, 100 routes, 500 boarding points, 500 dropping points, seat layout previews, amenities, ratings, reviews, route duration, departure and arrival times, seat availability, fares, discounts, images, and operator logos.
3. Added shared search filtering and sorting logic for price, time windows, bus type, operator, amenities, AC, Non AC, sleeper, seater, seats, rating, live tracking, price order, departure, arrival, fastest, shortest duration, highest rated, and most popular.
4. Added public backend `POST /api/v1/search` and `GET /api/v1/search/mock-dataset` endpoints with DTO validation, service/repository separation, Swagger coverage, and tests.
5. Added `MockSupplierAdapter.searchTrips()` in `packages/supplier-sdk` so future supplier adapters can replace mock inventory without changing the web search contract.
6. Added dynamic metadata, canonical search URLs, OpenGraph metadata, Schema.org `SearchResultsPage` JSON-LD, and a static OpenStreetMap route preview.

Deferred by design:

1. BCI, RedBus, AbhiBus, TBO, and any other third-party supplier integrations.
2. Booking persistence, seat blocking, booking confirmation, payments, ticket PDF generation, email provider integration, and live tracking.
3. Supplier-specific frontend fields or supplier-specific API response leakage.

## Milestone 5

Completed scope: mock-backed seat selection and booking flow only.

1. Added the complete customer journey from search result View Seats through seat layout, seat selection, boarding point, dropping point, passenger details, booking review, booking confirmation, ticket view, and PDF download.
2. Added deterministic mock seat layouts for 2+2 seater, 2+1 sleeper, semi sleeper, Volvo, Mercedes, single axle, double axle, lower deck, and upper deck variants.
3. Added seat statuses and interaction states for available, booked, ladies, reserved, blocked, selected, window seat, emergency exit, extra legroom, and gender restriction.
4. Added a ten-minute persisted seat hold timer with release and expiry handling that redirects back to seat selection.
5. Added boarding and dropping point selection with realistic location, address, time, landmark, and static OpenStreetMap preview.
6. Added passenger validation per selected seat for first name, last name, age, gender, phone, email, and optional emergency contact.
7. Added backend seat, booking, passenger, reservation, and ticket module structure with controllers, services, repositories, DTOs, validators, and unit tests.
8. Added mock workflow endpoints for seat layout, seat hold, release, booking creation, booking confirmation, booking detail, ticket view, and base64 mock PDF ticket download.
9. Extended `MockSupplierAdapter` with seat layout, hold, release, legacy block, and mock confirmation behavior while keeping real BCI, RedBus, AbhiBus, and TBO adapters unimplemented.
10. Added Prisma schema and migration updates for seat layouts, seats, reservations, reservation logs, booking point fields, expanded booking statuses, and passenger contact fields.

Deferred by design:

1. BCI, RedBus, AbhiBus, TBO, and any other third-party supplier API integration.
2. Real payment provider integration, payment webhooks, settlement, refunds, and reconciliation.
3. External email delivery, S3 ticket storage, real QR rendering in PDFs, and live tracking provider integration.

## Milestone 6

Completed scope: ticket management, booking history, notification center, cancellation, and reschedule architecture only.

1. Added supplier-independent ticket records with ticket ID, booking ID, mock PNR, journey date, operator, bus type, mock bus number, route, timings, duration, passengers, seats, boarding/dropping points, fare, booking date/status, QR payload, terms, emergency contact, and support contact.
2. Added generated QR SVG/data payload with booking ID, PNR, journey date, passenger count, and mock verification URL.
3. Upgraded the Ticket module with repository-backed generation, mapper, DTO, validation, PDF download tracking, email-ticket action, and unit tests.
4. Added professional mock PDF sections for header, passenger information, journey information, bus information, fare breakdown, QR payload, terms, support, and footer.
5. Expanded provider-free email architecture with queue service, logger, retry strategy, and templates for booking confirmation, cancellation, reschedule, password reset, welcome, and verification.
6. Added Timeline and Booking History modules with lifecycle events and public history/upcoming/past/cancelled APIs.
7. Added Notification Center APIs and frontend state for unread/read booking, cancellation, reschedule, and email history notifications.
8. Added frontend pages for booking history, booking details, upcoming trips, past trips, cancelled trips, ticket viewer, download ticket, and notifications.
9. Added mock cancellation flow with cancellation requested, cancelled, and refund pending timeline state.
10. Added mock reschedule architecture flow with new-date selection, search reuse, bus selection, review, and confirm.
11. Added Prisma schema and migration updates for ticket downloads, booking timeline, email logs, notification type, and new booking/ticket lifecycle states.

Deferred by design:

1. BCI, RedBus, AbhiBus, TBO, and any other third-party supplier API integration.
2. SMTP/email provider integration, object storage, real payment/refund settlement, and live tracking provider integration.
3. Full fare-difference payment capture for reschedules.

## Milestone 7

Completed scope: B2B travel-agent portal only.

1. Added agent dashboard metrics for today's bookings, upcoming journeys, mock revenue, recent customers, recent activity, quick booking routes, popular routes, status summary, cancelled bookings, and notifications.
2. Added agent navigation for Dashboard, Quick Booking, Bookings, Customers, Reports, Notifications, Profile, Settings, and Help.
3. Added Quick Booking workflow that reuses mock search, seat layout, seat hold, booking creation, confirmation, ticket generation, and ticket email services.
4. Expanded Customer module with agent customer list, create, update, delete, search, tags, notes, details, booking history, upcoming trips, duplicate-customer validation, and tests.
5. Added Agent Booking module with list filters, sorting, pagination, create booking, email ticket, ownership metadata, customer metric updates, activity logging, and tests.
6. Added Agent Report module with daily, weekly, monthly, top route, top customer, booking trend, revenue trend, cancellation trend, journey distribution, and export metadata.
7. Added Agent Notification module with booking, cancellation, journey reminder, and system notification center feed.
8. Enhanced reusable `DataTable` with filter slot, CSV export, and print/PDF export while preserving search, sort, pagination, column visibility, and responsive behavior.
9. Added Recharts-based dashboard and report charts for booking trend, revenue trend, booking status, and cancellation trend.
10. Added Prisma schema and migration updates for expanded agents/customers, customer notes, customer tags, agent reports, and agent activity logs.

Deferred by design:

1. Third-party supplier API integrations.
2. Real payment/refund settlement, SMTP provider, object storage, and live tracking.
3. Agency commission settlement, GST invoicing, branch hierarchy, and real KYC workflows.

## Milestone 8

Completed scope: enterprise admin portal only.

1. Added an enterprise admin dashboard with booking, revenue, user, travel-agent, customer, journey, cancellation, route, operator, activity, queue, and mock system-health widgets.
2. Added admin navigation for Dashboard, Bookings, Users, Travel Agents, Customers, Roles, Coupons, Offers, CMS, Notifications, Email Templates, Reports, Analytics, Audit Logs, Activity Logs, Platform Settings, Feature Flags, System Monitoring, Supplier Configuration, and Profile.
3. Added booking management views with search, filters, sorting, pagination, details, ticket/download links, resend email action, cancel/reschedule placeholders, timeline context, bulk actions, CSV export, and print/PDF export.
4. Added user-management surfaces for customers, travel agents, admins, and role assignments, including activation, deactivation, password reset, force logout, booking history, and activity-log workflows.
5. Expanded dynamic RBAC with create role, edit role, replace permissions, assign permissions, and remove permissions APIs.
6. Added CMS page management, coupon management, offer management, notification center, and email template management APIs with DTO validation, repositories, services, controllers, entities, validators, and tests.
7. Added admin reports and analytics datasets with mock CSV/PDF export metadata and Recharts-ready trend, revenue, route, operator, customer, retention, and queue series.
8. Added audit-log filtering and richer activity-log device/browser metadata for admin investigation workflows.
9. Added feature flag, platform settings, supplier configuration placeholder, and monitoring modules with protected admin APIs and service tests.
10. Added Prisma schema and migration updates for CMS pages, analytics snapshots, feature flags, platform settings, supplier configurations, monitoring snapshots, and expanded notification types.
11. Enhanced the reusable `DataTable` with bulk action rendering while preserving global search, sorting, filtering slots, pagination, column visibility, responsive layout, CSV export, and print/PDF export.
12. Added documentation for admin architecture, RBAC, CMS, analytics, feature flags, API updates, database updates, and future supplier integration planning.

Deferred by design:

1. Third-party supplier API integrations.
2. Real payment/refund settlement, SMTP provider, object storage, live tracking, real monitoring vendor integration, and external analytics warehouses.
3. Production approval workflows for RBAC, feature flags, CMS publication, coupon rollout, offer rollout, and supplier configuration changes.

## Milestone 9

Completed scope: enterprise performance, caching, notifications, AI recommendations, queues, jobs, SEO, monitoring, and observability only.

1. Added mock-rule AI trip recommendations for cheapest route, fastest route, popular route, best-rated operator, weekend suggestions, nearby destinations, frequently booked routes, recently viewed routes, trending routes, and repeat-booking suggestions.
2. Added notification engine upgrades for in-app, email, SMS placeholder, WhatsApp placeholder, push placeholder, unread/read/archive/delete/history, and mark-all-read workflows.
3. Added Redis cache strategy module for popular routes, search results, autocomplete, popular searches, recent searches, operators, bus types, settings, feature flags, analytics, and dashboard widgets.
4. Added BullMQ queue-system module for email, notification, PDF, analytics, AI, scheduler, retry strategy, and dead-letter queue status.
5. Added scheduler/background job module for expired seat cleanup, reservation cleanup, email retry, notification retry, analytics snapshots, daily reports, weekly reports, and monthly reports.
6. Added public `/api/health`, `/api/ready`, and `/api/live` health checks for API, database, Redis, queue, and storage readiness.
7. Added metrics and observability with request count, API response time, error rate, queue status, cache status, memory usage, CPU mock, storage mock, structured logs, request IDs, correlation IDs, trace IDs, and centralized error codes.
8. Added search optimization APIs for cached suggestions, recent searches, search insights, popular routes/cities, no-result searches, average booking time, and abandoned bookings.
9. Added SEO engine APIs plus Next.js robots, sitemap, metadata base, OpenGraph, Twitter cards, canonical URLs, JSON-LD, and breadcrumb-ready metadata records.
10. Added frontend notification drawer, recommendation cards, recently viewed routes, recommended routes, trending/search suggestions, persisted M9 state, and admin health dashboard.
11. Added Prisma schema and migration targets for cache entries, queue jobs, background jobs, search insights, recommendation events, metric snapshots, SEO routes, and expanded notification types.
12. Added M9 guides for monitoring, caching, queues, SEO, and AI recommendations.

Deferred by design:

1. Third-party supplier API integrations.
2. OpenAI or any LLM provider integration.
3. Real SMS, WhatsApp, push, SMTP, payment, object storage, live tracking, monitoring vendor, tracing backend, analytics warehouse, and production worker deployment.
