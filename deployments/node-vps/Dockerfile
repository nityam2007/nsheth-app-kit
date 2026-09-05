FROM node:24-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npm run db:generate --workspace playground
RUN npm run build

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 3000
CMD ["node", "scripts/serve.mjs"]
