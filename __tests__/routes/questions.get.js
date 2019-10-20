'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;

const request = require('supertest');
const crypto = require('crypto-extra');
const faker = require('faker');

const config = require(__dirname + '/../../config/votr.json');

const errors = require('./../../src/helpers/errors');

describe('GET /api/questions/:question_id', function() {
  beforeEach(function() {
    return db.sequelize.sync().then(function() {
      return Promise.all([
        db.question.destroy({where: {}}),
        db.answer.destroy({where: {}}),
        db.vote.destroy({where: {}}),
      ]);
    });
  });

  it("should get a question's details (without answers)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    request(app)
      .get('/api/questions/' + id)
      .end(function(err, res) {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
          id: id,
          text: text,
          creationDate: date,
          enabled: enabled,
          answers: [],
        });
        done();
      });
  });

  it("should get a question's details (with one answer)", function(done) {
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

    let answerId = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);
    let answerText = faker.lorem.sentence();

    let answer = {
      questionId: questionId,
      id: answerId,
      text: answerText,
    };

    Promise.all([db.question.create(question), db.answer.create(answer)]);

    request(app)
      .get('/api/questions/' + questionId)
      .end(function(err, res) {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
          id: questionId,
          text: questionText,
          creationDate: date,
          enabled,
          enabled,
          answers: [{id: answerId, text: answerText, votes: 0}],
        });
        done();
      });
  });

  it("should get a question's details (with two answers)", function(done) {
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

    let answerId1 = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);
    let answerText1 = faker.lorem.sentence();

    let answer1 = {
      questionId: questionId,
      id: answerId1,
      text: answerText1,
    };

    let answerId2 = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);
    let answerText2 = faker.lorem.sentence();

    let answer2 = {
      questionId: questionId,
      id: answerId2,
      text: answerText2,
    };

    Promise.all([
      db.question.create(question),
      db.answer.create(answer1),
      db.answer.create(answer2),
    ]);

    request(app)
      .get('/api/questions/' + questionId)
      .end(function(err, res) {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
          id: questionId,
          text: questionText,
          creationDate: date,
          enabled,
          enabled,
          answers: [
            {id: answerId1, text: answerText1, votes: 0},
            {id: answerId2, text: answerText2, votes: 0},
          ],
        });
        done();
      });
  });

  it("should get a question's details (with answers and votes)", function(done) {
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

    let answerId1 = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);
    let answerText1 = faker.lorem.sentence();

    let answer1 = {
      questionId: questionId,
      id: answerId1,
      text: answerText1,
    };

    let answerId2 = crypto.randomString(config.answerIdLength, config.answerIdAlphabet);
    let answerText2 = faker.lorem.sentence();

    let answer2 = {
      questionId: questionId,
      id: answerId2,
      text: answerText2,
    };

    let vote1 = {
      answerId: answerId1,
      creationDate: faker.date.recent().toISOString(),
    };

    let vote2 = {
      answerId: answerId1,
      creationDate: faker.date.recent().toISOString(),
    };

    let vote3 = {
      answerId: answerId2,
      creationDate: faker.date.recent().toISOString(),
    };

    Promise.all([
      db.question.create(question),
      db.answer.create(answer1),
      db.answer.create(answer2),
      db.vote.create(vote1),
      db.vote.create(vote2),
      db.vote.create(vote3),
    ]);

    request(app)
      .get('/api/questions/' + questionId)
      .end(function(err, res) {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
          id: questionId,
          text: questionText,
          creationDate: date,
          enabled,
          enabled,
          answers: [
            {id: answerId1, text: answerText1, votes: 2},
            {id: answerId2, text: answerText2, votes: 1},
          ],
        });
        done();
      });
  });

  it("should fail to get a question's details (does not exist)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);

    request(app)
      .get('/api/questions/' + id)
      .end(function(err, res) {
        expect(res.status).toEqual(404);
        expect(res.body).toEqual(errors.DOES_NOT_EXIST_QUESTION);
        done();
      });
  });
});
