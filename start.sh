#!/bin/bash

# Set default port if not provided
export PORT=${PORT:-3000}

# Run database migrations
echo "Running database migrations..."
pnpm exec prisma migrate deploy

# Start the application
echo "Starting application on port $PORT..."
pnpm start