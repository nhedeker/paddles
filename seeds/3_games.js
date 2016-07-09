'use strict';

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('games').del()
    .then(function () {
      return knex('games').insert([
        {
          id: 1,
          team1_p1_id: 1,
          team1_p2_id: 2,
          team2_p1_id: 3,
          team2_p2_id: 4,
          team1_score: 7,
          team2_score: 11
        },
        {
          id: 2,
          team1_p1_id: 1,
          team2_p1_id: 3,
          team1_score: 13,
          team2_score: 11
        }
      ]);
    })
    .then(() => {
      return knex.raw(
        'SELECT setval("games_id_seq", (SELECT MAX(id) FROM games));'
      );
    });
};
