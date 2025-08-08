import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

// Database connection configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'root',
  database: 'School_database',
  max: 1,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
});

// Create drizzle database instance
export const db = drizzle(pool, { schema });

// Export the pool for potential direct use
export { pool }; 