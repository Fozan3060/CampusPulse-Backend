/**
 * Migration: Create feedback table
 * This migration creates the feedback table for user feedback submissions
 */
export function up(knex) {
  return knex.schema.hasTable('feedback').then((exists) => {
    if (exists) {
      console.log('ℹ️  Feedback table already exists, skipping creation');
      return;
    }
    return knex.schema.createTable('feedback', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable();
    table.integer('rating').notNullable().checkBetween([1, 5]);
    table.text('message').notNullable();
    table
      .integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes for performance
    table.index('email', 'idx_feedback_email');
    table.index('user_id', 'idx_feedback_user_id');
    table.index('created_at', 'idx_feedback_created_at');
    });
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('feedback');
}

