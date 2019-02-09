'use strict';

const express = require('express');
const router = express.Router();
const questionController = require('../controllers').question;

module.exports = router.post('/question', questionController.create);
module.exports = router.get('/question/:question_id', questionController.get);
module.exports = router.delete('/question/:question_id', questionController.delete);