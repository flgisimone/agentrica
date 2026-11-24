FROM node:22.11.0-alpine3.20 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22.11.0-alpine3.20
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY server ./server
COPY web ./web
COPY db ./db
COPY data ./data
COPY package.json ./
USER node
EXPOSE 3000
CMD ["sh", "-c", "npm run migrate && node server/app.js"]
