'use strict';

const app = require('./../../src/app').app;
const db = require('./../../src/app').db;

const request = require('supertest');
const chai = require('chai');
const faker = require('faker');

const config = require(__dirname + '/../../config/votr.json');
const expect = chai.expect;

describe('POST /api/question', function() {
  before(function() {
    return db.sequelize.sync().then(function() {
      return Promise.all([
        db.question.destroy({where: {}}),
        db.answer.destroy({where: {}}),
        db.vote.destroy({where: {}}),
      ]);
    });
  });

  it('should create a question (enabled = undefined)', function(done) {
    let text = faker.lorem.sentences();
    request(app)
      .post('/api/question')
      .send({text: text})
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.all.keys('id', 'text', 'enabled', 'token');
        expect(res.body.text).to.equal(text);
        expect(res.body.enabled).to.equal(false);
        done();
      });
  });

  it('should create a question (enabled = false)', function(done) {
    let text = faker.lorem.sentences();
    let enabled = false;
    request(app)
      .post('/api/question')
      .send({text: text, enabled: enabled})
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.all.keys('id', 'text', 'enabled', 'token');
        expect(res.body.id.length).to.equal(config.questionIdLength);
        expect(res.body.text).to.equal(text);
        expect(res.body.enabled).to.equal(enabled);
        expect(res.body.token.length).to.equal(config.questionTokenLength);
        done();
      });
  });

  it('should create a question (enabled = true)', function(done) {
    let text = faker.lorem.sentences();
    let enabled = true;
    request(app)
      .post('/api/question')
      .send({text: text, enabled: enabled.toString()})
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.all.keys('id', 'text', 'enabled', 'token');
        expect(res.body.id.length).to.equal(config.questionIdLength);
        expect(res.body.text).to.equal(text);
        expect(res.body.enabled).to.equal(enabled);
        expect(res.body.token.length).to.equal(config.questionTokenLength);
        done();
      });
  });
});
