# ===== EduCommunity Frontend / Admin — Production Dockerfile (multi-stage) =====
# Builds the Vite app, then serves the static output with nginx.
# Build:  docker build -f frontend.Dockerfile -t educommunity-frontend ./educommunity-frontend
# (use the same file for educommunity-admin)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_* build-time vars are injected from CI (see deploy.yml)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine AS runner
# SPA routing: fall back to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
