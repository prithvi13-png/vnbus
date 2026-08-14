# Folder Structure

```text
.
├── apps
│   ├── api
│   │   ├── prisma
│   │   │   ├── migrations
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src
│   │       ├── modules
│   │       │   ├── activity
│   │       │   ├── auth
│   │       │   ├── user
│   │       │   ├── profile
│   │       │   ├── role
│   │       │   ├── permission
│   │       │   ├── customer
│   │       │   ├── agent
│   │       │   ├── agent-booking
│   │       │   ├── agent-report
│   │       │   ├── agent-notification
│   │       │   ├── admin
│   │       │   ├── analytics
│   │       │   ├── audit
│   │       │   ├── booking
│   │       │   ├── booking-history
│   │       │   ├── cache
│   │       │   ├── cms
│   │       │   ├── coupons
│   │       │   ├── reservation
│   │       │   ├── passenger
│   │       │   ├── feature-flag
│   │       │   ├── health
│   │       │   ├── integration
│   │       │   ├── metrics
│   │       │   ├── monitoring
│   │       │   ├── notification
│   │       │   ├── offers
│   │       │   ├── payment
│   │       │   ├── platform-settings
│   │       │   ├── queue-system
│   │       │   ├── search
│   │       │   ├── scheduler
│   │       │   ├── ticket
│   │       │   ├── timeline
│   │       │   ├── seat
│   │       │   ├── seo
│   │       │   ├── tracking
│   │       │   ├── supplier
│   │       │   ├── supplier-configuration
│   │       │   ├── ai
│   │       │   ├── settings
│   │       │   └── reports
│   │       └── shared
│   │           ├── domain
│   │           ├── email
│   │           ├── filters
│   │           ├── http
│   │           ├── interceptors
│   │           ├── observability
│   │           ├── prisma
│   │           └── security
│   └── web
│       ├── app
│       │   ├── admin
│       │   │   ├── dashboard
│       │   │   ├── bookings
│       │   │   ├── users
│       │   │   ├── agents
│       │   │   ├── customers
│       │   │   ├── roles
│       │   │   ├── coupons
│       │   │   ├── offers
│       │   │   ├── cms
│       │   │   ├── notifications
│       │   │   ├── email-templates
│       │   │   ├── reports
│       │   │   ├── analytics
│       │   │   ├── audit-logs
│       │   │   ├── activity-logs
│       │   │   ├── platform-settings
│       │   │   ├── feature-flags
│       │   │   ├── system-monitoring
│       │   │   ├── supplier-configuration
│       │   │   └── profile
│       │   ├── agent
│       │   │   ├── dashboard
│       │   │   ├── quick-booking
│       │   │   ├── bookings
│       │   │   ├── customers
│       │   │   ├── reports
│       │   │   ├── notifications
│       │   │   ├── profile
│       │   │   ├── settings
│       │   │   └── help
│       │   ├── customer
│       │   ├── dashboard
│       │   ├── login
│       │   ├── register
│       │   ├── forgot-password
│       │   ├── reset-password
│       │   ├── verify-email
│       │   ├── profile
│       │   ├── change-password
│       │   ├── booking-history
│       │   ├── seat-layout
│       │   ├── passenger-details
│       │   ├── booking-review
│       │   ├── booking-confirmation
│       │   ├── ticket
│       │   ├── download-ticket
│       │   ├── upcoming-trips
│       │   ├── past-trips
│       │   ├── cancelled-trips
│       │   ├── notifications
│       │   ├── maintenance
│       │   ├── robots.ts
│       │   ├── sitemap.ts
│       │   ├── unauthorized
│       │   └── session-expired
│       ├── components
│       │   ├── admin-portal.tsx
│       │   ├── agent-portal.tsx
│       │   ├── booking-flow.tsx
│       │   ├── booking-management.tsx
│       │   ├── milestone-nine-widgets.tsx
│       │   └── dashboard-shell.tsx
│       ├── lib
│       │   ├── agent-store.ts
│       │   ├── api-client.ts
│       │   ├── booking-store.ts
│       │   └── milestone-nine-store.ts
│       ├── public
│       └── tests
├── packages
│   ├── config
│   ├── shared
│   ├── supplier-sdk
│   ├── types
│   └── ui
│       ├── src
│       │   ├── animations
│       │   ├── calendar
│       │   ├── charts
│       │   ├── components
│       │   ├── feedback
│       │   ├── forms
│       │   ├── hooks
│       │   ├── layouts
│       │   ├── navigation
│       │   ├── overlays
│       │   ├── providers
│       │   ├── stories
│       │   ├── styles
│       │   ├── tables
│       │   ├── theme
│       │   └── uploads
│       └── .storybook
├── docs
│   ├── BookingFlow.md
│   ├── IntegrationArchitecture.md
│   ├── integration
│   │   ├── EnvironmentConfigurationGuide.md
│   │   ├── ErrorHandlingGuide.md
│   │   ├── IdempotencyGuide.md
│   │   ├── PaymentIntegrationGuide.md
│   │   ├── SupplierAdapterDevelopmentGuide.md
│   │   ├── SupplierIntegrationGuide.md
│   │   └── WebhookGuide.md
│   ├── BookingHistory.md
│   ├── AdminArchitecture.md
│   ├── AgentArchitecture.md
│   ├── AnalyticsArchitecture.md
│   ├── AiRecommendationGuide.md
│   ├── CachingGuide.md
│   ├── CMS.md
│   ├── CustomerManagement.md
│   ├── FeatureFlags.md
│   ├── FutureSupplierIntegration.md
│   ├── MonitoringGuide.md
│   ├── QueueGuide.md
│   ├── RBAC.md
│   ├── SeoGuide.md
│   ├── AgentReports.md
│   ├── NotificationArchitecture.md
│   ├── SeatEngine.md
│   ├── TicketArchitecture.md
└── tools
```

Each backend module follows the same bounded-context shape. Mappers and interfaces are present where the module has conversion or contract boundaries:

```text
controllers/
services/
repositories/
dto/
entities/
validators/
tests/
mappers/
interfaces/
```
