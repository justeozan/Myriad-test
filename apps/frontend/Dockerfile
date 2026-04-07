FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS builder
COPY package*.json ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=apps/frontend
COPY apps/frontend ./apps/frontend
COPY packages/shared ./packages/shared
COPY tsconfig.base.json ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/frontend

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/frontend/public ./public 2>/dev/null || true
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
