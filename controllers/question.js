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
      res.send(question);
    }).catch(function(err) {
      res.send(err);
    });
  }
}