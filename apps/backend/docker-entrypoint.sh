#!/bin/sh

set -e  # Exit on any error

echo "Starting entrypoint..."

# Display current environment
echo "🌱 Environment: $NODE_ENV"
echo "🗄️  DB_HOST: $DB_HOST"

# Build app
echo "📦 Building app..."
npm run build

# Run migrations
echo "🧬 Running migrations..."
npm run migration:run

echo "🚀 Launching app..."
exec ${APP_COMMAND:-npm run start:prod}
