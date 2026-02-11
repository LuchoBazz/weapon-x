# ---- Builder Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
RUN npx prisma generate

COPY tsconfig.json ./
RUN npm run build

# ---- Runner Stage ----
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY --from=builder /app/src/generated ./src/generated
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
