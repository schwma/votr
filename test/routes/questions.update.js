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
const errorEnabled = "Value of argument 'enabled' must be a boolean";
const errorUnauthorized = 'Token is not authorized to update this question';
const errorNotFound = 'The question with the requested ID does not exist';

describe('UPDATE /api/questions/:question_id', function() {
  before(function() {
    return db.sequelize.sync().then(function() {
      return Promise.all([
        db.question.destroy({where: {}}),
        db.answer.destroy({where: {}}),
        db.vote.destroy({where: {}}),
      ]);
    });
  });

  it("should update a question's details (enabled = !enabled)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: (!enabled).toString()})
      .end(function(err, res) {
        expect(res.status).to.equal(204);
        expect(res.body).to.be.empty;

        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain.id).to.equal(id);
          expect(questionPlain.text).to.equal(text);
          expect(questionPlain.date).to.equal(date);
          expect(questionPlain.enabled).to.equal(!enabled);
          expect(questionPlain.token).to.equal(token);
          done();
        });
      });
  });

  it("should update a question's details (no parameters to change)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    request(app)
      .put('/api/questions/' + id)
      .send({token: token})
      .end(function(err, res) {
        expect(res.status).to.equal(204);
        expect(res.body).to.be.empty;

        // Unchanged values
        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain.id).to.equal(id);
          expect(questionPlain.text).to.equal(text);
          expect(questionPlain.date).to.equal(date);
          expect(questionPlain.enabled).to.equal(enabled);
          expect(questionPlain.token).to.equal(token);
          done();
        });
      });
  });

  it("should fail to update a question's details (missing token)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    request(app)
      .put('/api/questions/' + id)
      .send({enabled: (!enabled).toString()})
      .end(function(err, res) {
        expect(res.status).to.equal(400);
        expect(res.body).to.have.all.keys('error');
        expect(res.body.error).to.equal(errorToken);

        // Unchanged values
        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain.id).to.equal(id);
          expect(questionPlain.text).to.equal(text);
          expect(questionPlain.date).to.equal(date);
          expect(questionPlain.enabled).to.equal(enabled);
          expect(questionPlain.token).to.equal(token);
          done();
        });
      });
  });

  it("should fail to update a question's details (enabled = invalid value)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: 'test'})
      .end(function(err, res) {
        expect(res.status).to.equal(422);
        expect(res.body).to.have.all.keys('error');
        expect(res.body.error).to.equal(errorEnabled);

        // Unchanged values
        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain.id).to.equal(id);
          expect(questionPlain.text).to.equal(text);
          expect(questionPlain.date).to.equal(date);
          expect(questionPlain.enabled).to.equal(enabled);
          expect(questionPlain.token).to.equal(token);
          done();
        });
      });
  });

  it("should fail to update a question's details (incorrect token)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    request(app)
      .put('/api/questions/' + id)
      .send({token: 'incorrect-token', enabled: (!enabled).toString()})
      .end(function(err, res) {
        expect(res.status).to.equal(401);
        expect(res.body).to.have.all.keys('error');
        expect(res.body.error).to.equal(errorUnauthorized);

        // Unchanged values
        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain.id).to.equal(id);
          expect(questionPlain.text).to.equal(text);
          expect(questionPlain.date).to.equal(date);
          expect(questionPlain.enabled).to.equal(enabled);
          expect(questionPlain.token).to.equal(token);
          done();
        });
      });
  });

  it("should fail to update a question's details (does not exist)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: (!enabled).toString()})
      .end(function(err, res) {
        expect(res.status).to.equal(404);
        expect(res.body).to.have.all.keys('error');
        expect(res.body.error).to.equal(errorNotFound);
        done();
      });
  });
});
