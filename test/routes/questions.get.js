'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;

const request = require('supertest');
const chai = require('chai');
const crypto = require('crypto-extra');
const faker = require('faker');

const config = require(__dirname + '/../../config/votr.json');
const expect = chai.expect;

describe('GET /api/question/:question_id', function() {
  before(function() {
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
      .get('/api/question/' + id)
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.all.keys('id', 'text', 'creationDate', 'enabled', 'answers');
        expect(res.body.id).to.equal(id);
        expect(res.body.text).to.equal(text);
        expect(res.body.creationDate).to.equal(date);
        expect(res.body.enabled).to.equal(enabled);
        expect(res.body.answers.length).to.equal(0);
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
      .get('/api/question/' + questionId)
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.all.keys('id', 'text', 'creationDate', 'enabled', 'answers');
        expect(res.body.id).to.equal(questionId);
        expect(res.body.text).to.equal(questionText);
        expect(res.body.creationDate).to.equal(date);
        expect(res.body.enabled).to.equal(enabled);
        expect(res.body.answers.length).to.equal(1);

        expect(res.body.answers[0]).to.have.all.key('id', 'text', 'votes');
        expect(res.body.answers[0].id).to.equal(answerId);
        expect(res.body.answers[0].text).to.equal(answerText);
        expect(res.body.answers[0].votes).to.equal(0);
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
      .get('/api/question/' + questionId)
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.all.keys('id', 'text', 'creationDate', 'enabled', 'answers');
        expect(res.body.id).to.equal(questionId);
        expect(res.body.text).to.equal(questionText);
        expect(res.body.creationDate).to.equal(date);
        expect(res.body.enabled).to.equal(enabled);
        expect(res.body.answers.length).to.equal(2);

        expect(res.body.answers[0]).to.have.all.key('id', 'text', 'votes');
        expect(res.body.answers[0].id).to.equal(answerId1);
        expect(res.body.answers[0].text).to.equal(answerText1);
        expect(res.body.answers[0].votes).to.equal(0);

        expect(res.body.answers[1]).to.have.all.key('id', 'text', 'votes');
        expect(res.body.answers[1].id).to.equal(answerId2);
        expect(res.body.answers[1].text).to.equal(answerText2);
        expect(res.body.answers[1].votes).to.equal(0);
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
      .get('/api/question/' + questionId)
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.all.keys('id', 'text', 'creationDate', 'enabled', 'answers');
        expect(res.body.id).to.equal(questionId);
        expect(res.body.text).to.equal(questionText);
        expect(res.body.creationDate).to.equal(date);
        expect(res.body.enabled).to.equal(enabled);
        expect(res.body.answers.length).to.equal(2);

        expect(res.body.answers[0]).to.have.all.key('id', 'text', 'votes');
        expect(res.body.answers[0].id).to.equal(answerId1);
        expect(res.body.answers[0].text).to.equal(answerText1);
        expect(res.body.answers[0].votes).to.equal(2);

        expect(res.body.answers[1]).to.have.all.key('id', 'text', 'votes');
        expect(res.body.answers[1].id).to.equal(answerId2);
        expect(res.body.answers[1].text).to.equal(answerText2);
        expect(res.body.answers[1].votes).to.equal(1);
        done();
      });
  });
});
