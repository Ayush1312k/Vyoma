# Multi-stage Dockerfile for DevAssembly

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Production Server ---
FROM node:20-alpine AS runner
WORKDIR /app

# Install Python3 for backend code execution support
RUN apk add --no-cache python3 py3-pip

# Backend setup
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

COPY backend/ ./

# Copy built frontend assets to serve or embed
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
