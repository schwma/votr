'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;
const models = require('./../../src/models');

const request = require('supertest');
const crypto = require('crypto-extra');
const faker = require('faker');
faker.seed(3);

const config = require(__dirname + '/../../config/votr.json');

const errors = require('./../../src/helpers/errors');

describe('UPDATE /api/questions/:question_id', function() {
  beforeEach(function() {
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
    let date = faker.date.recent();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: id,
      text: text,
      creationDate: date.toISOString(),
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    enabled = !enabled;

    request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: enabled})
      .end(function(err, res) {
        expect(res.status).toEqual(204);
        expect(res.body).toEqual({});

        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
          done();
        });
      });
  });

  it("should update a question's details (enabled = true -> enabled = false)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent();
    let enabled = true;
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: id,
      text: text,
      creationDate: date.toISOString(),
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    enabled = !enabled;

    request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: enabled})
      .end(function(err, res) {
        expect(res.status).toEqual(204);
        expect(res.body).toEqual({});

        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
          done();
        });
      });
  });

  it("should update a question's details (enabled = false -> enabled = true)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent();
    let enabled = false;
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: id,
      text: text,
      creationDate: date.toISOString(),
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    enabled = !enabled;

    request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: enabled})
      .end(function(err, res) {
        expect(res.status).toEqual(204);
        expect(res.body).toEqual({});

        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
          done();
        });
      });
  });

  it("should update a question's details (no parameters to change)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: id,
      text: text,
      creationDate: date.toISOString(),
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    request(app)
      .put('/api/questions/' + id)
      .send({token: token})
      .end(function(err, res) {
        expect(res.status).toEqual(204);
        expect(res.body).toEqual({});

        // Unchanged values
        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
          done();
        });
      });
  });

  it("should fail to update a question's details (missing token)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: id,
      text: text,
      creationDate: date.toISOString(),
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    request(app)
      .put('/api/questions/' + id)
      .send({enabled: !enabled})
      .end(function(err, res) {
        expect(res.status).toEqual(400);
        expect(res.body).toEqual(errors.MISSING_ARGUMENT_TOKEN);

        // Unchanged values
        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
          done();
        });
      });
  });

  it("should fail to update a question's details (enabled = invalid value)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: id,
      text: text,
      creationDate: date.toISOString(),
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: 'test'})
      .end(function(err, res) {
        expect(res.status).toEqual(422);
        expect(res.body).toEqual(errors.INVALID_VALUE_ENABLED);

        // Unchanged values
        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
          done();
        });
      });
  });

  it("should fail to update a question's details (incorrect token)", function(done) {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {
      id: id,
      text: text,
      creationDate: date.toISOString(),
      enabled: enabled,
      token: token,
    };

    Promise.all([db.question.create(question)]);

    request(app)
      .put('/api/questions/' + id)
      .send({token: 'incorrect-token', enabled: !enabled})
      .end(function(err, res) {
        expect(res.status).toEqual(401);
        expect(res.body).toEqual(errors.UNAUTHORIZED_QUESTION_UPDATE);

        // Unchanged values
        models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
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
      .send({token: token, enabled: !enabled})
      .end(function(err, res) {
        expect(res.status).toEqual(404);
        expect(res.body).toEqual(errors.DOES_NOT_EXIST_QUESTION);
        done();
      });
  });
});
