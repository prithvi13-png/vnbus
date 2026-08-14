# Vriddhi Nexus Bus Booking Platform

Milestone 11 foundation for the Vriddhi Nexus Pvt Ltd enterprise bus booking platform. This repository is a Turborepo monorepo with a Next.js web app, NestJS API, Prisma/PostgreSQL data model, Redis/BullMQ readiness, shared packages, supplier adapter contracts, payment provider contracts, Docker, CI, authentication, user management, a reusable UI design system, role dashboards, mock-backed bus search, complete mock seat selection and booking flow, ticket management, booking history, notifications, B2B travel-agent portal, enterprise admin portal, performance architecture, caching, queues, jobs, AI recommendations, SEO, monitoring, observability, and production hardening documentation.

Milestone 11 intentionally prepares the system for deployment and launch readiness while keeping realistic local mock data, adapter boundaries, request logging, failover, circuit breaker, timeout, idempotency, lock, webhook, payment-provider, and supplier-manager architecture. It does not integrate BCI, RedBus, AbhiBus, TBO, payment gateways, external email providers, S3, OpenAI/LLM providers, monitoring vendors, live tracking providers, or supplier APIs. Those systems remain isolated behind ports, adapter boundaries, queue boundaries, cache boundaries, and secret-reference placeholders for later milestones.

## Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn-style UI primitives, Radix UI, Recharts, Framer Motion, TanStack Query, Zustand, React Hook Form, Zod
- Backend: NestJS, Prisma ORM, PostgreSQL, Redis, BullMQ, JWT, Argon2, RBAC, Swagger
- Infrastructure: Docker, Docker Compose, GitHub Actions, S3-ready configuration, Cloudflare-compatible web runtime
- Package manager: pnpm

## Commands

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres redis
pnpm db:generate
pnpm --filter @vnbus/api prisma:migrate
pnpm dev
```

Validation:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm prisma:validate
pnpm security:audit
```

Storybook:

```bash
pnpm --filter @vnbus/ui storybook
pnpm --filter @vnbus/ui storybook:build
```

## Workspaces

- `apps/web`: customer, agent, and admin web surfaces
- `apps/api`: NestJS API with modular bounded contexts
- `packages/ui`: reusable shadcn-style UI components
- `packages/shared`: shared constants and primitives
- `packages/types`: cross-app domain contracts
- `packages/config`: typed environment parsing
- `packages/supplier-sdk`: supplier adapter contract, mock search/seat/hold adapter, and empty real supplier adapters
- `docs`: architecture, API, folder, database, and standards documents

## Milestone 11 Boundary

Completed:

- Versioned production health endpoints at `GET /api/v1/health`, `GET /api/v1/health/live`, and `GET /api/v1/health/ready`.
- Production-safe readiness checks for database, Redis, queues, S3-ready storage, email, supplier, and payment dependencies.
- API hardening for Helmet, request body limits, CORS normalization, validation, safer error envelopes, production stack suppression, and PII-masked email logs.
- Admin-controlled maintenance mode through `GET/PATCH /api/v1/maintenance` plus frontend maintenance redirects.
- Prometheus-compatible metrics at `GET /api/v1/metrics/prometheus`.
- Separate API, worker, and scheduler runtime entrypoints and Dockerfiles with non-root runtime users.
- BullMQ production defaults for retries, exponential backoff, and bounded job retention.
- Additive production indexes and migration for booking, passenger, ticket, notification, email, supplier, payment, reservation, and search tables.
- Complete environment templates for development, test, staging, and production.
- Vercel, Docker, Docker Compose, CI/CD, k6 staging load-test, deployment, operations, security, backup, disaster recovery, monitoring, troubleshooting, supplier, payment, launch, and rollback documentation.

Deferred by design:

- Live supplier API calls, supplier website scraping, payment gateway capture, external SMTP, S3 object writes, production monitoring vendor setup, and real production secrets.

## Milestone 10 Boundary

Completed:

- Central Supplier Integration Framework: Search/seat APIs can route through `SupplierManagerService`, which owns supplier registration, enable/disable state, priority, failover, timeouts, retry-safe operations, request logging, health tracking, and circuit breaker state.
- Stable supplier contract in `@vnbus/supplier-sdk`: `searchTrips`, `getTripDetails`, `getSeatLayout`, `holdSeats`, `releaseSeats`, `confirmBooking`, `getBookingStatus`, `cancelBooking`, `rescheduleBooking`, `getTicket`, `trackBus`, `getCancellationPolicy`, `getBoardingPoints`, `getDroppingPoints`, and `healthCheck`.
- Normalized shared data models for supplier search, trips, bus/operator/seat/point/passenger/booking/ticket/tracking/fare/cancellation-policy, supplier errors, health, request logs, duplicate trip groups, payment intents, transactions, refunds, and webhooks.
- Stub adapters for BCI, RedBus, AbhiBus, TBO, and Custom Bus API that compile against the same contract and return not-configured health/errors without making live HTTP requests.
- MockSupplierAdapter remains active and implements the production supplier contract. Existing customer search, seat selection, booking, ticket, notification, and agent workflows continue to use mock mode.
- Parallel supplier search architecture using safe settled fan-out so one supplier failure does not fail all results.
- NormalizationService, duplicate-trip detection, FareService, SupplierHealthService, request logs, timeout policy, retry-safe execution, and circuit breaker state.
- Payment provider framework with MockPaymentAdapter plus Razorpay, Cashfree, PhonePe, Stripe, and CustomPaymentAdapter placeholders. No gateway dependency or API key is added.
- Payment intent, capture, transaction, refund, webhook signature verification interface, duplicate webhook protection, idempotency, and event logging architecture.
- Redis-ready distributed lock service for critical operations such as seat hold, booking confirmation, cancellation, payment confirmation, refund, and reschedule. Runtime implementation is in-memory until Redis wiring is enabled.
- Prisma schema and migration targets for supplier request logs, health snapshots, circuit states, payment provider configurations, payment transactions, payment webhook events, idempotency keys, and distributed locks.
- Admin Integration Configuration console covering supplier management, payment providers, supplier priority, supplier health, integration logs, circuit breakers, configuration, and feature toggles.
- Environment templates for `.env.example`, `.env.development`, `.env.test`, and `.env.production` with placeholder-only supplier/payment variables.

Deferred by design:

- Live supplier API calls, supplier website scraping, BCI/RedBus/AbhiBus/TBO credentials, payment gateway credentials, live webhook secrets, external payment SDKs, and production Redis lock persistence.
- Automatic merging of duplicate supplier inventory. Milestone 10 only flags potential duplicates and preserves supplier-specific booking metadata.

## Milestone 9 Boundary

Completed:

- AI trip recommendation engine using deterministic mock rules for cheapest route, fastest route, popular route, best-rated operator, weekend suggestions, nearby destinations, frequently booked routes, recently viewed routes, trending routes, and repeat-booking suggestions.
- Notification engine upgrades for in-app, email, SMS placeholder, WhatsApp placeholder, and push placeholder channels, with unread, read, archive, mark-all-read, delete, and history actions.
- BullMQ queue-system architecture for email, notification, PDF, analytics, AI, scheduler, retry strategy, and dead-letter queue state.
- Background job scheduler for expired seat cleanup, reservation cleanup, email retry, notification retry, analytics snapshots, and daily/weekly/monthly reports.
- Redis cache strategy for popular routes, search results, autocomplete, popular searches, recent searches, operators, bus types, settings, feature flags, analytics, and dashboard widgets.
- Search optimization APIs for suggestions, recent-search cache, popular-route cache, search insights, no-result searches, average booking time, and abandoned bookings.
- SEO engine with dynamic metadata records, OpenGraph, Twitter cards, JSON-LD, canonical URLs, robots, sitemap, and breadcrumb schema.
- Monitoring, public health checks, metrics, structured logging, correlation IDs, request IDs, trace IDs, centralized error codes, and enriched exception envelopes.
- Frontend notification drawer, recommendation cards, recently viewed routes, recommended/trending route suggestions, search suggestions, persisted M9 state, and admin health dashboard.
- Prisma schema and migration targets for cache entries, queue jobs, background jobs, search insights, recommendation events, metric snapshots, SEO routes, and expanded notification types.

Deferred by design:

- Third-party supplier API integrations.
- OpenAI/LLM providers, real SMS/WhatsApp/push providers, SMTP provider, payment provider, object storage, live tracking, monitoring vendors, and analytics warehouses.
- Production worker processes, distributed tracing backend, real Redis data hydration, real BullMQ processors, and external SEO publishing workflows.

## Milestone 8 Boundary

Completed:

- Enterprise admin dashboard with bookings, trend, mock revenue, users, travel agents, upcoming journeys, cancelled bookings, popular routes, top operators, active customers, recent activities, system health, email queue, and notification queue widgets.
- Admin navigation for Dashboard, Bookings, Users, Travel Agents, Customers, Roles, Coupons, Offers, CMS, Notifications, Email Templates, Reports, Analytics, Audit Logs, Activity Logs, Platform Settings, Feature Flags, System Monitoring, Supplier Configuration, and Profile.
- Booking management with search, status filtering, sorting, pagination, details, ticket links, email resend action, cancellation/reschedule placeholders, bulk actions, CSV export, and print/PDF export.
- User, customer, travel-agent, admin, role, and permission management surfaces with activation, deactivation, password reset, force logout, activity, booking, and dynamic RBAC workflows represented.
- CMS page management, coupon management, offer management, notification center, email template management, report generation metadata, analytics charts, audit logs, activity logs, platform settings, feature flags, monitoring snapshots, and supplier configuration placeholders.
- Backend modules and APIs for Admin, CMS, Coupons, Offers, Analytics, Reports, Audit, Activity metadata, Notification admin center, Feature Flags, Platform Settings, Supplier Configuration, Monitoring, and dynamic Role permission management.
- Prisma schema and migration updates for CMS pages, analytics snapshots, feature flags, platform settings, supplier configurations, monitoring snapshots, and expanded notification types.
- Reusable enterprise `DataTable` bulk actions in addition to search, sorting, filters, pagination, column visibility, CSV export, print/PDF export, and responsive behavior.
- Recharts-based reusable admin charts for booking trends, revenue trends, analytics, retention, operator performance, and system monitoring.
- Documentation for admin architecture, RBAC, CMS, analytics, feature flags, database updates, API updates, and future supplier integration planning.

Deferred by design:

- Third-party supplier API integrations.
- Real payment/refund/settlement, SMTP/email provider, object storage, real live tracking, and production PDF storage.
- Real monitoring backends, distributed audit pipelines, external analytics warehouses, and production feature-flag rollout service.

## Milestone 7 Boundary

Completed:

- B2B travel-agent dashboard with today's bookings, upcoming journeys, mock revenue, recent customers, recent activity, quick booking routes, popular routes, booking status summary, cancelled bookings, and notifications.
- Agent navigation for Dashboard, Quick Booking, Bookings, Customers, Reports, Notifications, Profile, Settings, and Help.
- Quick Booking workspace that reuses mock search, seat layout, seat hold, booking creation, ticket generation, and ticket email functions rather than duplicating business logic.
- Customer management module with list, search, add, update, delete, notes, tags, customer profile, booking history, upcoming trips, duplicate-customer validation, and tests.
- Agent booking module with search, sort, filters, pagination, ticket download links, cancel, reschedule, email ticket, duplicate booking entry point, and backend orchestration tests.
- Agent report module with mock daily, weekly, monthly, top routes, top customers, booking trends, revenue trends, cancellation trends, journey distribution, CSV export metadata, PDF export metadata, and Recharts frontend charts.
- Agent notification module with booking-created, booking-cancelled, journey-reminder, and system notification feed.
- Reusable enterprise `DataTable` enhancements for search, sorting, filtering slot, pagination, column visibility, responsive layout, CSV export, and print/PDF export.
- Persisted agent state for customer filters, booking filters, recent customers, and recent searches.
- Prisma schema and migration updates for expanded `agents`, expanded `customers`, `customer_notes`, `customer_tags`, `agent_reports`, and `agent_activity_logs`.
- Documentation for Agent Architecture, Customer Management, report strategy, API updates, database updates, and future integration strategy.

Deferred by design:

- Third-party supplier API integrations.
- Real payment/refund/settlement, SMTP/email provider, object storage, real live tracking, and production PDF storage.
- Agency commission settlement, GST invoicing, real customer KYC, and multi-agent branch hierarchy.

## Milestone 6 Boundary

Completed:

- Supplier-independent internal ticket model containing ticket ID, booking ID, mock PNR, journey date, operator, bus type, mock bus number, route, timings, duration, passengers, seats, boarding and dropping points, fare breakdown, booking date/status, QR payload, terms, emergency contact, and support contact.
- Deterministic QR payload and generated SVG/data URL containing booking ID, PNR, journey date, passenger count, and mock verification URL.
- Repository-backed Ticket module with service, repository, controller, DTO, mapper, validation, PDF download tracking, ticket email action, and tests.
- Professional mock PDF envelope with branded sections for header, passenger information, journey information, bus information, fare breakdown, QR payload, terms, support information, and footer.
- Email architecture with template rendering, queue service, email logs, retry strategy, and templates for booking confirmation, booking cancelled, booking rescheduled, password reset, welcome, and verification email. No SMTP integration is included.
- Booking lifecycle timeline for booking created, seat reserved, payment pending, payment confirmed, ticket generated, ticket downloaded, email sent, cancellation requested, cancelled, refund pending, reschedule requested, and rescheduled.
- Booking History module plus public APIs for history, upcoming trips, past trips, cancelled trips, cancellation, and mock reschedule.
- Notification Center for unread/read booking updates, cancellation updates, reschedule updates, and email history.
- Customer booking pages for Booking History, Booking Details, Upcoming Trips, Past Trips, Cancelled Trips, Ticket Viewer, Download Ticket, and Notification Center.
- Customer dashboard cards now reflect persisted booking, ticket, and notification state from the mock workflow.
- Prisma schema and migration updates for `tickets`, `ticket_downloads`, `booking_timeline`, `notifications`, `email_logs`, and new booking/ticket lifecycle statuses.
- Documentation for ticket architecture, notification architecture, booking history, API updates, database updates, email architecture, notification flow, and future supplier mapping.

Deferred by design:

- Third-party supplier API integrations.
- Real QR provider, payment capture/refund provider, external SMTP/email provider, S3/object storage, and live tracking implementation.
- Production cancellation refund settlement and full paid reschedule fare-difference capture.

## Milestone 5 Boundary

Completed:

- Complete booking journey: Search Results -> View Seats -> Seat Layout -> Select Seats -> Boarding Point -> Dropping Point -> Passenger Details -> Booking Review -> Booking Confirmation -> Ticket.
- Seat layouts for 2+2 seater, 2+1 sleeper, semi sleeper, Volvo, Mercedes, single/double axle, lower deck, and upper deck patterns using deterministic mock supplier data.
- Seat statuses and interactions for available, booked, ladies, reserved, blocked, selected, window, emergency exit, extra legroom, gender restriction, click-to-select, click-to-deselect, ARIA labels, tooltips, and configurable max seat selection.
- Ten-minute seat hold timer with persisted booking state, release behavior, expiry handling, and redirect back to seat selection.
- Boarding and dropping point selection with location, address, time, landmark, and static OpenStreetMap boarding preview.
- Passenger details form per selected seat with first name, last name, age, gender, phone, email, optional emergency contact, and validation.
- Booking review, fare summary, mock confirmation, booking success, booking failed, booking history details, ticket view, live tracking coming-soon placeholder, and downloadable mock PDF ticket.
- Backend seat, booking, passenger, reservation, and ticket module structure with controllers, services, repositories, DTOs, validation, and tests.
- Public mock workflow APIs: `GET /api/v1/seats/:tripId`, `POST /api/v1/seats/hold`, `POST /api/v1/seats/release`, `POST /api/v1/bookings/create`, `POST /api/v1/bookings/confirm`, `GET /api/v1/bookings/:id`, `GET /api/v1/tickets/:bookingId`, and `GET /api/v1/tickets/:bookingId/download`.
- Prisma schema and migration updates for seat layouts, seats, reservations, reservation logs, expanded booking status, passenger contact fields, booking points, and ticket-ready metadata.
- Full customer-facing `/search` flow with URL-persisted state, autocomplete, popular cities, popular routes, recent searches, favorite routes, swap, date validation, loading skeletons, empty state, retry state, sticky search header, sticky filters, sorting, pagination, result cards, bus details, and static OpenStreetMap route preview.
- Shared mock search dataset with at least 500 buses, 100 operators, 100 routes, 500 boarding points, 500 dropping points, generated seat-layout previews, amenities, ratings, reviews, durations, prices, discounts, bus images, and operator logos.
- Search filter and sorting engine covering price, departure, arrival, bus type, operator, amenities, AC, Non AC, sleeper, seater, available seats, rating, live tracking, price ascending/descending, departure, arrival, fastest, shortest duration, highest rated, and most popular.
- Public backend `POST /api/v1/search` returning `{ success, totalResults, buses, filters, pagination }`, plus `GET /api/v1/search/mock-dataset` for dataset inspection.
- `MockSupplierAdapter` implements the supplier `searchTrips()` contract so the frontend/backend can later swap to real supplier adapters without changing UI contracts.
- Dynamic search metadata, canonical URLs, OpenGraph metadata, and Schema.org `SearchResultsPage` JSON-LD.
- Milestone 2 authentication and user management foundation remains intact.
- Shared `@vnbus/ui` component library covering form controls, feedback, overlays, navigation, tables, charts, uploads, date/time controls, state blocks, and layout primitives.
- Storybook configuration and grouped stories for reusable components.
- Theme provider, toast provider, dark-mode styling, design tokens, typography helpers, and motion helpers.
- Public landing page with hero, search banner, features, why choose us, how it works, popular routes, testimonials, FAQ, app-coming-soon section, and footer.
- Sticky public header with navigation, login, register, theme toggle, mobile drawer, and authenticated profile dropdown.
- Dashboard shell with sidebar, top navigation, notifications, profile dropdown, command palette, search trigger, and mobile drawer.
- Customer dashboard UI sections for dashboard metrics, upcoming trips, recent bookings, quick search, notifications, recommended routes, saved trips, and profile summary.
- Travel agent dashboard UI sections for dashboard metrics, quick booking, recent bookings, statistics, customers, reports, and profile-oriented summaries.
- Admin dashboard UI sections for dashboard metrics, users, agents, bookings, coupons, offers, CMS, analytics, reports, audit logs, settings, profile access, top nav, notifications, dropdowns, and search.
- Error, loading, unauthorized, session expired, and maintenance state layouts.
- Component, design, theme, and layout documentation.
- Clean Architecture and DDD-oriented repo structure
- Auth module with register, login, logout, refresh, forgot password, reset password, verify email, and change password
- Argon2 password hashing, JWT access tokens, secure/httpOnly refresh cookies, refresh-token rotation, and hashed opaque token persistence
- User, Profile, Role, Permission, and Activity modules with controller, service, repository, DTO, entity, mapper, validator, and tests
- DB-driven RBAC for Customer, Travel Agent, and Admin roles. No Operator role is seeded or used.
- Email template architecture for welcome, verify email, forgot password, and password changed messages without provider integration
- Default admin seed: `admin@vriddhinexus.com` / `ChangeMe@123` with forced password change
- Supplier adapter interface and empty adapters for BCI, RedBus, AbhiBus, TBO, and Custom
- Prisma schema and migrations for users, roles, permissions, role permissions, refresh tokens, email verification tokens, password reset tokens, and activity logs
- Responsive Next.js authentication pages, profile page, change password page, 403 page, and session expired page
- Docker Compose, Dockerfiles, GitHub Actions CI, Jest, Playwright, ESLint, Prettier, Husky, Commitlint
- Architecture and API documentation

Deferred by design:

- Third-party supplier API integrations
- BCI, RedBus, AbhiBus, and TBO adapters
- Real payment capture and reconciliation
- External email provider integration
- S3 upload, AI provider, and live tracking provider implementation
