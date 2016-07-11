'use strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ silent: true });
}

const express = require('express');
const path = require('path');
const port = process.env.PORT || 8000;

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const leagues = require('./routes/leagues');
const players = require('./routes/players');
const session = require('./routes/session');

const app = express();

app.disable('x-powered-by');

if (process.env.NODE_ENV !== 'test') {
  const morgan = require('morgan');

  app.use(morgan('short'));
}

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cookieSession({
  name: 'paddles',
  secret: process.env.SESSION_SECRET
}));

app.use(express.static(path.join('public')));

app.use(leagues);
app.use(players);
app.use(session);

app.use((_req, res) => {
  res.sendStatus(404);
});

// eslint-disable-next-line max-params
app.use((err, _req, res, _next) => {
  if (err.status) {
    if (err.message === 'validation error') {
      return res
        .status(err.status)
        .set('Content-Type', 'text/plain')
        .send(err.errors[0].messages[0]);
    }

    return res
      .status(err.status)
      .set('Content-Type', 'text/plain')
      .send(err.message);
  }

  // eslint-disable-next-line no-console
  console.error(err.stack);
  res.sendStatus(500);
});

app.listen(port, () => {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('Listening on port', port);
  }
});
