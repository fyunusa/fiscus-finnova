import { DataSource } from 'typeorm';
import path from 'path';
import { config } from 'dotenv';
import { migrationPathCli } from './constants';

// Load env file
const nodeEnv = process.env.NODE_ENV || 'development';
config({ path: `.env.${nodeEnv}` });

const isProduction = nodeEnv === 'production';

// Use dist directory for entities and migrations to properly resolve path aliases
const entitiesPath = path.join(__dirname, 'dist/**/{entities,modules}/**/*.entity.js');
const migrationsPath = path.join(__dirname, 'dist/database/migrations/*.js');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: !isProduction,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

export default AppDataSource;
