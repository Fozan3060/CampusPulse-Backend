import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Database connection pool
 * Uses PostgreSQL connection pool for query execution
 * 
 * Database schema is managed through migrations (see database/migrations/)
 * Run migrations with: npm run migrate
 */
const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export default pool;