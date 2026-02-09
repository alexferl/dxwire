# Build stage
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Production stage with Caddy
FROM caddy:2.10.2-alpine

RUN addgroup -g 65532 -S caddy && \
    adduser -u 65532 -S caddy -G caddy

RUN chown -R caddy:caddy /usr/share/caddy /config /data

COPY --from=builder --chown=caddy:caddy /app/dist /usr/share/caddy
COPY --chown=caddy:caddy etc/caddy/Caddyfile /etc/caddy/Caddyfile

USER caddy

EXPOSE 80 443
