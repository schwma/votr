'use strict';

const models = require('../models');
const crypto = require('crypto-extra');

const base36 = 'abcdefghijklmnopqrstuvwxyz0123456789';

module.exports = {
  create(req, res) {
    let question_id = req.params.question_id;
    let answer_id = req.params.answer_id;

    models.answer
      .findOne({
        where: {
          questionId: question_id,
          id: answer_id,
        },
      })
      .then((answer) => {
        answer.getQuestion().then((question) => {
          if (question.enabled) {
            models.sequelize
              .transaction(function(t) {
                return models.vote.create({}, {transaction: t}).then((voteRecord) => {
                  return answer.addVote(voteRecord, {transaction: t});
                });
              })
              .then(function(result) {
                res.send('ok');
              })
              .catch(function(err) {
                res.send(err);
              });
          } else {
            res.send('Question is not enabled!');
          }
        });
      })
      .catch(function(err) {
        res.send(err);
      });
  },
};
