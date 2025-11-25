/**
 * Run database migrations
 * This script runs all pending migrations to set up the database schema
 */
import knex from 'knex';
import config from '../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    console.log(`   Environment: ${environment}`);
    console.log(`   Database: ${config[environment].connection.database}`);
    
    await db.migrate.latest();
    
    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();

