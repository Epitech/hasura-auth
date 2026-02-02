FROM node:20-slim AS build

WORKDIR /app

RUN npm i -g pnpm

COPY ./package.json ./pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY ./ ./
RUN pnpm build

CMD [ "pnpm", "start" ]