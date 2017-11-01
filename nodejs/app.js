'use strict';

const auth = require('./auth');
const bodyParser = require('body-parser');
const config = require('config');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressValidator = require('express-validator');
const utils = require('./utils.js');

const indexRoutes = require('./routes/index.js');
const authRoutes = require('./routes/auth.js');

// Initializing logging
const log = utils.log;
log.info('Logger successfully started');
log.info(`${config.name} version ${config.version}`);

let app = express();

app.use(utils.accessLog);
log.info('Access logger successfully started');

// Enable invalid CARTO https certificate
// if (config.has('carto.onPrem') && config.carto.onPrem) {
//   process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// }

// Enable CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'x-auth-username, x-auth-password, Authorization, Content-Type');
  res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');

  if (req.method === 'OPTIONS') {
    res.end();
  }
  
  next();
});

// Data middlewares
app.use(bodyParser.json({limit: '3mb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(auth.initialize());

app.use('/', indexRoutes);
app.use('/auth', authRoutes);

// Catch 404 and forward it to the error handler
app.use(function(req, res, next) {
  next(utils.error(`Not found: ${req.originalUrl}`, 404));
});

// Error handler
app.use(function(err, req, res, next) {
  let status = err.status || 500;
  log.error(`[status] ${err.message}`);
  res.status(status);

  let printError = app.get('env') === 'development.local' || app.get('env') === 'development';
  let printableError = printError ? err : undefined

  res.json({
    message: err.message,
    error: printableError
  });
});

module.exports = app;
