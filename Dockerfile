# Stage 1: Build the static Vite app
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the static build with a tiny static server.
# The SPA needs history-fallback so client routes (/hom, /prim, /resume) work.
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
RUN npm install -g serve@14
COPY --from=builder /app/dist ./dist
EXPOSE 8080
# -s => single-page-app mode (history fallback to index.html)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
