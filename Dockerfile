# Stage 1: Build React static assets
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install packages
RUN npm ci

# Copy source code files
COPY . .

# Run production build compilation
RUN npm run build

# Stage 2: Serve compiled assets using Nginx
FROM nginx:alpine

# Copy built assets to default nginx location
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
