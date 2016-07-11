'use strict';

// todo: leaderboard display

const knex = require('../knex');
const express = require('express');
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

router.post('/league', ev(validations.postLeague), (req, res, next) =>{
  const {name, password} = req.body;

  knex('leagues')
    .select(knex.raw('1=1'))
    .where('name', name)
    .first()
    .then((nameRes) => {
      if (nameRes) {
        const err = new Error('League name already exists.');
        err.status(400);

        throw err;
      }

      return bcrypt.hash(password, 10)
    })
    .then((hashedPass) => {
      return knex('leagues')
        .insert({
          name: name,
          hashed_password: hashedPass
        }, '*')
    })
    .then((user) => {
      res.sendStatus(200)
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/league/player', ev(validations.postPlayer), (req, res, next) => {
  let leagueId;
  const { name, leaguePassword, firstName, lastName, playerEmail, playerPassword  } = req.body;

  knex('players')
    .select(knex.raw('1=1'))
    .where('email', playerEmail)
    .first()
    .then((emailRes) => {
      if (emailRes) {
        return res
          .status(400)
          .set('Content-Type', 'text/plain')
          .send('Email already exists.')
      }
      return knex('leagues')
        .where('name', name)
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
        .then(() => {
          return bcrypt.hash(playerPassword, 10);
        })
        .then((hashedPass) => {
          return knex('players')
            .insert({
              first_name: firstName,
              last_name: lastName,
              email: playerEmail,
              hashed_password: hashedPass,
              league_id: leagueId
            }, '*')
        })
        .then((user) => {
          res.sendStatus(200);
        })
        .catch(bcrypt.MISMATCH_ERROR, () => {
          const err = new Error('Invalid league name or password.')
          err.status = 401;

          throw err;
        })
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

router.post('/league/game', ev(validations.postGame), (req, res, next) => {
  const { team1P1Id, team1P2Id, team2P1Id, team2P2Id, team1Score, team2Score } = req.body;

  let newGame = {
    team1_p1_id: team1P1Id,
    team2_p1_id: team2P1Id,
    team1_score: team1Score,
    team2_score: team2Score,
    league_id: req.session.id
  };

  if (team1P2Id && team2P2Id) {
    newGame.team1_p2_id = team1P2Id;
    newGame.team2_p2_id = team2P2Id;
  }

  knex('games')
    .insert(newGame, '*')
    .then((game) => {
      res.sendStatus(200)
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
