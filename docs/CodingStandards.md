# Coding Standards

## Principles

- Keep domain boundaries explicit.
- Depend on interfaces at integration boundaries.
- Prefer small application services over controller logic.
- Keep DTO validation at the edge with class-validator or Zod.
- Keep persistence details inside repositories.
- Avoid supplier-specific fields leaking into booking, seat, search, or ticket use cases.

## Backend

- Controllers translate HTTP to application calls.
- Services coordinate use cases and enforce application rules.
- Repositories own Prisma access.
- Entities model module/domain concepts.
- Validators enforce module-specific invariants.
- Guards and decorators handle authentication and authorization.
- Tests live inside each module under `tests/`.

## Frontend

- App Router pages compose feature components.
- Shared primitives come from `@vnbus/ui`.
- Forms use React Hook Form with Zod schemas.
- Server state uses TanStack Query.
- Lightweight client state uses Zustand.
- UI remains responsive, keyboard accessible, and restrained.

## Security

- Never commit real secrets.
- Use `.env.example` for documented variables.
- Hash passwords with Argon2id and hash sensitive opaque tokens before persistence.
- Use RBAC decorators for protected operations.
- Add audit records for security-sensitive state changes.

## Git

- Conventional commits are enforced through Commitlint.
- Husky and lint-staged run formatting checks before commits.
- CI runs install, Prisma generate, lint, typecheck, tests, and build.
