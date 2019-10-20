'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;
const models = require('./../../src/models');

const request = require('supertest');
const crypto = require('crypto-extra');
const faker = require('faker');
faker.seed(4);

const config = require(__dirname + '/../../config/votr.json');

const errors = require('./../../src/helpers/errors');

describe('DELETE /api/questions/:question_id', () => {
  beforeEach(async () => {
    await db.sequelize.sync({force: true});
  });

  it('should delete a question', () => {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    return request(app)
      .delete('/api/questions/' + id)
      .send({token: token})
      .then(function(res) {
        expect(res.status).toEqual(204);
        expect(res.body).toEqual({});

        // Check whether question is deleted
        return models.question.count({where: {id: id, token: token}}).then((count) => {
          expect(count).toEqual(0);
        });
      });
  });

  it('should fail to delete a question (missing argument token)', () => {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    return request(app)
      .delete('/api/questions/' + id)
      .send()
      .then(function(res) {
        expect(res.status).toEqual(400);
        expect(res.body).toEqual(errors.MISSING_ARGUMENT_TOKEN);

        // Check whether question is deleted
        return models.question.count({where: {id: id, token: token}}).then((count) => {
          expect(count).toEqual(1);
        });
      });
  });

  it('should fail to delete a question (incorrect token)', () => {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let text = faker.lorem.sentences();
    let date = faker.date.recent().toISOString();
    let enabled = faker.random.boolean();
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    let question = {id: id, text: text, creationDate: date, enabled: enabled, token: token};

    Promise.all([db.question.create(question)]);

    return request(app)
      .delete('/api/questions/' + id)
      .send({token: 'incorrect-token'})
      .then(function(res) {
        expect(res.status).toEqual(401);
        expect(res.body).toEqual(errors.UNAUTHORIZED_QUESTION_DELETE);

        // Check whether question is deleted
        return models.question.count({where: {id: id, token: token}}).then((count) => {
          expect(count).toEqual(1);
        });
      });
  });

  it('should fail to delete a question (does not exist)', () => {
    let id = crypto.randomString(config.questionIdLength, config.questionIdAlphabet);
    let token = crypto.randomString(config.questionTokenLength, config.questionTokenAlphabet);

    return request(app)
      .delete('/api/questions/' + id)
      .send({token: token})
      .then(function(res) {
        expect(res.status).toEqual(404);
        expect(res.body).toEqual(errors.DOES_NOT_EXIST_QUESTION);
      });
  });
});
