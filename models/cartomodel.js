'use strict';

const Carto = require('cartodb');
const config = require('config');
const utils = require('../utils.js');

const log = utils.log;

class CartoModel {

  constructor() {
    let sqlApiUrl = `${ config.carto.protocol }://${ config.carto.user }.${ config.carto.host }/api/v2/sql`;

    let cartoOptions = {
      user: config.carto.user,
      api_key: config.carto.apiKey,
      sql_api_url: sqlApiUrl,
    };

    this._sql = new Carto.SQL(cartoOptions);
  }

  query(opts) {
    return new Promise((resolve, reject) => {
      if (!opts || !opts.query) {
        const err = new Error('No query and/or params');
        log.error(err);
        return reject(err);
      }

      opts.format = opts.format || 'json';
      if (opts.format != 'json'){
        // CARTO ISSUE WORKAROUND: IF you set params + format, format is ignored. At least for cartodb version 0.5.1
        opts.params = {format: opts.format};
      }

      this._sql.execute(opts.query, opts.params)
        .done(data => {
          if (opts.format = 'geojson'){
            // TODO: Improve via piping
            return resolve(JSON.parse(data));
          }

          if (opts.firstRow) {
            if (data.rows.length > 0) {
              resolve(data.rows[0]);
            } else {
              const err = new Error('No rows found');
              log.error(err);
              reject(err);
            }
          }
          else {
            resolve(data.rows);
          }
        })
        .error(err => {
          let error =  new Error(`Error executing query: ${opts.query}.\n ${err}`);
          log.error(error);
          reject(error);
        });
    });
  }
}

module.exports = CartoModel;
