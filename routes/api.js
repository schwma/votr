'use strict';

const express = require('express');
const router = express.Router();
const questionController = require('../controllers').question;

module.exports = router.post('/question', questionController.create);