'use strict';

const CartoModel = require('./cartomodel.js');
const utils = require('../utils.js');
const config = require('config');

const log = utils.log;

class UsersModel extends CartoModel {

  constructor() {
    super();
  }

  getUserLogin(username) {
    const table = config.auth.userTable || 'users',
      column = config.auth.userNameColum || 'username',
      password = config.auth.userPasswordColumn || 'password';

    const sql = `SELECT * FROM ${table}
            WHERE ${column}='{{username}}' LIMIT 1`;

    return this.query({query: sql, params: {username: username}, firstRow: true });
  }

}

module.exports = UsersModel;
