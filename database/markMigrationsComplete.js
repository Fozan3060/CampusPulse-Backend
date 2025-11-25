/**
 * Mark existing migrations as complete
 * Use this if you already have tables created manually
 * This will mark the migrations as run without executing them
 */
import knex from 'knex';
import config from '../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

async function markMigrationsComplete() {
  try {
    console.log('📝 Marking migrations as complete...');
    console.log(`   Environment: ${environment}`);
    console.log(`   Database: ${config[environment].connection.database}`);
    
    // Check if migrations table exists, create if not
    const hasTable = await db.schema.hasTable('knex_migrations');
    if (!hasTable) {
      await db.migrate.latest();
      console.log('✅ Created migrations table');
    }
    
    // Get list of migration files
    const migrationFiles = [
      '001_create_users_table.js',
      '002_create_events_table.js',
      '003_create_feedback_table.js'
    ];
    
    // Check which migrations are already recorded
    const completed = await db('knex_migrations').select('name');
    const completedNames = completed.map(m => m.name);
    
    // Insert missing migrations as already completed
    for (const file of migrationFiles) {
      if (!completedNames.includes(file)) {
        await db('knex_migrations').insert({
          name: file,
          batch: 1,
          migration_time: new Date()
        });
        console.log(`✅ Marked ${file} as complete`);
      } else {
        console.log(`ℹ️  ${file} already marked as complete`);
      }
    }
    
    console.log('✨ All migrations marked as complete!');
    console.log('💡 If tables are missing, they will be created on next migration run');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

markMigrationsComplete();

