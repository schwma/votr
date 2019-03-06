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

const errorToken = 'Missing argument: token';
const errorUnauthorized = 'Token is not authorized to delete this question';
const errorNotFound = 'The question with the requested ID does not exist';

describe('DELETE /api/questions/:question_id', function() {
  before(function() {
    return db.sequelize.sync().then(function() {
      return Promise.all([
        db.question.destroy({where: {}}),
        db.answer.destroy({where: {}}),
        db.vote.destroy({where: {}}),
      ]);
    });
  });

  it('should delete a question', function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    request(app)
      .delete('/api/questions/' + id)
      .send({token: token})
      .end(function(err, res) {
        expect(res.status).to.equal(204);
        expect(res.body).to.be.empty;

        // Check whether question is deleted
        models.question.count({where: {id: res.body.id, token: res.body.token}}).then((count) => {
          expect(count).to.equal(0);
          done();
        });
      });
  });

  it('should fail to delete a question (missing argument token)', function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    request(app)
      .delete('/api/questions/' + id)
      .send()
      .end(function(err, res) {
        expect(res.status).to.equal(400);
        expect(res.body).to.have.all.keys('error');
        expect(res.body.error).equal(errorToken);

        // Check whether question is deleted
        models.question.count({where: {id: res.body.id, token: res.body.token}}).then((count) => {
          expect(count).to.equal(1);
          done();
        });
      });
  });

  it('should fail to delete a question (incorrect token)', function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    request(app)
      .delete('/api/questions/' + id)
      .send({token: 'incorrect-token'})
      .end(function(err, res) {
        expect(res.status).to.equal(401);
        expect(res.body).to.have.all.keys('error');
        expect(res.body.error).equal(errorUnauthorized);

        // Check whether question is deleted
        models.question.count({where: {id: res.body.id, token: res.body.token}}).then((count) => {
          expect(count).to.equal(1);
          done();
        });
      });
  });

  it('should fail to delete a question (does not exist)', function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    request(app)
      .delete('/api/questions/' + id)
      .send({token: token})
      .end(function(err, res) {
        expect(res.status).to.equal(404);
        expect(res.body).to.have.all.keys('error');
        expect(res.body.error).equal(errorNotFound);
      });
  });
});
