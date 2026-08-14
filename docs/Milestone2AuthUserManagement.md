# Milestone 2 Authentication and User Management

Milestone 2 adds authentication and user management only. Booking, supplier, payment, PDF, S3, AI, and map integrations remain out of scope.

## Folder Structure

```text
apps/api/src/modules
├── activity
├── auth
├── permission
├── profile
├── role
└── user

apps/web/app
├── change-password
├── forgot-password
├── login
├── profile
├── register
├── reset-password
├── session-expired
├── unauthorized
└── verify-email
```

Each Milestone 2 backend module contains controller, service, repository, DTO, entity, mapper, validator, and test layers where applicable.

## Roles and Permissions

Seeded roles:

```text
CUSTOMER
TRAVEL_AGENT
ADMIN
```

No Operator role is created or referenced.

Example seeded permissions:

```text
users.create
users.view
users.edit
users.delete
bookings.view
bookings.update
reports.view
settings.manage
```

## API List

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/change-password
POST   /api/v1/auth/verify-email
GET    /api/v1/auth/me

GET    /api/v1/users/me
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/profile
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

GET    /api/v1/profile
PATCH  /api/v1/profile
GET    /api/v1/roles
GET    /api/v1/roles/:code
GET    /api/v1/permissions
GET    /api/v1/activity
```

## Auth Flow

```mermaid
sequenceDiagram
  participant Client
  participant AuthAPI as Auth API
  participant DB as PostgreSQL
  participant Email as Email Templates

  Client->>AuthAPI: Register or login
  AuthAPI->>DB: Validate user, role, permissions, and Argon2 password hash
  AuthAPI->>DB: Store hashed refresh token with token family
  AuthAPI-->>Client: Access JWT and secure/httpOnly refresh cookie
  Client->>AuthAPI: Refresh session
  AuthAPI->>DB: Validate token hash and revoke old token
  AuthAPI-->>Client: New access JWT and replacement refresh cookie
  Client->>AuthAPI: Verify email or reset password
  AuthAPI->>DB: Consume hashed one-time token
  AuthAPI->>Email: Prepare provider-free notification template
```

## RBAC Flow

```mermaid
flowchart LR
  DB["Roles + Permissions"] --> ISSUE["Token Issuance"]
  ISSUE --> JWT["Access JWT Claims"]
  JWT --> AUTH["JWT Access Guard"]
  AUTH --> ROLE["Role Guard"]
  AUTH --> PERMISSION["Permission Guard"]
  ROLE --> HANDLER["Controller Handler"]
  PERMISSION --> HANDLER
```

Authorization is database-driven at token issuance time. Controllers use permission decorators for user, role, permission, profile, and activity endpoints.

## Test Summary

Validation run during implementation:

```text
DATABASE_URL=postgresql://vnbus:vnbus@localhost:5432/vnbus?schema=public pnpm --filter @vnbus/api exec prisma validate --schema prisma/schema.prisma
DATABASE_URL=postgresql://vnbus:vnbus@localhost:5432/vnbus?schema=public pnpm db:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format:check
```

Results:

```text
Prisma schema valid
Prisma Client generated
25 API test suites passed
6 Playwright smoke tests passed
Production build passed
Prettier check passed
```
