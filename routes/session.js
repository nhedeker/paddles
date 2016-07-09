'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');

router.post('/session', (req, res, next) => {
  const { email, password } = req.body;

  if (!username || username.trim() === '') {
    const err = new Error('Email must not be blank');
    err.status = 400;

    return next(err);
  }

  if (!password || password.trim() === '') {
    const err = new Error('Password must not be blank');
    err.status = 400;

    return next(err);
  }

  knex('players')
    .where('email', email)
    .first()
    .then((player) => {
      if (!player) {
        const err = new Error('Unauthorized');
        err.status = 401;

        throw err;
      }

      const hashed_password = player.hashed_password

      return bcrypt.compare(password, hashed_password, (err, isMatch) => {
        if (err) {
          throw err;
        }

        if (!isMatch) {
          const err = new Error('Unauthorized');
          err.status = 401;

          throw err;
        }

        req.session.userId = player.id;
        res.sendStatus(200);
      });
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/session', (req, res, next) => {
  delete req.session.userId;
  res.clearCookie('loggedIn');
  res.sendStatus(200);
});

module.exports = router;
