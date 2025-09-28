# Simple production Dockerfile for single-host deployment
FROM node:20-alpine

WORKDIR /app

# Install root and frontend deps first to leverage caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm ci && cd frontend && npm ci

# Copy source
COPY . .

# Build frontend with relative API base and set production env
ENV NODE_ENV=production
ENV SERVE_FRONTEND=true
RUN cd frontend && REACT_APP_API_URL=/api npm run build

# Expose the default port (can be overridden by hosting)
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]