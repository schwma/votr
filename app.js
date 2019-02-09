'use strict';

const db = require("./models");
const express = require('express');
const bodyParser = require('body-parser');

const api = require('./routes/api');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', api);

db.sequelize.sync().then(() => {
  app.listen(8080);
});