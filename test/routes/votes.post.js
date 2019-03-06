'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;
const models = require('./../../src/models');

const request = require('supertest');
const chai = require('chai');
const crypto = require('crypto-extra');
const faker = require('faker');

const config = require(__dirname + '/../../config/votr.json');
const expect = chai.expect;

const errorEnabled = 'Voting is not enabled for this question';
const errorNotFoundQuestion = 'The question with the requested ID does not exist';
const errorNotFoundAnswer = 'The answer with the requested ID does not exist';

describe('POST /api/votes/:question_id/:answer_id', function() {
  before(function() {
    return db.sequelize.sync().then(function() {
      return Promise.all([
        db.question.destroy({where: {}}),
        db.answer.destroy({where: {}}),
        db.vote.destroy({where: {}}),
      ]);
    });
  });

  it('should create a vote', function(done) {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let questionText = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = true;
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: questionId,
      text: questionText,
      creationDate: date,
      enabled: enabled,
      token: token,
    };

    let answerId = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);
    let answerText = faker.lorem.sentence();

    let answer = {
      questionId: questionId,
      id: answerId,
      text: answerText,
    };

    Promise.all([db.question.create(question), db.answer.create(answer)]);

    request(app)
      .post('/api/votes/' + questionId + '/' + answerId)
      .end(function(err, res) {
        expect(res.status).to.equal(204);
        expect(res.text).to.be.empty;

        models.vote
          .count({
            include: [
              {
                model: models.answer,
                as: 'answer',
                where: {id: answerId},
                include: [{model: models.question, as: 'question', where: {id: questionId}}],
              },
            ],
          })
          .then((vote) => {
            expect(vote).to.equal(1);
            done();
          });
      });
  });

  it('should fail to create a vote (enabled == false)', function(done) {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let questionText = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = false;
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: questionId,
      text: questionText,
      creationDate: date,
      enabled: enabled,
      token: token,
    };

    let answerId = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);
    let answerText = faker.lorem.sentence();

    let answer = {
      questionId: questionId,
      id: answerId,
      text: answerText,
    };

    Promise.all([db.question.create(question), db.answer.create(answer)]);

    request(app)
      .post('/api/votes/' + questionId + '/' + answerId)
      .end(function(err, res) {
        expect(res.status).to.equal(401);
        expect(res.body.error).to.equal(errorEnabled);

        models.vote
          .count({
            include: [
              {
                model: models.answer,
                as: 'answer',
                where: {id: answerId},
                include: [{model: models.question, as: 'question', where: {id: questionId}}],
              },
            ],
          })
          .then((vote) => {
            expect(vote).to.equal(0);
            done();
          });
      });
  });

  it('should fail to create a vote (question does not exist)', function(done) {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);

    let answerId = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);

    request(app)
      .post('/api/votes/' + questionId + '/' + answerId)
      .end(function(err, res) {
        expect(res.status).to.equal(404);
        expect(res.body.error).to.equal(errorNotFoundQuestion);

        models.vote
          .count({
            include: [
              {
                model: models.answer,
                as: 'answer',
                where: {id: answerId},
                include: [{model: models.question, as: 'question', where: {id: questionId}}],
              },
            ],
          })
          .then((vote) => {
            expect(vote).to.equal(0);
            done();
          });
      });
  });

  it('should fail to create a vote (answer does not exist)', function(done) {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let questionText = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = false;
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: questionId,
      text: questionText,
      creationDate: date,
      enabled: enabled,
      token: token,
    };

    let answerId = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);

    Promise.all([db.question.create(question)]);

    request(app)
      .post('/api/votes/' + questionId + '/' + answerId)
      .end(function(err, res) {
        expect(res.status).to.equal(404);
        expect(res.body.error).to.equal(errorNotFoundAnswer);

        models.vote
          .count({
            include: [
              {
                model: models.answer,
                as: 'answer',
                where: {id: answerId},
                include: [{model: models.question, as: 'question', where: {id: questionId}}],
              },
            ],
          })
          .then((vote) => {
            expect(vote).to.equal(0);
            done();
          });
      });
  });
});
