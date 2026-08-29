FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install ALL dependencies (including dev for tsc build)
RUN npm ci

# Copy backend source and config
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Build TypeScript
RUN npx tsc

# Remove devDependencies after build
RUN npm prune --omit=dev

# Expose port
EXPOSE 3001

# Start
CMD ["node", "dist/server.js"]
