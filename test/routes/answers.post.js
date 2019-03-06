'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;

const request = require('supertest');
const chai = require('chai');
const crypto = require('crypto-extra');
const faker = require('faker');

const config = require(__dirname + '/../../config/votr.json');
const expect = chai.expect;

describe('POST /api/answer/:question_id', function() {
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
      .post('/api/answer/' + questionId)
      .send({token: token, text: answerText})
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.all.keys('id', 'text');
        expect(res.body.id.length).to.equal(config.answerIdLength);
        expect(res.body.text).to.equal(answerText);
        done();
      });
  });
});
