FROM debian:12

WORKDIR /app

# Install system dependencies
RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --yes curl wget && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash && \
    DEBIAN_FRONTEND=noninteractive apt-get install --yes nodejs && \
    DEBIAN_FRONTEND=noninteractive apt-get install --yes wget build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev vim less iputils-ping sudo libsecret-1-0 command-not-found rsync man-db netcat-openbsd dnsutils procps lsof tini && \
    DEBIAN_FRONTEND=noninteractive apt-get update

# Install pnpm
RUN npm install -g pnpm
RUN pnpm set store-dir /app/node_modules/.pnpm-store

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build the application
RUN pnpm exec prisma generate
RUN pnpm run build

# Make startup script executable
RUN chmod +x start.sh

# Expose port (Railway will set PORT environment variable)
EXPOSE 3000

# Start the application
CMD ["./start.sh"]