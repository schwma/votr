'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;
const models = require('./../../src/models');

const request = require('supertest');
const faker = require('faker');
faker.seed(1);

const config = require(__dirname + '/../../config/votr.json');

const errors = require('./../../src/helpers/errors');

describe('POST /api/questions', () => {
  beforeEach(async () => {
    await db.sequelize.sync({force: true});
  });

  test('should create a question (without enabled parameter)', () => {
    let text = faker.lorem.sentences();
    return request(app)
      .post('/api/questions')
      .send({text: text})
      .then(function(res) {
        expect(res.status).toEqual(201);
        expect(res.body).toEqual({id: expect.any(String), token: expect.any(String)});
        expect(res.body.id.length).toEqual(config.questionIdLength);
        expect(res.body.token.length).toEqual(config.questionTokenLength);

        return models.question
          .findOne({where: {id: res.body.id, token: res.body.token}})
          .then((question) => {
            let questionPlain = question.get({plain: true});
            expect(questionPlain.text).toEqual(text);
            expect(questionPlain.enabled).toEqual(false);
          });
      });
  });

  it('should create a question (enabled = false)', () => {
    let text = faker.lorem.sentences();
    let enabled = false;
    return request(app)
      .post('/api/questions')
      .send({text: text, enabled: enabled})
      .then(function(res) {
        expect(res.status).toEqual(201);
        expect(res.body).toEqual({id: expect.any(String), token: expect.any(String)});
        expect(res.body.id.length).toEqual(config.questionIdLength);
        expect(res.body.token.length).toEqual(config.questionTokenLength);

        return models.question
          .findOne({where: {id: res.body.id, token: res.body.token}})
          .then((question) => {
            let questionPlain = question.get({plain: true});
            expect(questionPlain.text).toEqual(text);
            expect(questionPlain.enabled).toEqual(enabled);
          });
      });
  });

  it('should create a question (enabled = true)', () => {
    let text = faker.lorem.sentences();
    let enabled = true;
    return request(app)
      .post('/api/questions')
      .send({text: text, enabled: enabled})
      .then(function(res) {
        expect(res.status).toEqual(201);
        expect(res.body).toEqual({id: expect.any(String), token: expect.any(String)});
        expect(res.body.id.length).toEqual(config.questionIdLength);
        expect(res.body.token.length).toEqual(config.questionTokenLength);

        return models.question
          .findOne({where: {id: res.body.id, token: res.body.token}})
          .then((question) => {
            let questionPlain = question.get({plain: true});
            expect(questionPlain.text).toEqual(text);
            expect(questionPlain.enabled).toEqual(enabled);
          });
      });
  });

  it('should fail to create a question (missing text parameter)', () => {
    return request(app)
      .post('/api/questions')
      .send()
      .then(function(res) {
        expect(res.status).toEqual(400);
        expect(res.body).toEqual(errors.MISSING_ARGUMENT_TEXT);
      });
  });

  it('should fail to create a question (enabled = invalid value)', () => {
    let text = faker.lorem.sentences();
    let enabled = 'test';
    return request(app)
      .post('/api/questions')
      .send({text: text, enabled: enabled})
      .then(function(res) {
        expect(res.status).toEqual(422);
        expect(res.body).toEqual(errors.INVALID_VALUE_ENABLED);
      });
  });

  it('should fail to create a question (enabled = "")', () => {
    let text = faker.lorem.sentences();
    let enabled = '';
    return request(app)
      .post('/api/questions')
      .send({text: text, enabled: enabled})
      .then(function(res) {
        expect(res.status).toEqual(422);
        expect(res.body).toEqual(errors.INVALID_VALUE_ENABLED);
      });
  });
});
