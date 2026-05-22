FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/db/migrations ./src/db/migrations
COPY .env.example ./.env.example
COPY service-dependencies.json ./service-dependencies.json
EXPOSE 5000
CMD ["sh", "-c", "node dist/db/runMigration.js && node dist/server.js"]
