'use strict';
exports.up = function(knex) {
  return knex.schema.createTable('games', (table) => {
    table.increments();
    table.integer('team1_p1_id')
      .references('id')
      .inTable('players')
      .defaultTo('Unknown Player')
      .notNullable()
      .onDelete('UPDATE');
    table.integer('team1_p2_id')
      .references('id')
      .inTable('players')
      .defaultTo('Unknown Player')
      .notNullable()
      .onDelete('UPDATE');
    table.integer('team2_p1_id')
      .references('id')
      .inTable('players')
      .defaultTo('Unknown Player')
      .notNullable()
      .onDelete('UPDATE');
    table.integer('team2_p2_id')
      .references('id')
      .inTable('players')
      .defaultTo('Unknown Player')
      .notNullable()
      .onDelete('UPDATE');
    table.integer('team1_score').notNullable().defaultTo(0);
    table.integer('team2_score').notNullable().defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('games');
};
