'use strict';

const express = require('express');
const router = express.Router();
const questionController = require('../controllers').question;
const answerController = require('../controllers').answer;
const voteController = require('../controllers').vote;

module.exports = router.post('/questions', questionController.create);
module.exports = router.get('/questions/:question_id', questionController.get);
module.exports = router.put('/questions/:question_id', questionController.put);
module.exports = router.delete('/questions/:question_id', questionController.delete);

module.exports = router.post('/answers/:question_id', answerController.create);

module.exports = router.post('/votes/:question_id/:answer_id', voteController.create);
