'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/paddles_dev'
  },

  test: {
    client: 'pg',
    connection: 'postgres://localhost/paddles_test'
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
};
