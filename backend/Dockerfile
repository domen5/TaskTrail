# Stage 1: Build the application using the official Node.js image
FROM node:22.13-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --silent

COPY . .
RUN npm run build

# Stage 2: Create the production image
FROM node:22.13-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package-lock.json /app/

RUN npm install --only=production

# TODO: manage PORT var with an env variable
EXPOSE 3000

CMD ["node", "dist/app.js"]
