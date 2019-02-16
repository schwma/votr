'use strict';

const express = require('express');
const router = express.Router();
const questionController = require('../controllers').question;
const answerController = require('../controllers').answer;
const voteController = require('../controllers').vote;

module.exports = router.post('/question', questionController.create);
module.exports = router.get('/question/:question_id', questionController.get);
module.exports = router.put('/question/:question_id', questionController.put);
module.exports = router.delete('/question/:question_id', questionController.delete);

module.exports = router.post('/answer/:question_id', answerController.create);

module.exports = router.post('/vote/:question_id/:answer_id', voteController.create);