FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma apps/api/prisma
COPY packages packages
RUN pnpm pkg delete scripts.prepare
RUN pnpm install --prod --frozen-lockfile --filter @vnbus/api...

FROM deps AS builder
COPY apps/api apps/api
COPY tsconfig.base.json ./
RUN pnpm --filter @vnbus/api prisma:generate
RUN pnpm --filter @vnbus/api build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node --from=prod-deps /app/node_modules node_modules
COPY --chown=node:node --from=prod-deps /app/packages packages
COPY --chown=node:node --from=builder /app/apps/api/dist apps/api/dist
COPY --chown=node:node --from=builder /app/apps/api/prisma apps/api/prisma
WORKDIR /app/apps/api
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- "http://127.0.0.1:${PORT:-4000}/api/v1/health/live" || exit 1
CMD ["node", "dist/main.js"]
