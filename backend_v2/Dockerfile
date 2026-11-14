# ---------- build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Native build tools for bcrypt
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# ---------- runtime stage ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

RUN mkdir -p /app/uploads && chown node:node /app/uploads
USER node

EXPOSE 3000
CMD ["node", "dist/main"]
