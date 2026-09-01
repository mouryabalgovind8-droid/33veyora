FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install ALL dependencies (including dev for tsc build)
RUN npm ci

# Copy backend build tooling, source and config
COPY backend/scripts ./scripts
COPY backend/tsconfig.json ./
COPY backend/tsconfig.build.json ./
COPY backend/src ./src

# Build TypeScript with build config (write-build-info.cjs embeds the deployed commit SHA)
RUN npm run build

# Remove devDependencies after build
RUN npm prune --omit=dev

# Copy database migrations and seeds (needed at runtime)
COPY database/ ./database/

# Expose port
EXPOSE 3001

# Start
CMD ["node", "dist/server.js"]
