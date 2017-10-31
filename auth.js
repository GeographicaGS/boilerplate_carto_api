'use strict';

const crypto = require('crypto');
const config = require('config');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const moment = require('moment');
const passport = require('passport');
const UsersModel = require('./models/usersmodel.js');
const utils = require('./utils.js');

const log = utils.log;

const SECRET = config.auth.secret;

const TOKEN_EXPIRATION = config.has('auth.tokenExpiration')
  ? config.auth.tokenExpiration
  : 3600;  // Default: 1 hour

// This function returns a current token for an user and also saves it in DB
let _getJwtToken = function(user) {

  let token = jwt.sign(user, SECRET, { expiresIn: TOKEN_EXPIRATION });

  // And finally return it
  return {
    token: `JWT ${ token }`,
    expiresIn: TOKEN_EXPIRATION,
    user: user
  };

};

let _getToken = function(req, res, next) {
  const invalidError = 'Incorrect email or password';
  let username = req.headers['x-auth-username'];
  let password = req.headers['x-auth-password'];

  if (!username || !password) {
    return next(utils.error('No email or password provided', 400));
  }

  new UsersModel().getUserLogin(username)
  .then(user => {
    if (user && user.password === password) {
      delete user.password;
      let token = _getJwtToken(user);
      return res.json(token);

    } else {
      return next(utils.error(invalidError, 400));
    }
  })
  .catch(err => {
    return next(utils.error(`Error fetching user: ${username}`));
  });
};

// This function renews the token of an user
let _renewToken = function(req, res, next) {
  const currentToken = ExtractJwt.fromAuthHeader()(req);
  const newToken = _getJwtToken(req.user);
  return res.json(newToken);
};

// Passport options, verify functions and strategies go here!
let jwtStrategyOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: SECRET
};

let _jwtVerify = function(user, next) {
  delete user.iat;
  delete user.exp;
  next(null,user)
};

passport.use(new JwtStrategy(jwtStrategyOpts, _jwtVerify));

let _auth = function(req, res, next) {
  return passport.authenticate('jwt', { session: false })(req, res, next);
}
let _initialize = function(req, res, next) {
  return passport.initialize(req, res, next);
}

module.exports.initialize = _initialize;
module.exports.auth = _auth;
module.exports.getToken = _getToken;
module.exports.renewToken = _renewToken;
