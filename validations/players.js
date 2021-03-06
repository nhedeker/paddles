'use strict';

const Joi = require('joi');

module.exports.patch = {
  body: {
    playerEmail: Joi.string()
      .label('Email')
      .email()
      .optional()
      .trim(),
    playerPassword: Joi.string()
      .label('Password')
      .min(8)
      .optional()
      .trim()
  }
};
