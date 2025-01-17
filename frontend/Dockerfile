# Stage 1: Build the React app
FROM node:22.13-alpine as builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

COPY . .
RUN npm run build

# Stage 2: Serve the app with NGINX
FROM nginx:1.27.3-alpine

# Remove the default nginx static files
RUN rm -rf /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
