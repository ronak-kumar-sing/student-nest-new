# ----------------------------------------------------
# Stage 1: Build & compile
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies needed for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package descriptors
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci
RUN npx prisma generate

# Copy source and build configs
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Compile application
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production runner
# ----------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=4000

# Non-root user for container security
USER node

# Copy package manifests and generated prisma runtime
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/src/main.js"]
