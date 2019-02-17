'use strict';

const db = require('./models');
const express = require('express');
const bodyParser = require('body-parser');

const api = require('./routes/api');

const config = require(__dirname + '/../config/votr.json');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', api);

db.sequelize.sync().then(() => {
  app.listen(config.webServerPort);
});
