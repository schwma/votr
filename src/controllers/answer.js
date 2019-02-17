'use strict';

const models = require('../models');
const crypto = require('crypto-extra');

const config = require(__dirname + '/../../config/votr.json');

module.exports = {
  create(req, res) {
    let question_id = req.params.question_id;
    let answer_id = crypto.randomString(config.answerIdAlphabet, config.answerIdAlphabet);
    let text = req.body.text;
    let token = req.body.token;

    let answer = {
      id: answer_id,
      text: text,
    };

    models.question
      .findOne({
        where: {
          id: question_id,
          token: token,
        },
      })
      .then((question) => {
        models.sequelize
          .transaction(function(t) {
            return models.answer.create(answer, {transaction: t}).then((answerRecord) => {
              return question.addAnswer(answerRecord, {transaction: t});
            });
          })
          .then(function(result) {
            res.json(answer);
          })
          .catch(function(err) {
            res.send(err);
          });
      })
      .catch(function(err) {
        res.send(err);
      });
  },
};
