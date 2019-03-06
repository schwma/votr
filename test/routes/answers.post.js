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

const errorText = 'Missing argument: text';
const errorUnauthorized = 'Token is not authorized to delete this question';
const errorNotFound = 'The question with the requested ID does not exist';

describe('POST /api/answers/:question_id', function() {
  before(function() {
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
        expect(res.status).to.equal(201);
        expect(res.body).to.have.all.keys('id');
        expect(res.body.id.length).to.equal(config.answerIdLength);

        models.answer
          .findOne({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((answer) => {
            let answerPlain = answer.get({plain: true});
            expect(answerPlain.questionId).to.equal(questionId);
            expect(answerPlain.id).to.equal(res.body.id);
            expect(answerPlain.text).to.equal(answerText);
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

    let answerText = faker.lorem.sentence();

    request(app)
      .post('/api/answers/' + questionId)
      .send({token: token})
      .end(function(err, res) {
        expect(res.status).to.equal(400);
        expect(res.body).to.have.all.keys('error');
        expect(res.body.error).to.equal(errorText);

        models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).to.equal(0);
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
        expect(res.status).to.equal(401);
        expect(res.body).to.have.all.keys('error');
        expect(res.body.error).to.equal(errorUnauthorized);

        models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).to.equal(0);
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
        expect(res.status).to.equal(404);
        expect(res.body).to.have.all.keys('error');
        expect(res.body.error).to.equal(errorNotFound);

        models.answer
          .count({
            where: {id: res.body.id},
            include: [{model: models.question, as: 'question', where: {id: questionId}}],
          })
          .then((count) => {
            expect(count).to.equal(0);
            done();
          });
      });
  });
});
