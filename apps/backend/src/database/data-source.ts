import { DataSource } from 'typeorm';
import path from 'path';
import { User } from '@modules/users/entities/user.entity';
import { Investment } from '@modules/investments/entities/investment.entity';
import { UserInvestment } from '@modules/investments/entities/user-investment.entity';

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
  entities: [User, Investment, UserInvestment],
  migrations: [
    path.join(__dirname, isProduction ? '../../migrations/*.js' : '../database/migrations/*.ts'),
  ],
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
});
