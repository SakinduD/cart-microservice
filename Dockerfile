FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/server.js       ./server.js
COPY --from=builder /app/config          ./config
COPY --from=builder /app/controllers     ./controllers
COPY --from=builder /app/helpers         ./helpers
COPY --from=builder /app/middleware      ./middleware
COPY --from=builder /app/models          ./models
COPY --from=builder /app/routes          ./routes

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8002

CMD ["node", "server.js"]
