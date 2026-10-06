# --- deps: instala dependencias en una capa cacheable aparte ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: compila el sitio ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Se define en tiempo de build en Dokploy (URL pública del backend en prod).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Next incrusta esta URL al compilar: si falta, el sitio queda sin poder
# hablar con el backend. Mejor que el build falle a que salga roto.
RUN test -n "$NEXT_PUBLIC_API_URL" \
  || (echo "ERROR: falta el build arg NEXT_PUBLIC_API_URL" && exit 1)
RUN npm run build

# --- runner: imagen final, liviana, sin devDependencies ni código fuente ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
