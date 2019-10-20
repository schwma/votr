'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;
const models = require('./../../src/models');

const request = require('supertest');
const crypto = require('crypto-extra');
const faker = require('faker');
faker.seed(6);

const config = require(__dirname + '/../../config/votr.json');

const errors = require('./../../src/helpers/errors');

describe('POST /api/votes/:question_id/:answer_id', () => {
  beforeEach(async () => {
    await db.sequelize.sync({force: true});
  });

  it('should create a vote', () => {
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

    return request(app)
      .post('/api/votes/' + questionId + '/' + answerId)
      .then(function(res) {
        expect(res.status).toEqual(204);
        expect(res.text).toEqual('');

        return models.vote
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
            expect(vote).toEqual(1);
          });
      });
  });

  it('should fail to create a vote (enabled == false)', () => {
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

    return request(app)
      .post('/api/votes/' + questionId + '/' + answerId)
      .then(function(res) {
        expect(res.status).toEqual(401);
        expect(res.body).toEqual(errors.NOT_ENABLED_VOTING);

        return models.vote
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
            expect(vote).toEqual(0);
          });
      });
  });

  it('should fail to create a vote (question does not exist)', () => {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);

    let answerId = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);

    return request(app)
      .post('/api/votes/' + questionId + '/' + answerId)
      .then(function(res) {
        expect(res.status).toEqual(404);
        expect(res.body).toEqual(errors.DOES_NOT_EXIST_QUESTION);

        return models.vote
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
            expect(vote).toEqual(0);
          });
      });
  });

  it('should fail to create a vote (answer does not exist)', () => {
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

    return request(app)
      .post('/api/votes/' + questionId + '/' + answerId)
      .then(function(res) {
        expect(res.status).toEqual(404);
        expect(res.body).toEqual(errors.DOES_NOT_EXIST_ANSWER);

        return models.vote
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
            expect(vote).toEqual(0);
          });
      });
  });
});
