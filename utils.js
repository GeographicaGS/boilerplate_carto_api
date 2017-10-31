'use strict';

const config = require('config');
const fs = require('fs');
const morgan = require('morgan');
const winston = require('winston');
const winstonDialyRotateFile = require('winston-daily-rotate-file');

// Logs default parameters
const LOG_LEVELS = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];
const LOG_OUTPUTS = {
  console: winston.transports.Console,
  file: winston.transports.File,
  dailyRotateFile: winstonDialyRotateFile
};
const LOG_DEFAULT_DIR = './logs';
const LOG_DEFAULT_FILENAME = 'the_log';
const LOG_ACCESS_FORMAT = ['combined', 'common', 'dev', 'short', 'tiny'];

// Logging private functions
let _getLoggerConfig = function(fileNameKey='apiName') {
  let level = LOG_LEVELS[1];
  let output = Object.keys(LOG_OUTPUTS)[0];
  let logDir = LOG_DEFAULT_DIR;
  let logFilename = LOG_DEFAULT_FILENAME;
  let transportConfig = {
    timestamp: true
  };

  if (config.has('logging')) {
    level = config.has('logging.level') ? config.logging.level : level;
    output = config.has('logging.output') ? config.logging.output : output;
  }

  if (output === Object.keys(LOG_OUTPUTS)[0]) {
    transportConfig.colorize = true;

  } else {
    let fileConfig = config.get('logging.file');

    logDir = fileConfig && fileConfig.dir ? fileConfig.dir : logDir;
    logFilename = fileConfig && fileConfig[fileNameKey] ? fileConfig[fileNameKey] : logFilename;

    _createFolderSync(logDir);
    transportConfig.filename = `${ logDir }/${ logFilename }.log`;
  }

  return {
    level: level,
    transports: [
      new LOG_OUTPUTS[output](transportConfig)
    ]
  };
};

let _getLog = function() {
  return new (winston.Logger)(_getLoggerConfig());
};

let _getAccesLoggerConfig = function() {
  // Global logging stuff
  let loggerConfig = _getLoggerConfig();
  let log = _getLog();

  // Acces logging stuff
  let level = loggerConfig.level;
  let format = LOG_ACCESS_FORMAT[0];
  let skip = false;

  if (config.has('logging.access')) {
    level = config.has('logging.access.level') ? config.logging.access.level : level;
    format = config.has('logging.access.format') ? config.logging.access.format : format;
  }

  if (config.has('logging.access.skip') && config.logging.access.skip) {
    skip = function (req, res) {
      let re = new RegExp(config.logging.access.skip);
      return re.test(req.originalUrl);
    };
  }

  let options = {
    skip: skip,
    stream: {
      write: function(message, encoding) {
        log.log(level, message.trim());
      }
    }
  };

  return {
    format: format,
    options: options
  };
};

let _getAccessLog = function() {
  let accessLogConfig = _getAccesLoggerConfig();
  return morgan(accessLogConfig.format, accessLogConfig.options);
};

// Adding the user id as a token in morgan
morgan.token('user', function (req, res) {
  return req.user && req.user.id ? req.user.id.toString() : '-';
})

// An useful auxiliar function
let _createFolderSync = function(folder) {
  fs.existsSync(folder) || fs.mkdirSync(folder);
};

let _error = function(message, statusCode) {
  let err = new Error(message);
  err.status = statusCode || 500;
  return err;
};

module.exports.log = _getLog();
module.exports.accessLog = _getAccessLog();
module.exports.error = _error;
