#!/bin/bash

# Backend Quick Start Script
# This script sets up the backend for first-time development

set -e

echo "🚀 Fiscus Backend Setup"
echo "======================="
echo ""

# Check if in backend directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this script from the backend directory"
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "⚠️  Warning: Node.js 20+ is recommended (current: $(node -v))"
fi

echo "✅ Step 1: Installing dependencies with Yarn..."
if ! command -v yarn &> /dev/null; then
  echo "⚠️  Yarn not found. Installing with npm..."
  npm install -g yarn
fi
yarn install
echo ""

echo "✅ Step 2: Setting up environment..."
if [ ! -f ".env.development" ]; then
  cp .env.example .env.development
  echo "   Created .env.development"
else
  echo "   .env.development already exists"
fi
echo ""

echo "✅ Step 3: Checking Docker..."
if command -v docker &> /dev/null; then
  echo "   Docker found: $(docker --version)"
  echo ""
  echo "✅ Step 4: Starting PostgreSQL with Docker Compose..."
  docker-compose up -d postgres
  echo "   PostgreSQL started on port 5432"
  sleep 3
  echo ""
  
  echo "✅ Step 5: Running database migrations..."
  yarn migration:run || true
  echo ""
else
  echo "⚠️  Docker not found. You'll need to start PostgreSQL manually"
  echo "   Connection: postgres://fiscus_user:fiscus_password@localhost:5432/fiscus_db"
fi

echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Start dev server:"
echo "      yarn dev"
echo ""
echo "   2. Or start with Docker Compose (PostgreSQL + Backend):"
echo "      docker-compose up"
echo ""
echo "   3. Access API documentation:"
echo "      http://localhost:3001/api-docs"
echo ""
echo "💡 For more info, see:"
echo "   - README.md - Full documentation"
echo "   - DEVELOPMENT.md - Development guide"
echo "   - SETUP_SUMMARY.md - Setup overview"
