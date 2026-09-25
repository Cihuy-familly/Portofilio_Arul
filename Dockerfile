# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite env is injected at build time.
ARG VITE_STRAPI_URL=https://strapi.cihuy-familly.my.id
ENV VITE_STRAPI_URL=${VITE_STRAPI_URL}

RUN npm run build

FROM nginx:1.27-alpine AS runtime

ARG BUILD_VERSION=dev
ARG VCS_REF=unknown

LABEL org.opencontainers.image.title="Portofilio Arul" \
      org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/DrdmRandom/Portofilio_Arul"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
