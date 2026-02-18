import { join } from 'path';

const isCompiled = __dirname.includes('dist');

// For CLI usage (dev or prod)
export const migrationPathCli = isCompiled
  ? join(__dirname, './migrations/*.js')
  : join(__dirname, './src/database/migrations/*.ts');

// For runtime inside NestJS
export const migrationPath = isCompiled
  ? join(__dirname, './migrations/*.js')
  : join(__dirname, './src/database/migrations/*.ts');

export const ENTITIES = isCompiled
  ? [join(__dirname, './src/modules/**/*.entity.js')]
  : [join(__dirname, './src/modules/**/*.entity.ts')];
