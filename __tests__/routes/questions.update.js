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

describe('UPDATE /api/questions/:question_id', () => {
  beforeEach(async () => {
    await db.sequelize.sync({force: true});
  });

  it("should update a question's details (enabled = !enabled)", () => {
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

    return request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: enabled})
      .then(function(res) {
        expect(res.status).toEqual(204);
        expect(res.body).toEqual({});

        return models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
        });
      });
  });

  it("should update a question's details (enabled = true -> enabled = false)", () => {
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

    return request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: enabled})
      .then(function(res) {
        expect(res.status).toEqual(204);
        expect(res.body).toEqual({});

        return models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
        });
      });
  });

  it("should update a question's details (enabled = false -> enabled = true)", () => {
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

    return request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: enabled})
      .then(function(res) {
        expect(res.status).toEqual(204);
        expect(res.body).toEqual({});

        return models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
        });
      });
  });

  it("should update a question's details (no parameters to change)", () => {
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

    return request(app)
      .put('/api/questions/' + id)
      .send({token: token})
      .then(function(res) {
        expect(res.status).toEqual(204);
        expect(res.body).toEqual({});

        // Unchanged values
        return models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
        });
      });
  });

  it("should fail to update a question's details (missing token)", () => {
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

    return request(app)
      .put('/api/questions/' + id)
      .send({enabled: !enabled})
      .then(function(res) {
        expect(res.status).toEqual(400);
        expect(res.body).toEqual(errors.MISSING_ARGUMENT_TOKEN);

        // Unchanged values
        return models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
        });
      });
  });

  it("should fail to update a question's details (enabled = invalid value)", () => {
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

    return request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: 'test'})
      .then(function(res) {
        expect(res.status).toEqual(422);
        expect(res.body).toEqual(errors.INVALID_VALUE_ENABLED);

        // Unchanged values
        return models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
        });
      });
  });

  it("should fail to update a question's details (incorrect token)", () => {
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

    return request(app)
      .put('/api/questions/' + id)
      .send({token: 'incorrect-token', enabled: !enabled})
      .then(function(res) {
        expect(res.status).toEqual(401);
        expect(res.body).toEqual(errors.UNAUTHORIZED_QUESTION_UPDATE);

        // Unchanged values
        return models.question.findOne({where: {id: id, token: token}}).then((question) => {
          let questionPlain = question.get({plain: true});
          expect(questionPlain).toEqual({
            id: id,
            text: text,
            creationDate: date,
            enabled: enabled,
            token: token,
          });
        });
      });
  });

  it("should fail to update a question's details (does not exist)", () => {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    return request(app)
      .put('/api/questions/' + id)
      .send({token: token, enabled: !enabled})
      .then(function(res) {
        expect(res.status).toEqual(404);
        expect(res.body).toEqual(errors.DOES_NOT_EXIST_QUESTION);
      });
  });
});
