'use strict';

const environment = process.env.NODE_ENV || 'development';
const knexconfig = require('./knexfile')[environment];
const knex = require('knex')(knexconfig);

module.exports = knex;
