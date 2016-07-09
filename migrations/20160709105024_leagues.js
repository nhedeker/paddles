'use strict';
exports.up = function(knex) {
  return knex.schema.createTable('leagues', (table) => {
    table.increments();
    table.string('name').notNullable().defaultTo('');
    table.specificType('hashed_password', 'char(60)').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('leagues');
};
