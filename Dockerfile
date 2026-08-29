FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy backend source
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start
CMD ["node", "dist/server.js"]
