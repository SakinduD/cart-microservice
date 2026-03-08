# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile – Multi-stage build for Cart Microservice
#
# Stage 1 (builder): installs ALL dependencies (including devDependencies)
#                     so any build step can run.
# Stage 2 (production): copies only production node_modules & source,
#                        resulting in a much smaller final image.
#
# Best-practice notes (SE4010):
#   • node:20-alpine keeps the image small (~180 MB vs ~900 MB for full).
#   • Non-root user "appuser" limits blast radius if the container is
#     compromised (least-privilege principle).
#   • EXPOSE is documentation; the actual port mapping happens in ECS task.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (Docker layer caching)
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# ── Stage 2: Production ────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source from builder (skips dev artefacts)
COPY --from=builder /app/server.js       ./server.js
COPY --from=builder /app/config          ./config
COPY --from=builder /app/controllers     ./controllers
COPY --from=builder /app/helpers         ./helpers
COPY --from=builder /app/middleware      ./middleware
COPY --from=builder /app/models          ./models
COPY --from=builder /app/routes          ./routes

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8002

CMD ["node", "server.js"]
