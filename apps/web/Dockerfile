FROM oven/bun:1.3-alpine AS build
WORKDIR /app

ARG VITE_API_URL=/api
ARG VITE_API_SERVER_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL VITE_API_SERVER_URL=$VITE_API_SERVER_URL

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN bun install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN bun run --cwd apps/web build

FROM oven/bun:1.3-alpine AS runner
WORKDIR /app

COPY --from=build /app/apps/web/.output ./.output

EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
