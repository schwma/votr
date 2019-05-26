'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;
const models = require('./../../src/models');

const request = require('supertest');
const chai = require('chai');
const faker = require('faker');

const config = require(__dirname + '/../../config/votr.json');
const expect = chai.expect;

const errors = require('./../../src/helpers/errors');

describe('POST /api/questions', function() {
  before(function() {
    return db.sequelize.sync().then(function() {
      return Promise.all([
        db.question.destroy({where: {}}),
        db.answer.destroy({where: {}}),
        db.vote.destroy({where: {}}),
      ]);
    });
  });

  it('should create a question (without enabled parameter)', function(done) {
    let text = faker.lorem.sentences();
    request(app)
      .post('/api/questions')
      .send({text: text})
      .end(function(err, res) {
        expect(res.status).to.equal(201);
        expect(res.body).to.have.all.keys('id', 'token');
        expect(res.body.id.length).to.equal(config.questionIdLength);
        expect(res.body.token.length).to.equal(config.questionTokenLength);

        models.question
          .findOne({where: {id: res.body.id, token: res.body.token}})
          .then((question) => {
            let questionPlain = question.get({plain: true});
            expect(questionPlain.text).to.equal(text);
            expect(questionPlain.enabled).to.equal(false);
            done();
          });
      });
  });

  it('should create a question (enabled = false)', function(done) {
    let text = faker.lorem.sentences();
    let enabled = false;
    request(app)
      .post('/api/questions')
      .send({text: text, enabled: enabled})
      .end(function(err, res) {
        expect(res.status).to.equal(201);
        expect(res.body).to.have.all.keys('id', 'token');
        expect(res.body.id.length).to.equal(config.questionIdLength);
        expect(res.body.token.length).to.equal(config.questionTokenLength);

        models.question
          .findOne({where: {id: res.body.id, token: res.body.token}})
          .then((question) => {
            let questionPlain = question.get({plain: true});
            expect(questionPlain.text).to.equal(text);
            expect(questionPlain.enabled).to.equal(enabled);
            done();
          });
      });
  });

  it('should create a question (enabled = true)', function(done) {
    let text = faker.lorem.sentences();
    let enabled = true;
    request(app)
      .post('/api/questions')
      .send({text: text, enabled: enabled})
      .end(function(err, res) {
        expect(res.status).to.equal(201);
        expect(res.body).to.have.all.keys('id', 'token');
        expect(res.body.id.length).to.equal(config.questionIdLength);
        expect(res.body.token.length).to.equal(config.questionTokenLength);

        models.question
          .findOne({where: {id: res.body.id, token: res.body.token}})
          .then((question) => {
            let questionPlain = question.get({plain: true});
            expect(questionPlain.text).to.equal(text);
            expect(questionPlain.enabled).to.equal(enabled);
            done();
          });
      });
  });

  it('should fail to create a question (missing text parameter)', function(done) {
    request(app)
      .post('/api/questions')
      .send()
      .end(function(err, res) {
        expect(res.status).to.equal(400);
        expect(res.body).to.have.all.keys('error');
        expect(res.body).to.deep.equal(errors.MISSING_ARGUMENT_TEXT);
        done();
      });
  });

  it('should fail to create a question (enabled = invalid value)', function(done) {
    let text = faker.lorem.sentences();
    let enabled = 'test';
    request(app)
      .post('/api/questions')
      .send({text: text, enabled: enabled})
      .end(function(err, res) {
        expect(res.status).to.equal(422);
        expect(res.body).to.have.all.keys('error');
        expect(res.body).to.deep.equal(errors.INVALID_VALUE_ENABLED);
        done();
      });
  });

  it('should fail to create a question (enabled = "")', function(done) {
    let text = faker.lorem.sentences();
    let enabled = '';
    request(app)
      .post('/api/questions')
      .send({text: text, enabled: enabled})
      .end(function(err, res) {
        expect(res.status).to.equal(422);
        expect(res.body).to.have.all.keys('error');
        expect(res.body).to.deep.equal(errors.INVALID_VALUE_ENABLED);
        done();
      });
  });
});
