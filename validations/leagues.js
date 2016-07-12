'use strict';

const Joi = require('joi');

module.exports.postLeague = {
  body: {
    leagueName: Joi.string()
      .label('League name')
      .required()
      .trim()
      .max(255),
    leaguePassword: Joi.string()
      .label('Password')
      .required()
      .trim()
      .min(8)
  }
};

module.exports.postPlayer = {
  body: {
    leagueName: Joi.string()
      .label('League name')
      .required()
      .trim()
      .max(255),
    leaguePassword: Joi.string()
      .label('League password')
      .required()
      .trim()
      .min(8),
    firstName: Joi.string()
      .label('First name')
      .required()
      .trim()
      .max(255),
    lastName: Joi.string()
      .label('Last name')
      .required()
      .trim()
      .max(255),
    playerEmail: Joi.string()
      .label('Email')
      .required()
      .email()
      .trim(),
    playerPassword: Joi.string()
      .label('Player password')
      .required()
      .trim()
      .min(8)
  }
};

module.exports.postGame = {
  body: {
    team1P1Id: Joi.number()
      .label('Team 1 Player 1')
      .required()
      .integer(),
    team1P2Id: Joi.number()
      .label('Team 1 Player 2')
      .integer(),
    team2P1Id: Joi.number()
      .label('Team 2 Player 1')
      .required()
      .integer(),
    team2P2Id: Joi.number()
      .label('Team 2 Player 2')
      .integer(),
    team1Score: Joi.number()
      .label('Team 1 Score')
      .required()
      .integer(),
    team2Score: Joi.number()
      .label('Team 2 Score')
      .required()
      .integer(),
  }
};
