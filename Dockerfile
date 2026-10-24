FROM node:22.23-slim AS build

WORKDIR /app

RUN npm i -g pnpm

COPY ./package.json ./pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --config.strict-dep-builds=false
COPY ./ ./
RUN pnpm build

CMD [ "pnpm", "start" ]