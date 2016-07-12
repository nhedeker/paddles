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
    })
});

// returns all games ordered by game id within a certain league
router.get('/league/games', checkAuth, (req, res, next) => {
  const leagueId = req.session.leagueId;

  knex('games')
    .select('games.id', 'p1.first_name AS t1p1_first_name', 'p1.last_name AS t1p1_last_name', 'p2.first_name AS t1p2_first_name', 'p2.last_name AS t1p2_last_name', 'p3.first_name AS t2p1_first_name', 'p3.last_name AS t2p1_last_name', 'p4.first_name AS t2p2_first_name', 'p4.last_name AS t2p2_last_name', 'games.team1_score', 'games.team2_score')
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

//returns all players ordered by ELO score within a certain league
router.get('/league/players', checkAuth, (req, res, next) => {
  const leagueId = req.session.leagueId;

  knex('players')
    .select('first_name', 'last_name', 'elo')
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
