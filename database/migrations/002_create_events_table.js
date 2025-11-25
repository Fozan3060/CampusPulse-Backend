/**
 * Migration: Create events table
 * This migration creates the events table for campus events
 */
export function up(knex) {
  return knex.schema.hasTable('events').then((exists) => {
    if (exists) {
      console.log('ℹ️  Events table already exists, skipping creation');
      return;
    }
    return knex.schema.createTable('events', (table) => {
    table.increments('id').primary();
    table.string('event_name', 255).notNullable();
    table.string('category', 100).notNullable();
    table.string('date', 100).notNullable();
    table.string('time', 100).notNullable();
    table.string('location', 255).notNullable();
    table.string('organizer', 255).notNullable();
    table.text('description').nullable();
    table.string('image', 500).nullable();
    table.string('deadline', 100).nullable();
    table
      .integer('created_by')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes for performance
    table.index('category', 'idx_events_category');
    table.index('created_by', 'idx_events_created_by');
    table.index('created_at', 'idx_events_created_at');
    });
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('events');
}

