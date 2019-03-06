'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;

const request = require('supertest');
const chai = require('chai');
const crypto = require('crypto-extra');
const faker = require('faker');

const config = require(__dirname + '/../../config/votr.json');
const expect = chai.expect;

describe('POST /api/vote/:question_id/:answer_id', function() {
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
      .post('/api/vote/' + questionId + '/' + answerId)
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.text).to.equal('ok');
        request(app)
          .get('/api/question/' + questionId)
          .end(function(err, res) {
            expect(res.status).to.equal(200);
            expect(res.body.id).to.equal(questionId);
            expect(res.body.text).to.equal(questionText);
            expect(res.body.creationDate).to.equal(date);
            expect(res.body.enabled).to.equal(enabled);
            expect(res.body.answers.length).to.equal(1);

            expect(res.body.answers[0]).to.have.all.key('id', 'text', 'votes');
            expect(res.body.answers[0].id).to.equal(answerId);
            expect(res.body.answers[0].text).to.equal(answerText);
            expect(res.body.answers[0].votes).to.equal(1);
            done();
          });
      });
  });

  it('should not create a vote (enabled == false)', function(done) {
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
      .post('/api/vote/' + questionId + '/' + answerId)
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.text).to.equal('Question is not enabled!');
        request(app)
          .get('/api/question/' + questionId)
          .end(function(err, res) {
            expect(res.status).to.equal(200);
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
  });
});
