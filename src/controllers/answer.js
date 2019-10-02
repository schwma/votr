'use strict';

const models = require('../models');
const crypto = require('crypto-extra');

const config = require(__dirname + '/../../config/votr.json');

const errors = require('./../../src/helpers/errors');

module.exports = {
  create(req, res) {
    let question_id = req.params.question_id;
    let answer_id = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);
    let text = req.body.text;
    let token = req.body.token;

    if (typeof req.body.text === 'undefined') {
      res.status(400).json(errors.MISSING_ARGUMENT_TEXT);
      return;
    }

    if (typeof req.body.token === 'undefined') {
      res.status(400).json(errors.MISSING_ARGUMENT_TOKEN);
      return;
    }

    let answer = {
      id: answer_id,
      text: text,
    };

    models.question
      .findOne({
        where: {
          id: question_id,
        },
      })
      .then((question) => {
        if (question.token !== token) {
          res.status(401).json(errors.UNAUTHORIZED_ANSWER_CREATE);
          return;
        }

        models.sequelize
          .transaction(function(t) {
            return models.answer.create(answer, {transaction: t}).then((answerRecord) => {
              return question.addAnswer(answerRecord, {transaction: t});
            });
          })
          .then(function(result) {
            let returnAnswer = {id: answer_id};
            res.status(201).json(returnAnswer);
          });
      })
      .catch(function(err) {
        res.status(404).json(errors.DOES_NOT_EXIST_QUESTION);
      });
  },
};
