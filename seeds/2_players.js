/* eslint max-len: "off", camelcase: "off", arrow-body-style: "off" */

'use strict';

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('players').del()
    .then(() => {
      return knex('players').insert([
        {
          id: 6,
          first_name: 'Stanley',
          last_name: 'Paddles',
          email: 'stanley@paddles.net',
          league_id: 1,
          elo: 1500,
          hashed_password: '$2a$12$oUMS2tVk4HT3MX5L5f31oOJHzyOgKwShyeXXKw.5cvNJC.TjZ3XI.'
        },
        {
          id: 2,
          first_name: 'Natasha',
          last_name: 'Hedeker',
          email: 'natasha.hedeker@gmail.com',
          league_id: 1,
          elo: 1500,
          hashed_password: '$2a$12$1PHIAtu8zZM5AGfoq7Fve.1RMuSJDXfbBevOn5KZb3wo.UM6Kk58u'
        },
        {
          id: 3,
          first_name: 'William',
          last_name: 'Knight',
          email: 'whkdev@gmail.com',
          league_id: 1,
          elo: 1500,
          hashed_password: '$2a$12$1I17vFBUt/rlOkXyinYrPO5XTcnn.cIIjTm8JYErXJSVxGDAoawgq'
        },
        {
          id: 4,
          first_name: 'Bryan',
          last_name: 'Brophy',
          email: 'brybrophy@gmail.com',
          league_id: 1,
          elo: 1500,
          hashed_password: '$2a$12$qXsjqAKeBvnJ/1xYJJbX2Ol2nYGiG5zgT.flcktEzcAhs.B8kfgvW'
        },
        {
          id: 5,
          first_name: 'John',
          last_name: 'Carney',
          email: 'jcarney000@gmail.com',
          league_id: 1,
          elo: 1500,
          hashed_password: '$2a$12$6Mv9uDTg8XdGlKugALOnIOQJQY7HqNmMJllDSC5ssp2R6.kHUcnhG'
        },
        {
          id: 1,
          first_name: 'Ian',
          last_name: 'Smith',
          email: 'iansmith1026@gmail.com',
          league_id: 1,
          elo: 1500,
          hashed_password: '$2a$12$RfiWveNecoNRXN81p72Ae..5Ga.PmjX3IRNJjzlQp.KrrzBvvcpzu'
        }
      ]);
    })
    .then(() => {
      return knex.raw(
        "SELECT setval('players_id_seq', (SELECT MAX(id) FROM players));"
      );
    });
};
