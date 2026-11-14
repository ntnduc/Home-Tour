import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

// DataSource for the TypeORM CLI in production (runs from dist/).
// Local dev keeps using typeorm.config.ts at the project root.
config();

// Match only .js when compiled, so .d.ts files in dist/ are not loaded as migrations.
const ext = __filename.endsWith('.ts') ? 'ts' : 'js';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    join(__dirname, '..', '**', `*.entity.${ext}`),
    join(__dirname, '..', '**', `*.view.${ext}`),
  ],
  migrations: [join(__dirname, 'migrations', `*.${ext}`)],
  synchronize: false,
});
