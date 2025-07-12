FROM node:22-slim AS base
RUN npm install -g pnpm@10.13

WORKDIR /src/
COPY ./ /src/

RUN pnpm install -P --frozen-lockfile
RUN pnpm run build

# This Docker image come from https://github.com/stephane-klein/nginx-brotli-docker/blob/main/Dockerfile
FROM stephaneklein/nginx-brotli:1.23.4

COPY --from=base /src/dist/ /usr/share/nginx/html/

RUN chown nginx:nginx /usr/share/nginx/html/ -R
COPY nginx-config/default.conf /etc/nginx/conf.d/default.conf
