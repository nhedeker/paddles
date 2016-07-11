'use strict';

const bcrypt = require('bcrypt');
const knex = require('../knex');
const ev = require('express-validation');
const validations = require('../validations/players');
const express = require('express');

// es-lint-disable-next-line new-cap
const router = express.Router();

const checkAuth = function(req, res, next) {
  if (!req.session.userId) {
    return res.sendStatus(401);
  }

  next();
};

const updatePlayer = function(userId, playerObj, req, res, next) {
  knex('players')
    .where('id', userId)
    .update(playerObj)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      next(err);
    });
};

router.patch('/player', checkAuth, ev(validations.post), (req, res, next) => {
  const { userId } = req.session;
  const playerEmail = req.body.playerEmail;
  const playerPassword = req.body.playerPassword;

  if(!playerEmail && !playerPassword) {
    const err = new Error('Please update a field');

    err.status = 400;

    return next(err);
  }

  const playerObj = {};

  if (playerEmail) {
    playerObj.email = playerEmail;
  }

  if (playerPassword) {
    bcrypt.hash(playerPassword, 12, (hashErr, hashedPassword) => {
      if (hashErr) {
        return next(hashErr);
      }

      playerObj.hashed_password = hashedPassword;

      updatePlayer(userId, playerObj, req, res, next);
    })
  }
  else {
    updatePlayer(userId, playerObj, req, res, next);
  }
});

router.delete('/player', checkAuth, (req, res, next) => {
  const { userId } = req.session;

  knex('players')
    .where('id', userId)
    .first()
    .then((player) => {
      if (!player) {
        const err = new Error('Something went seriously wrong in the delete player route handler!');

        return next(err);
      }

      knex('players')
        .where('id', userId)
        .update({email: null, hashed_password: null, elo: null})
        .then(() => {
          req.session.userId = null;
          req.session.leagueId = null;
          res.clearCookie('loggedIn');
          res.sendStatus(200);
        });
    })
    .catch((err) => {
      next(err);
    })
});

module.exports = router;
