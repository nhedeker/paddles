/* eslint-disable camelcase, quote-props, lines-around-comment, max-lines */
'use strict';

const ev = require('express-validation');
const validations = require('../validations/leagues');
const bcrypt = require('bcrypt-as-promised');
const knex = require('../knex');
const request = require('request');
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const Elo = require('arpad');

const checkAuth = function(req, res, next) {
  if (!req.session.userId) {
    return res.sendStatus(401);
  }

  next();
};
const elo = new Elo();

// creates a new league
router.post('/league', ev(validations.postLeague), (req, res, next) => {
  const { leagueName, leaguePassword } = req.body;

  knex('leagues')
    .select(knex.raw('1=1'))
    .where('name', leagueName)
    .first()
    .then((nameRes) => {
      if (nameRes) {
        const err = new Error('League name already exists.');

        err.status(400);

        throw err;
      }

      return bcrypt.hash(leaguePassword, 12);
    })
    .then((hashedPass) =>
      knex('leagues')
        .insert({
          name: leagueName,
          hashed_password: hashedPass
        }, '*')
    )
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      next(err);
    });
});

// creates a new player(user) within a certain league
router.post('/league/player', ev(validations.postPlayer), (req, res, next) => {
  let leagueId;
  const {
    leagueName,
    leaguePassword,
    firstName,
    lastName,
    playerEmail,
    playerPassword
  } = req.body;

  knex('players')
    .select(knex.raw('1=1'))
    .where('email', playerEmail)
    .first()
    .then((emailRes) => {
      if (emailRes) {
        // ****** create new error
        return res
          .status(400)
          .set('Content-Type', 'text/plain')
          .send('Email already exists.');
      }

      return knex('leagues')
        .where('name', leagueName)
        .first()
        .then((leagueRes) => {
          if (!leagueRes) {
            const err = new Error('Invalid league name or password.');

            err.status = 401;

            throw err;
          }
          leagueId = leagueRes.id;

          return bcrypt.compare(leaguePassword, leagueRes.hashed_password);
        })
        .then(() => bcrypt.hash(playerPassword, 10))
        .then((hashedPass) =>
          knex('players')
            .insert({
              first_name: firstName,
              last_name: lastName,
              email: playerEmail.toLowerCase(),
              hashed_password: hashedPass,
              league_id: leagueId
            }, '*')
        )
        .then(() => {
          const options = {
            url: 'https://api.postmarkapp.com/email',
            method: 'POST',
            headers: {
              'X-Postmark-Server-Token': 'a7c49a8a-155d-4f7c-aaa4-9da07666aa19',
              'Accept': 'application/json'
            },
            json: {
              'From': 'paddles@kenmcgrady.com',
              'To': playerEmail,
              'Subject': 'Welcome to Paddles!',

              // eslint-disable-next-line max-len
              'HtmlBody': '<h3>Hello! Welcome to Paddles!</h3><br></br><p>Thank you for signing up! We hope you enjoy the site!</p><br></br><p>Sincerely,</p><p>The Paddles Team</p>',

              // eslint-disable-next-line max-len, no-useless-escape
              'TextBody': 'Hello! Welcome to Paddles!\Thank you for signing up! We hope you enjoy the site!\Sincerely,\The Paddles Team',
              'ReplyTo': 'paddles@kenmcgrady.com'
            }
          };

          // eslint-disable-next-line no-shadow
          request(options, (err, res, body) => {
            if (err) {
              // eslint-disable-next-line no-console
              console.error(err);
            }

            // eslint-disable-next-line no-console
            console.log('Response from Email: ', res.statusCode);

            // eslint-disable-next-line no-console
            console.log(body);
          });
          res.sendStatus(200);
        })
        .catch(bcrypt.MISMATCH_ERROR, () => {
          const err = new Error('Invalid league name or password.');

          err.status = 401;

          throw err;
        });
    })
    .catch((err) => {
      next(err);
    });
});

// creates a game within a certain league
// eslint-disable-next-line max-len
router.post('/league/game', checkAuth, ev(validations.postGame), (req, res, next) => {
  const {
    team1P1Id,
    team1P2Id,
    team2P1Id,
    team2P2Id,
    team1Score,
    team2Score
  } = req.body;

  const newGame = {
    team1_p1_id: team1P1Id,
    team2_p1_id: team2P1Id,
    team1_score: team1Score,
    team2_score: team2Score,
    league_id: req.session.leagueId
  };

// eslint-disable-next-line max-len
  if (team1P2Id && team2P2Id && !(team1P2Id === 'null' && team2P2Id === 'null')) {
    newGame.team1_p2_id = team1P2Id;
    newGame.team2_p2_id = team2P2Id;
  }

  let eloArray;

// eslint-disable-next-line max-len
  if (team1P2Id && team2P2Id && !(team1P2Id === 'null' && team2P2Id === 'null')) {
    eloArray = [
      team1P1Id,
      team1P2Id,
      team2P1Id,
      team2P2Id
    ];
  }
  else {
    eloArray = [
      team1P1Id,
      team2P1Id
    ];
  }

  knex('games')
    .insert(newGame, '*')
    .then(() =>
      knex('players')
      .whereIn('id', eloArray)
      // eslint-disable-next-line max-statements
      .then((players) => {
        const player1Elo = players.filter((player) =>
          player.id === team1P1Id)[0].elo;

        const player2Elo = players.filter((player) =>
          player.id === team2P1Id)[0].elo;
        let player1NewElo;
        let player2NewElo;
        let promiseList = [];

        if (players.length === 2) {
          if (team1Score > team2Score) {
            player1NewElo = Number.parseInt(
              elo.newRatingIfWon(player1Elo, player2Elo)
            );
            player2NewElo = Number.parseInt(
              elo.newRatingIfLost(player2Elo, player1Elo)
            );
          }
          else {
            player1NewElo = Number.parseInt(
              elo.newRatingIfLost(player1Elo, player2Elo)
            );
            player2NewElo = Number.parseInt(
              elo.newRatingIfWon(player2Elo, player1Elo)
            );
          }
          promiseList = [
            knex('players')
              .update('elo', player1NewElo)
              .where('id', team1P1Id),
            knex('players')
              .update('elo', player2NewElo)
              .where('id', team2P1Id)
          ];

          return promiseList;
        }
        let player12NewElo;
        let player22NewElo;
        const player12Elo = players.filter((player) =>
          player.id === team1P2Id)[0].elo;
        const player22Elo = players.filter((player) =>
          player.id === team2P2Id)[0].elo;

        const team1Avg = player1Elo + player12Elo / 2;
        const team2Avg = player2Elo + player22Elo / 2;

        if (team1Score > team2Score) {
          const team1NewAvg = elo.newRatingIfWon(team1Avg, team2Avg);
          const team2NewAvg = elo.newRatingIfLost(team2Avg, team1Avg);

          const team1Diff = team1NewAvg - team1Avg;
          const team2Diff = team2Avg - team2NewAvg;

          player1NewElo = Number.parseInt(player1Elo + team1Diff);
          player12NewElo = Number.parseInt(player12Elo + team1Diff);
          player2NewElo = Number.parseInt(player2Elo - team2Diff);
          player22NewElo = Number.parseInt(player22Elo - team2Diff);
        }
        else {
          const team1NewAvg = elo.newRatingIfLost(team1Avg, team2Avg);
          const team2NewAvg = elo.newRatingIfWon(team2Avg, team1Avg);

          const team1Diff = team1Avg - team1NewAvg;
          const team2Diff = team2NewAvg - team2Avg;

          player1NewElo = Number.parseInt(player1Elo - team1Diff);
          player12NewElo = Number.parseInt(player12Elo - team1Diff);
          player2NewElo = Number.parseInt(player2Elo + team2Diff);
          player22NewElo = Number.parseInt(player22Elo + team2Diff);
        }

        promiseList = [
          knex('players')
            .update('elo', player1NewElo)
            .where('id', team1P1Id),
          knex('players')
            .update('elo', player2NewElo)
            .where('id', team2P1Id),
          knex('players')
            .update('elo', player12NewElo)
            .where('id', team1P2Id),
          knex('players')
            .update('elo', player22NewElo)
            .where('id', team2P2Id)
        ];

        return promiseList;
      })
      .then((promises) =>
        Promise.all(promises)
          .then(() => {
            res.sendStatus(200);
          }))
    )
    .catch((err) => {
      next(err);
    });
});

// Returns name of the league
router.get('/league', checkAuth, (req, res, next) => {
  const leagueId = req.session.leagueId;

  knex('leagues')
    .select('name')
    .where('id', leagueId)
    .first()
    .then((league) => {
      res.status(200).send(league.name);
    })
    .catch((err) => {
      next(err);
    });
});

// returns all games ordered by game id within a certain league
router.get('/league/games', checkAuth, (req, res, next) => {
  const leagueId = req.session.leagueId;

  knex('games')
    .select('games.id',
    'p1.first_name AS t1p1_first_name',
    'p1.last_name AS t1p1_last_name',
    'p2.first_name AS t1p2_first_name',
    'p2.last_name AS t1p2_last_name',
    'p3.first_name AS t2p1_first_name',
    'p3.last_name AS t2p1_last_name',
    'p4.first_name AS t2p2_first_name',
    'p4.last_name AS t2p2_last_name',
    'games.team1_score',
    'games.team2_score')
    .innerJoin('players AS p1', 'team1_p1_id', 'p1.id')
    .leftJoin('players AS p2 ', 'team1_p2_id', 'p2.id')
    .innerJoin('players as p3', 'team2_p1_id', 'p3.id')
    .leftJoin('players as p4', 'team2_p2_id', 'p4.id')
    .where('games.league_id', leagueId)
    .orderBy('games.id', 'desc')
    .then((recentGames) => {
      res.status(200).send(recentGames);
    })
    .catch((err) => {
      next(err);
    });
});

// returns all players ordered by ELO score within a certain league
router.get('/league/players', checkAuth, (req, res, next) => {
  const leagueId = req.session.leagueId;

  knex('players')
    .select('players.id', 'first_name', 'last_name', 'elo')
    .where('league_id', leagueId)
    .orderBy('elo', 'desc')
    .then((rankings) => {
      res.status(200).send(rankings);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
