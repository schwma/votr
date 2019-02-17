'use strict';

const Promise = require('bluebird');

const models = require('../models');
const crypto = require('crypto-extra');

const config = require(__dirname + '/../../config/votr.json');

module.exports = {
  create(req, res) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = req.body.text;
    // "enabled" defaults to false if parameter isn't provided
    let enabled = false;
    if (typeof req.body.enabled !== 'undefined') {
      enabled = req.body.enabled == 'true';
    }
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: id,
      text: text,
      enabled: enabled,
      token: token,
    };

    models.question
      .create(question)
      .then(function(result) {
        res.json(question);
      })
      .catch(function(err) {
        res.send(err);
      });
  },
  get(req, res) {
    let id = req.params.question_id;

    let questionPlain;

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
        questionPlain = question.get({plain: true});

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
              res.json(questionPlain);
            });
          });
      })
      .catch(function(err) {
        res.send(err);
      });
  },
  put(req, res) {
    let id = req.params.question_id;
    let token = req.body.token;

    let questionPlain;

    models.question
      .findOne({
        where: {
          id: id,
          token: token,
        },
      })
      .then(function(question) {
        questionPlain = question.get({plain: true});

        if (typeof req.body.enabled !== 'undefined') {
          questionPlain.enabled = req.body.enabled;
        }

        question.update(questionPlain, {fields: ['enabled']}).then(() => {
          res.send('ok');
        });
      })
      .catch(function(err) {
        res.send(err);
      });
  },
  delete(req, res) {
    let id = req.params.question_id;
    let token = req.body.token;

    models.question
      .findOne({
        where: {
          id: id,
          token: token,
        },
      })
      .then(function(question) {
        question
          .destroy()
          .then(function() {
            res.send('Question with id {' + id + '} was deleted!');
          })
          .catch(function(err) {
            res.send('Failed to delete question with id {' + id + '}!');
          });
      })
      .catch(function(err) {
        res.send('No entry was deleted!');
      });
  },
};
