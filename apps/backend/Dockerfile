FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS builder
COPY package*.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/wallet/package.json ./packages/wallet/
COPY packages/issuer/package.json ./packages/issuer/
COPY packages/verifier/package.json ./packages/verifier/
RUN npm ci --workspace=apps/backend
COPY apps/backend ./apps/backend
COPY packages ./packages
COPY tsconfig.base.json ./
RUN npm run build --workspace=apps/backend

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/index.js"]
