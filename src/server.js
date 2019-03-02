'use strict';

const app = require('./app').app;
const db = require('./app').db;

const config = require(__dirname + '/../config/votr.json');

db.sequelize.sync().then(() => {
  app.listen(config.webServerPort);
});
