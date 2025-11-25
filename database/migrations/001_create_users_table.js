/**
 * Migration: Create users table
 * This migration creates the users table for authentication
 */
export function up(knex) {
  return knex.schema.hasTable('users').then((exists) => {
    if (exists) {
      console.log('ℹ️  Users table already exists, skipping creation');
      return;
    }
    return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 255).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('role', 50).notNullable().defaultTo('user');
    table.text('refresh_token').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes for performance
    table.index('email', 'idx_users_email');
    table.index('username', 'idx_users_username');
    table.index('refresh_token', 'idx_users_refresh_token');
    });
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('users');
}

