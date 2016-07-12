'use strict';

/* eslint-disable camelcase */

const knex = require('../knex');
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const ev = require('express-validation');
const validations = require('../validations/leagues');
const bcrypt = require('bcrypt-as-promised');

const checkAuth = function(req, res, next) {
  if (!req.session.userId) {
    return res.sendStatus(401);
  }

  next();
};

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
              email: playerEmail,
              hashed_password: hashedPass,
              league_id: leagueId
            }, '*')
        )
        .then(() => {
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

  if (team1P2Id && team2P2Id) {
    newGame.team1_p2_id = team1P2Id;
    newGame.team2_p2_id = team2P2Id;
  }

  knex('games')
    .insert(newGame, '*')
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/league/games', checkAuth, (req, res, next) => {
  const leagueId = req.session.leagueId;
  const leaderboard = {};

  knex('players')
    .select('first_name', 'last_name', 'elo')
    .where('league_id', leagueId)
    .orderBy('elo', 'desc')
    .then((rankings) => {
      leaderboard.rankings = rankings;
      const subquery = knex('games')
        .distinct('games.id')
        .orderBy('games.id', 'desc')
        .limit(2);

      return knex('games')
        .select(
          'games.id',
          'first_name',
          'last_name',
          'team1_score',
          'team2_score'
        )
        .innerJoin('players', 'players.league_id', 'games.league_id')
        .where('games.league_id', leagueId)
        .whereIn('games.id', subquery)
        .orderBy('games.id', 'desc');
    })
    .then((recentGames) => {
      leaderboard.recentGames = recentGames;
      res.status(200).send(leaderboard);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
