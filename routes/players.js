/* eslint-disable camelcase */

'use strict';

const bcrypt = require('bcrypt');
const knex = require('../knex');
const ev = require('express-validation');
const validations = require('../validations/players');
const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

const checkAuth = function(req, res, next) {
  if (!req.session.userId) {
    return res.sendStatus(401);
  }

  next();
};

const updatePlayer = function({ userId, playerObj, _req, res, next }) {
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

router.get('/player', checkAuth, (req, res, next) => {
  const { userId } = req.session;

  knex('players')
    .select('first_name', 'last_name', 'email', 'elo')
    .where('id', userId)
    .first()
    .then((player) => {
      res.status(200).send(player);
    });
});

router.patch('/player/email', checkAuth, ev(validations.post), (req, res, next) => {
  const { userId } = req.session;
  const playerEmail = req.body.playerEmail.toLowerCase();

  if (!playerEmail) {
    const err = new Error('Please enter a password');

    err.status = 400;

    return next(err);
  }

  const playerObj = { email: playerEmail };

  knex('players')
    .where('email', playerEmail)
    .first()
    .then((exists) => {
      if (exists) {
        const err = new Error('Already have email in database');

        err.status = 400;

        return next(err);
      }

      updatePlayer({ userId, playerObj, req, res, next });
    })
    .catch((err) => {
      next(err);
    });
});

router.patch('/player/password', checkAuth, ev(validations.post), (req, res, next) => {
  const { userId } = req.session;
  const playerPassword = req.body.playerPassword;

  if (!playerPassword) {
    const err = new Error('Please enter a new password');

    err.status = 400;

    return next(err);
  }

  const playerObj = {};

  bcrypt.hash(playerPassword, 12, (hashErr, hashedPassword) => {
    if (hashErr) {
      return next(hashErr);
    }

    playerObj.hashed_password = hashedPassword;

    updatePlayer({ userId, playerObj, req, res, next });
  });
});

router.delete('/player', checkAuth, (req, res, next) => {
  const { userId } = req.session;

  knex('players')
    .where('id', userId)
    .first()
    .then((player) => {
      if (!player) {
        // eslint-disable-next-line max-len
        const err = new Error('Something went seriously wrong in the delete player route handler!');

        return next(err);
      }

      return knex('players')
        .where('id', userId)
        .update({ email: null, hashed_password: null, elo: null });
    })
    .then(() => {
      req.session.userId = null;
      req.session.leagueId = null;
      res.clearCookie('loggedIn');
      res.sendStatus(200);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
