# Stage 1: Build the React app
FROM node:22.13-alpine AS builder

WORKDIR /app

# Add build argument
ARG VITE_BACKEND_URL
ARG VITE_GITHUB_URL
ARG VITE_REPOSITORY_URL
ARG VITE_LINKEDIN_URL
ARG SERVER_IP
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_GITHUB_URL=${VITE_GITHUB_URL}
ENV VITE_REPOSITORY_URL=${VITE_REPOSITORY_URL}
ENV VITE_LINKEDIN_URL=${VITE_LINKEDIN_URL}
ENV SERVER_IP=${SERVER_IP}

COPY package.json package-lock.json ./
RUN npm install --silent

COPY . .
RUN npm run build

# Stage 2: Serve the app with NGINX
FROM nginx:1.27.3-alpine

# Install OpenSSL
RUN apk add --no-cache openssl

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Get the SERVER_IP argument in the second stage
ARG SERVER_IP

# Generate self-signed certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=${SERVER_IP}"

# Remove the default nginx static files
RUN rm -rf /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Replace localhost with SERVER_IP in nginx.conf
RUN sed -i "s/localhost/${SERVER_IP}/g" /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
