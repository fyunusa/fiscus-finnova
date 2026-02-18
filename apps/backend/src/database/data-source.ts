import { DataSource } from 'typeorm';
import path from 'path';
import { ALL_ENTITIES } from './entities';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'fyunusa',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'fiscus_db',
  synchronize: false,
  logging: !isProduction ? ['error', 'warn'] : false,
  entities: ALL_ENTITIES,
  migrations: [
    path.join(__dirname, isProduction ? '../../migrations/*.js' : '../database/migrations/*.ts'),
  ],
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
});
