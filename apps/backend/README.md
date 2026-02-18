# Fiscus Backend API

Node.js/Express backend for Fiscus financial platform with PostgreSQL, TypeORM, and Swagger API documentation.

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **API Docs**: Swagger/OpenAPI 3.0
- **Package Manager**: Yarn
- **Containerization**: Docker & Docker Compose

## Project Structure

```
src/
├── modules/           # Feature modules (auth, users, investments, loans, etc.)
├── database/          # Database configuration, migrations, seeds
├── config/            # Configuration files
├── middleware/        # Express middleware
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
├── app.ts             # Express app setup
└── index.ts           # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn package manager
- Docker & Docker Compose
- PostgreSQL 16+ (optional, can use Docker)

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Create environment file:
```bash
cp .env.example .env.development
```

3. Start PostgreSQL using Docker:
```bash
docker-compose up -d postgres
```

4. Run database migrations:
```bash
yarn migration:run
```

5. Start development server:
```bash
yarn dev
```

The server will run on `http://localhost:3001`

### Using Docker Compose

Start the entire stack (PostgreSQL, pgAdmin, and Backend):

```bash
docker-compose up
```

- Backend API: http://localhost:3001
- API Docs (Swagger): http://localhost:3001/api-docs
- pgAdmin: http://localhost:5050 (admin@fiscus.com / admin)

### Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build TypeScript to JavaScript
- `yarn start` - Start production server
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn migration:generate` - Generate new migration
- `yarn migration:run` - Run pending migrations
- `yarn migration:revert` - Revert last migration
- `yarn seed` - Seed database with sample data

## API Documentation

API documentation is available at: **http://localhost:3001/api-docs**

All API endpoints should be prefixed with `/api/v1`

## Database Migrations

### Generate a new migration

```bash
yarn migration:generate src/database/migrations/CreateUserTable
```

### Run migrations

```bash
yarn migration:run
```

### Revert last migration

```bash
yarn migration:revert
```

## Module Structure

Each module should follow this structure:

```
src/modules/moduleName/
├── entities/          # TypeORM entities
├── controllers/       # Request handlers
├── services/          # Business logic
├── routes/            # Route definitions
├── dtos/              # Data transfer objects
└── index.ts           # Module export
```

## Environment Variables

See `.env.example` for all available variables:

- `NODE_ENV` - Environment (development, staging, production)
- `PORT` - Server port (default: 3001)
- `DB_*` - Database connection details
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRATION` - JWT token expiration (default: 7d)
- `API_PREFIX` - API route prefix (default: /api/v1)

## Security

- Uses Helmet.js for HTTP headers security
- CORS configured for cross-origin requests
- JWT-based authentication
- Password hashing with bcryptjs

## Development Workflow

1. Create new feature branch
2. Implement module in `src/modules/`
3. Add Swagger documentation comments
4. Write tests
5. Ensure linting passes: `yarn lint`
6. Format code: `yarn format`
7. Submit PR

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# View logs
docker-compose logs postgres
```

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Module Path Issues

Ensure TypeScript paths in `tsconfig.json` match imports.

## Next Steps

Implement modules:
1. **Authentication** - User login, registration, JWT
2. **User Management** - User profiles, roles, permissions
3. **Investments** - Investment products, portfolio tracking
4. **Loans** - Loan products, application management
5. **Transactions** - Transaction history, reports
6. **Notifications** - Email, SMS, in-app notifications

