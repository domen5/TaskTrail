# Stage 1: Build the React app
FROM node:22.13-alpine AS builder

WORKDIR /app

# Add build argument
ARG VITE_BACKEND_URL
ARG VITE_GITHUB_URL
ARG VITE_REPOSITORY_URL
ARG VITE_LINKEDIN_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_GITHUB_URL=${VITE_GITHUB_URL}
ENV VITE_REPOSITORY_URL=${VITE_REPOSITORY_URL}
ENV VITE_LINKEDIN_URL=${VITE_LINKEDIN_URL}

COPY package.json package-lock.json ./
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
