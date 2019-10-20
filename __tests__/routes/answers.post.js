'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;
const models = require('./../../src/models');

const request = require('supertest');
const crypto = require('crypto-extra');
const faker = require('faker');
faker.seed(5);

const config = require(__dirname + '/../../config/votr.json');

const errors = require('./../../src/helpers/errors');

describe('POST /api/answers/:question_id', () => {
  beforeEach(async () => {
    await db.sequelize.sync({force: true});
  });

  it('should create an answer', () => {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let questionText = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: questionId,
      text: questionText,
      creationDate: date,
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    let answerText = faker.lorem.sentence();

    return request(app)
      .post('/api/answers/' + questionId)
      .send({token: token, text: answerText})
      .then(function(res) {
        expect(res.status).toEqual(201);
        expect(res.body).toEqual({id: expect.any(String)});
        expect(res.body.id.length).toEqual(config.answerIdLength);

        return models.answer
          .findOne({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((answer) => {
            let answerPlain = answer.get({plain: true});
            expect(answerPlain).toEqual({
              question: expect.any(Object),
              questionId: questionId,
              id: res.body.id,
              text: answerText,
            });
          });
      });
  });

  it('should fail to create an answer (missing text parameter)', () => {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let questionText = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: questionId,
      text: questionText,
      creationDate: date,
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    return request(app)
      .post('/api/answers/' + questionId)
      .send({token: token})
      .then(function(res) {
        expect(res.status).toEqual(400);
        expect(res.body).toEqual(errors.MISSING_ARGUMENT_TEXT);

        return models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).toEqual(0);
          });
      });
  });

  it('should fail to create an answer (missing argument token)', () => {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let questionText = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: questionId,
      text: questionText,
      creationDate: date,
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    let answerText = faker.lorem.sentence();

    return request(app)
      .post('/api/answers/' + questionId)
      .send({text: answerText})
      .then(function(res) {
        expect(res.status).toEqual(400);
        expect(res.body).toEqual(errors.MISSING_ARGUMENT_TOKEN);

        return models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).toEqual(0);
          });
      });
  });

  it('should fail to create an answer (incorrect token)', () => {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let questionText = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: questionId,
      text: questionText,
      creationDate: date,
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    let answerText = faker.lorem.sentence();

    return request(app)
      .post('/api/answers/' + questionId)
      .send({token: 'incorrect-token', text: answerText})
      .then(function(res) {
        expect(res.status).toEqual(401);
        expect(res.body).toEqual(errors.UNAUTHORIZED_ANSWER_CREATE);

        return models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).toEqual(0);
          });
      });
  });

  it('should fail to create an answer (does not exist)', () => {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let answerText = faker.lorem.sentence();

    return request(app)
      .post('/api/answers/' + questionId)
      .send({token: token, text: answerText})
      .then(function(res) {
        expect(res.status).toEqual(404);
        expect(res.body).toEqual(errors.DOES_NOT_EXIST_QUESTION);

        return models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).toEqual(0);
          });
      });
  });
});
