FROM oven/bun:1.3-alpine AS build
WORKDIR /app

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
