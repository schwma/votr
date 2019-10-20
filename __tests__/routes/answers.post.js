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

describe('POST /api/answers/:question_id', function() {
  beforeEach(function() {
    return db.sequelize.sync().then(function() {
      return Promise.all([
        db.question.destroy({where: {}}),
        db.answer.destroy({where: {}}),
        db.vote.destroy({where: {}}),
      ]);
    });
  });

  it('should create an answer', function(done) {
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

    request(app)
      .post('/api/answers/' + questionId)
      .send({token: token, text: answerText})
      .end(function(err, res) {
        expect(res.status).toEqual(201);
        expect(res.body).toEqual({id: expect.any(String)});
        expect(res.body.id.length).toEqual(config.answerIdLength);

        models.answer
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
            done();
          });
      });
  });

  it('should fail to create an answer (missing text parameter)', function(done) {
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

    request(app)
      .post('/api/answers/' + questionId)
      .send({token: token})
      .end(function(err, res) {
        expect(res.status).toEqual(400);
        expect(res.body).toEqual(errors.MISSING_ARGUMENT_TEXT);

        models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).toEqual(0);
            done();
          });
      });
  });

  it('should fail to create an answer (missing argument token)', function(done) {
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

    request(app)
      .post('/api/answers/' + questionId)
      .send({text: answerText})
      .end(function(err, res) {
        expect(res.status).toEqual(400);
        expect(res.body).toEqual(errors.MISSING_ARGUMENT_TOKEN);

        models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).toEqual(0);
            done();
          });
      });
  });

  it('should fail to create an answer (incorrect token)', function(done) {
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

    request(app)
      .post('/api/answers/' + questionId)
      .send({token: 'incorrect-token', text: answerText})
      .end(function(err, res) {
        expect(res.status).toEqual(401);
        expect(res.body).toEqual(errors.UNAUTHORIZED_ANSWER_CREATE);

        models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).toEqual(0);
            done();
          });
      });
  });

  it('should fail to create an answer (does not exist)', function(done) {
    let questionId = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let answerText = faker.lorem.sentence();

    request(app)
      .post('/api/answers/' + questionId)
      .send({token: token, text: answerText})
      .end(function(err, res) {
        expect(res.status).toEqual(404);
        expect(res.body).toEqual(errors.DOES_NOT_EXIST_QUESTION);

        models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).toEqual(0);
            done();
          });
      });
  });
});
