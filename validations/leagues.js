'use strict';

const Joi = require('joi');

module.exports.postLeague = {
  body: {
    leagueName: Joi.string()
      .label('League name')
      .required()
      .trim()
      .max(255)
      .error(new Error('Invalid league name.')),
    leaguePassword: Joi.string()
      .label('Password')
      .required()
      .trim()
      .min(8)
      .error(new Error('Invalid password.'))
  }
};

module.exports.postPlayer = {
  body: {
    leagueName: Joi.string()
      .label('League name')
      .required()
      .trim()
      .max(255)
      .error(new Error('Invalid league name.')),
    leaguePassword: Joi.string()
      .label('League password')
      .required()
      .trim()
      .min(8)
      .error(new Error('Invalid league password.')),
    firstName: Joi.string()
      .label('First name')
      .required()
      .trim()
      .max(255)
      .error(new Error('Invalid first name.')),
    lastName: Joi.string()
      .label('Last name')
      .required()
      .trim()
      .max(255)
      .error(new Error('Invalid last name.')),
    playerEmail: Joi.string()
      .label('Email')
      .required()
      .email()
      .trim()
      .error(new Error('Invalid email.')),
    playerPassword: Joi.string()
      .label('Player password')
      .required()
      .trim()
      .min(8)
      .error(new Error('Invalid player password.'))
  }
};

module.exports.postGame = {
  body: {
    team1P1Id: Joi.number()
      .label('Team 1 Player 1')
      .integer()
      .required()
      .error(new Error('Team 1\'s player 1 is invalid.')),
    team1P2Id: Joi.number().allow(null).allow('null')
      .label('Team 1 Player 2')
      .integer()
      .error(new Error('Team 1\'s player 2 is invalid.')),
    team2P1Id: Joi.number()
      .label('Team 2 Player 1')
      .integer()
      .required()
      .error(new Error('Team 2\'s player 1 is invalid.')),
    team2P2Id: Joi.number().allow(null).allow('null')
      .label('Team 2 Player 2')
      .integer()
      .error(new Error('Team 2\'s player 2 is invalid.')),
    team1Score: Joi.number()
      .label('Team 1 Score')
      .required()
      .integer()
      .error(new Error('Invalid team 1 score.')),
    team2Score: Joi.number()
      .label('Team 2 Score')
      .required()
      .integer()
      .error(new Error('Invalid team 2 score.'))
  }
};
