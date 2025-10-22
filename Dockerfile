# # Use Node.js 18 slim image
# FROM node:20-slim

# # Set working directory
# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     python3 \
#     make \
#     g++ \
#     curl \
#     && rm -rf /var/lib/apt/lists/*

# # Copy package files
# COPY package*.json ./

# # Install all dependencies (use install to allow lockfile updates for optional deps)
# RUN npm install

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# # Remove dev dependencies to reduce image size
# RUN npm prune --production

# # Create non-root user for security
# RUN groupadd -r appuser && useradd -r -g appuser appuser
# RUN chown -R appuser:appuser /app
# USER appuser

# # Expose port (Cloud Run uses PORT environment variable)
# EXPOSE 8080

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:8080/api/health || exit 1

# # Set environment variables
# ENV NODE_ENV=production
# ENV PORT=8080

# # Start the simple server
# CMD ["node", "simple-server.js"]
# Use Node.js 18 slim image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies (use install to allow lockfile updates for optional deps)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build



# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port (Cloud Run uses PORT environment variable)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the compiled server (serves API and frontend)
CMD ["node", "dist/index.js"]
