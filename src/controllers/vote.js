'use strict';

const models = require('../models');

const errors = require('./../helpers/errors');

module.exports = {
  create(req, res) {
    let question_id = req.params.question_id;
    let answer_id = req.params.answer_id;

    models.question
      .count({
        where: {
          id: question_id,
        },
      })
      .then((count) => {
        // Check if a question with the provided question_id was found
        if (count < 1) {
          res.status(404).json(errors.DOES_NOT_EXIST_QUESTION);
        } else {
          // Find the answer with both the provided question_id and answer_id
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
                      res.status(204).send();
                    });
                } else {
                  res.status(401).json(errors.NOT_ENABLED_VOTING);
                }
              });
            })
            .catch(function(err) {
              res.status(404).json(errors.DOES_NOT_EXIST_ANSWER);
            });
        }
      });
  },
};
