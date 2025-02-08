# Stage 1: Build the application using the official Node.js image
FROM node:22.13-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./src ./src
COPY tsconfig.json .
RUN npm run build

# Stage 2: Create the production image
FROM node:22.13-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production

# Create SSL directory
RUN mkdir -p /app/ssl

# Expose both HTTP and HTTPS ports
EXPOSE 3000 3443

CMD ["node", "./dist/app.js"]
