FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/marketing/package.json ./apps/marketing/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @o7n/marketing build


FROM nginx:alpine AS runner

COPY --from=builder /app/apps/marketing/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]