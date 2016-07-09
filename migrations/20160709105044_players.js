'use strict';
exports.up = function(knex) {
  return knex.schema.createTable('players', (table) => {
    table.increments();
    table.string('first_name').notNullable().defaultTo('');
    table.string('last_name').notNullable().defaultTo('');
    table.string('email').unique();
    table.specificType('hashed_password', 'char(60)');
    table.integer('elo').defaultTo(1500);
    table.integer('league_id')
      .notNullable()
      .references('id')
      .inTable('leagues')
      .onDelete('CASCADE')
      .index();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('players');
};
