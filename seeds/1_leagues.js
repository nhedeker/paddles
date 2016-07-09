/* eslint max-len: "off", camelcase: "off", arrow-body-style: "off" */

'use strict';

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('leagues').del()
    .then(() => {
      return knex('leagues').insert([{
        id: 1,
        name: 'g28',
        hashed_password: '$2a$12$w72Eos8pU07S/j5p1pR3dO.fg0B5ui1C1YAmbvUrp6IZ76E3lR3Gm'
      }]);
    })
    .then(() => {
      return knex.raw(
        "SELECT setval('leagues_id_seq', (SELECT MAX(id) FROM leagues));"
      );
    });
};
