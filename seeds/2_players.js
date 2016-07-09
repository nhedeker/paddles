/* eslint max-len: "off", camelcase: "off", arrow-body-style: "off" */

'use strict';

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('players').del()
    .then(() => {
      return knex('players').insert([
        {
          id: 1,
          first_name: 'Stanley',
          last_name: 'Paddles',
          email: 'Stanley@Paddles.net',
          league_id: 1,
          elo: 2000,
          hashed_password: '$2a$12$oUMS2tVk4HT3MX5L5f31oOJHzyOgKwShyeXXKw.5cvNJC.TjZ3XI.'
        },
        {
          id: 2,
          first_name: 'Joanna',
          last_name: 'Rowling',
          email: 'jk@pottermore.net',
          league_id: 1,
          elo: 1500,
          hashed_password: '$2a$12$3R36EGpeATvLBx6aDTkR6OOPCqNuuLEBSK6v/8/HZzNwKgQyuXNOq'
        },
        {
          id: 3,
          first_name: 'Ash',
          last_name: 'Ketcham',
          email: 'AKetcham@catchthemall.net',
          league_id: 1,
          elo: 1300,
          hashed_password: '$2a$12$P.5FtBcaDya4sqL6rVok3ONnSSE/hRqRyq2R.Ge/wMunWoxPi.Vwe'
        },
        {
          id: 4,
          first_name: 'Elsa',
          last_name: 'Arnedale',
          email: 'elsa@letitgo.net',
          league_id: 1,
          elo: 1600,
          hashed_password: '$2a$12$4ySBFqf9.rNL45eHW9XIbOVGc.m/GNdrPTLL655.vZO2NoGCmAltG'
        }
      ])
    })
    .then(() => {
      return knex.raw(
        "SELECT setval('players_id_seq', (SELECT MAX(id) FROM players));"
      );
    });
};
