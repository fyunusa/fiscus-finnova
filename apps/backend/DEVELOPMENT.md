# Backend Development Setup Guide

## Quick Start

### 1. Using Docker Compose (Recommended)

```bash
cd apps/backend
docker-compose up
```

This will:
- Start PostgreSQL on port 5432
- Start pgAdmin on port 5050
- Build and start the backend on port 3001

Access:
- API: http://localhost:3001/api-docs
- pgAdmin: http://localhost:5050

### 2. Local Development

```bash
cd apps/backend

# Install dependencies
yarn install

# Create environment file
cp .env.example .env.development

# Start PostgreSQL only (if using Docker)
docker-compose up postgres -d

# Run migrations
yarn migration:run

# Start dev server
yarn dev
```

## Available Commands

```bash
# Development
yarn dev              # Start with hot reload
yarn build            # Build TypeScript
yarn start            # Run production build

# Testing
yarn test             # Run tests
yarn test:watch       # Watch mode

# Database
yarn migration:generate  # Create new migration
yarn migration:run       # Run migrations
yarn migration:revert    # Revert last migration
yarn seed               # Seed database

# Code Quality
yarn lint              # Check linting
yarn format            # Format code
```

## Docker Compose Services

1. **PostgreSQL** (postgres)
   - Host: localhost:5432
   - Username: fiscus_user
   - Password: fiscus_password
   - Database: fiscus_db

2. **pgAdmin**
   - URL: http://localhost:5050
   - Email: admin@fiscus.com
   - Password: admin

3. **Backend API**
   - URL: http://localhost:3001
   - API Docs: http://localhost:3001/api-docs
   - Health: http://localhost:3001/health

## Project Structure

```
src/
├── modules/           # Feature modules
│   └── users/         # Example user module
│       ├── entities/  # Database entities
│       ├── services/  # Business logic
│       ├── controllers/ # Request handlers
│       ├── routes/    # Route definitions
│       ├── dtos/      # Data transfer objects
│       └── index.ts   # Module exports
├── database/
│   ├── data-source.ts # TypeORM configuration
│   └── migrations/    # Database migrations
├── config/            # App configuration
├── middleware/        # Express middleware
├── utils/             # Utility functions
├── types/             # TypeScript definitions
├── app.ts             # Express app setup
└── index.ts           # Entry point
```

## Creating New Modules

Each module should follow this structure:

```
src/modules/moduleName/
├── entities/          # Database entities
├── controllers/       # Request handlers
├── services/          # Business logic
├── routes/            # Route definitions
├── dtos/              # Data transfer objects
└── index.ts           # Module exports
```

### Example: Authentication Module

```bash
# 1. Create directory
mkdir -p src/modules/auth/{entities,controllers,services,routes,dtos}

# 2. Create entity
# src/modules/auth/entities/AuthToken.ts

# 3. Create service
# src/modules/auth/services/AuthService.ts

# 4. Create controller
# src/modules/auth/controllers/AuthController.ts

# 5. Create routes
# src/modules/auth/routes/index.ts

# 6. Create DTOs
# src/modules/auth/dtos/index.ts

# 7. Export from module
# src/modules/auth/index.ts

# 8. Add routes to app.ts
# import authRoutes from '@modules/auth/routes';
# apiRouter.use('/auth', authRoutes);
```

## Modules to Implement

Priority order for backend modules:

1. **Authentication** - User login, registration, JWT
2. **User Management** - User profiles, roles, permissions
3. **Investments** - Investment products, portfolio tracking
4. **Loans** - Loan products, application management
5. **Transactions** - Transaction history, reports
6. **Notifications** - Email, SMS, in-app notifications
7. **Documents** - Document upload, verification
8. **Reports** - Financial reports, analytics

## API Documentation

Swagger documentation is automatically generated from JSDoc comments in route files and controllers.

**Format for documenting endpoints:**

```typescript
/**
 * @swagger
 * /path:
 *   get:
 *     tags:
 *       - Resource
 *     summary: Endpoint description
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 *       404:
 *         description: Not found
 */
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL container
docker ps | grep postgres

# View logs
docker-compose logs postgres
```

### Module Not Found
Ensure TypeScript paths in `tsconfig.json` match your import statements.

## Environment Variables

Development defaults are in `.env.development`. For production, create `.env.production` with appropriate values.

See `.env.example` for all available configuration options.
