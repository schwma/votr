'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;

const request = require('supertest');
const chai = require('chai');
const crypto = require('crypto-extra');
const faker = require('faker');

const config = require(__dirname + '/../../config/votr.json');
const expect = chai.expect;

describe('UPDATE /api/question/:question_id', function() {
  before(function() {
    return db.sequelize.sync().then(function() {
      return Promise.all([
        db.question.destroy({where: {}}),
        db.answer.destroy({where: {}}),
        db.vote.destroy({where: {}}),
      ]);
    });
  });

  it("should update a question's details (enabled=!enabled)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    request(app)
      .put('/api/question/' + id)
      .send({token: token, enabled: (!enabled).toString()})
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.text).to.equal('ok');
        request(app)
          .get('/api/question/' + id)
          .end(function(err, res) {
            expect(res.status).to.equal(200);
            expect(res.body.id).to.equal(id);
            expect(res.body.text).to.equal(text);
            expect(res.body.creationDate).to.equal(date);
            expect(res.body.enabled).to.equal(!enabled);
            expect(res.body.answers.length).to.equal(0);
            done();
          });
      });
  });
});
