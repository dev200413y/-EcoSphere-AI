# Step 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .



# Build the app for production
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled React build from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 (Google Cloud Run default port)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
