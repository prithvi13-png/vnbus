FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY apps/web apps/web
COPY tsconfig.base.json ./
RUN pnpm --filter @vnbus/web build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node --from=builder /app/apps/web/.next/standalone ./
COPY --chown=node:node --from=builder /app/apps/web/.next/static apps/web/.next/static
COPY --chown=node:node --from=builder /app/apps/web/public apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:3000/maintenance || exit 1
CMD ["node", "apps/web/server.js"]
