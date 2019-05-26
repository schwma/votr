'use strict';

const Promise = require('bluebird');

const models = require('../models');
const crypto = require('crypto-extra');

const config = require(__dirname + '/../../config/votr.json');

const errors = require('./../helpers/errors');

module.exports = {
  create(req, res) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = req.body.text;
    if (typeof req.body.text === 'undefined') {
      res.status(400).json(errors.MISSING_ARGUMENT_TEXT);
      return;
    }
    // "enabled" defaults to false if parameter isn't provided
    let enabled = false;
    if (typeof req.body.enabled !== 'undefined') {
      if (typeof req.body.enabled === 'boolean') {
        enabled = req.body.enabled;
      } else {
        res.status(422).json(errors.INVALID_VALUE_ENABLED);
        return;
      }
    }
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: id,
      text: text,
      enabled: enabled,
      token: token,
    };

    models.question.create(question).then(function(result) {
      let returnQuestion = {
        id: question.id,
        token: question.token,
      };

      res.status(201).json(returnQuestion);
    });
  },
  get(req, res) {
    let id = req.params.question_id;

    models.question
      .findOne({
        where: {
          id: id,
        },
        attributes: {
          exclude: ['token'],
        },
      })
      .then(function(question) {
        let questionPlain = question.get({plain: true});

        let answersPlain = [];
        question
          .getAnswers({
            attributes: {
              exclude: ['questionId'],
            },
          })
          .then((answers) => {
            let promises = [];

            for (let i = 0; i < answers.length; i++) {
              promises.push(
                new Promise((resolve, reject) => {
                  return answers[i].getVotes().then((votes) => {
                    let answerPlain = answers[i].get({plain: true});
                    answerPlain.votes = votes.length;
                    answersPlain.push(answerPlain);
                    resolve();
                  });
                })
              );
            }

            Promise.all(promises).then(function() {
              questionPlain.answers = answersPlain;
              res.status(200).json(questionPlain);
            });
          });
      })
      .catch(function(err) {
        res.status(404).json(errors.DOES_NOT_EXIST_QUESTION);
      });
  },
  put(req, res) {
    let id = req.params.question_id;
    let token = req.body.token;

    if (typeof req.body.token === 'undefined') {
      res.status(400).json(errors.MISSING_ARGUMENT_TOKEN);
      return;
    }

    models.question
      .findOne({
        where: {
          id: id,
        },
      })
      .then(function(question) {
        if (question.token !== token) {
          res.status(401).json(errors.UNAUTHORIZED_QUESTION_UPDATE);
          return;
        }

        if (typeof req.body.enabled !== 'undefined') {
          if (typeof req.body.enabled === 'boolean') {
            question.enabled = req.body.enabled;
          } else {
            res.status(422).json(errors.INVALID_VALUE_ENABLED);
            return;
          }
        }

        question.update(question, {fields: ['enabled']}).then(() => {
          res.status(204).send();
        });
      })
      .catch(function(err) {
        res.status(404).json(errors.DOES_NOT_EXIST_QUESTION);
      });
  },
  delete(req, res) {
    let id = req.params.question_id;
    let token = req.body.token;

    if (typeof req.body.token === 'undefined') {
      res.status(400).json(errors.MISSING_ARGUMENT_TOKEN);
      return;
    }

    models.question
      .findOne({
        where: {
          id: id,
        },
      })
      .then(function(question) {
        if (question.token !== token) {
          res.status(401).json(errors.UNAUTHORIZED_QUESTION_DELETE);
          return;
        }

        question.destroy().then(function() {
          res.status(204).send();
        });
      })
      .catch(function(err) {
        res.status(404).json(errors.DOES_NOT_EXIST_QUESTION);
      });
  },
};
