'use strict';

const models = require('../models');
const crypto = require('crypto-extra');

const base36 = 'abcdefghijklmnopqrstuvwxyz0123456789';

module.exports = {
  create(req, res) {
  	let id = crypto.randomString(8, base36);
  	let text = req.body.text;
  	let enabled = false;
    // "enabled" defaults to true if parameter isn't provided
  	if (typeof req.body.enabled !== 'undefined') {
      enabled = (req.body.enabled == 'true');
  	}
  	let token = crypto.randomString(32, base36);

    let question = {
      id: id,
      text: text,
      enabled: enabled,
      token: token
    };

    models.question.create(question).then(function(result) {
      res.json(question);
    }).catch(function(err) {
      res.send(err);
    });
  },
  get(req, res) {
    let id = req.params.question_id;

    // TODO: include answers and votes
    models.question.findOne({
      where: {
        id: id
      }
    }).then(function(result) {
      res.json(result);
    }).catch(function(err) {
      res.send(err);
    })
  },
  delete(req, res) {
    let id = req.params.question_id;
    let token = req.body.token;

    models.question.destroy({
      where: {
        id: id,
        token: token
      }
    }).then(function(result) {
      // Check whether entry was found and deleted
      if (result == 1) {
        res.send("Question with id {" + id + "} was deleted!");
      } else {
        res.send("No entry was deleted!")
      }
    }).catch(function(err) {
      res.send(err);
    });
  }
}