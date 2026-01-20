# Use lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better Docker cache)
COPY package.json package-lock.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose app port (change if your app uses a different one)
EXPOSE 8686

# Start the application
CMD ["node", "src/index.js"]
