'use strict';

const auth = require('../auth.js').auth;
const config = require('config');
const express = require('express');
const renewToken = require('../auth.js').renewToken;
const getToken = require('../auth.js').getToken;
const utils = require('../utils');
const log = utils.log;
const router = express.Router();

router.get('/getToken', getToken);

router.get('/renewToken',  auth(), renewToken);

module.exports = router;
