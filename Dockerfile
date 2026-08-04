# syntax=docker/dockerfile:1.10

# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.js file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:22.22.0-alpine AS base

RUN corepack enable

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=secret,id=FONTAWESOME_NPM_TOKEN,required=true,env=FONTAWESOME_NPM_TOKEN \
    pnpm install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# These values exist only while compiling the standalone application. Runtime
# secrets and the real database URL must be supplied to the final container.
ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN NEXT_PUBLIC_SERVER_URL="${NEXT_PUBLIC_SERVER_URL}" node scripts/assert-production-origin.mjs && \
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
    MEDIA_STORAGE_MODE=build \
    NEXT_PUBLIC_SERVER_URL="${NEXT_PUBLIC_SERVER_URL}" \
    PAYLOAD_DB_PUSH=false \
    PAYLOAD_SECRET=build-only-payload-secret-do-not-use-at-runtime \
    pnpm build

# Dedicated release-step image. It is derived from the same successful build,
# source revision, and lockfile as the standalone runtime image.
FROM builder AS migrator
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_DB_PUSH=false
ENV HOME=/tmp

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 payload

USER payload

ENTRYPOINT ["node", "scripts/run-migrations.mjs"]

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Remove this line if you do not have this folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts/container-healthcheck.mjs ./scripts/container-healthcheck.mjs

USER nextjs

EXPOSE 3000

ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD ["node", "scripts/container-healthcheck.mjs"]

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
