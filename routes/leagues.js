'use strict';

const knex = require('../knex');
const express = require('express');
const router = express.Router();
const ev = require('express-validation');
const bcrypt = require('bcrypt-as-promised')

router.post('/league', (req, res, next) =>{
  const newLeague = req.body;

  knex('leagues')
    .select(knex.raw('1=1'))
    .where('name', newLeague.name)
    .first()
    .then((nameRes) => {
      if (nameRes) {
        return res
          .status(400)
          .set('Content-Type', 'text/plain')
          .send('League name already exists.')
      }

      return bcrypt.hash(newLeague.password, 10)
    })
    .then((hashedPass) => {
      return knex('leagues')
        .insert({
          name: newLeague.name,
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

router.post('/league/player', (req, res, next) => {
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
      next(err);
    })
});



module.exports = router;
