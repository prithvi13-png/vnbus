# Layout Documentation

Milestone 3 adds layout primitives and applies them across public, auth, dashboard, customer, travel agent, admin, and error surfaces.

## Layout Components

Exports from `@vnbus/ui`:

- `PublicLayout`: public pages with light/dark base background.
- `AuthenticationLayout`: auth-specific full-page shell.
- `DashboardLayout`: shared dashboard structure with optional sidebar and topbar.
- `CustomerLayout`: alias for role dashboard layout.
- `TravelAgentLayout`: alias for role dashboard layout.
- `AdminLayout`: alias for role dashboard layout.
- `ErrorLayout`: centered state layout for error and maintenance pages.

## Web App Layouts

Public:

- `apps/web/app/page.tsx`
- `apps/web/components/site-header.tsx`
- `apps/web/components/site-footer.tsx`

Authentication:

- Existing auth pages and forms remain in place.
- No auth architecture changes were made for Milestone 3.

Dashboard:

- `apps/web/components/dashboard-shell.tsx`
- Desktop sidebar, mobile drawer, top navigation, theme toggle, profile dropdown, notifications, and command palette.

Role dashboards:

- General operations: `apps/web/app/dashboard/page.tsx`
- Customer: `apps/web/app/customer/dashboard/page.tsx`
- Travel agent: `apps/web/app/agent/dashboard/page.tsx`
- Admin: `apps/web/app/admin/dashboard/page.tsx`

State pages:

- `apps/web/app/loading.tsx`
- `apps/web/app/not-found.tsx`
- `apps/web/app/error.tsx`
- `apps/web/app/global-error.tsx`
- `apps/web/app/unauthorized/page.tsx`
- `apps/web/app/session-expired/page.tsx`
- `apps/web/app/maintenance/page.tsx`

## Navigation Coverage

Customer navigation:

- Dashboard
- Bookings
- Profile
- Notifications
- Tickets

Travel agent navigation:

- Dashboard
- Bookings
- Customers
- Reports

Admin navigation:

- Dashboard
- Users
- Agents
- Bookings
- Coupons
- Offers
- CMS
- Analytics
- Reports
- Email Templates
- Audit Logs
- Settings
- Profile

## Boundary

Layouts are UI-only in Milestone 3. They use dummy data and client UI state only. Booking workflows, supplier integrations, payment flows, and auth architecture changes remain deferred.
