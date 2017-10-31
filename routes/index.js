'use strict';

const config = require('config');
const express = require('express');
const router = express.Router();
const CartoModel = require('../models/cartomodel');
const utils = require('../utils');
const log = utils.log;

// GET the 'home page' fo the API
router.get('/', function(req, res, next) {
  res.send(`${config.name} - ${config.version}`);
});

module.exports = router;
