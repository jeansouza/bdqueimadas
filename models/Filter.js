"use strict";

/**
 * Filter model, which contains filter related database manipulations.
 * @class Filter
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgConnectionString - 'PgConnectionString' module.
 * @property {json} memberFilterConfig - Filter configuration.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {object} memberPg - 'pg' module.
 */
var Filter = function() {

  // 'path' module
  var memberPath = require('path');
  // 'PgConnectionString' module
  var memberPgConnectionString = new (require(memberPath.join(__dirname, '../modules/PgConnectionString.js')))();
  // Filter configuration
  var memberFilterConfig = require(memberPath.join(__dirname, '../configurations/Filter.json'));
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));
  // 'pg' module
  var memberPg = require('pg');

  /**
   * Returns the center cordinates of the country correspondent to the received id.
   * @param {number} countryId - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountryCenter
   * @memberof Filter
   * @inner
   */
  this.getCountryCenter = function(countryId, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsText(ST_Centroid(" + memberTablesConfig.Countries.GeometryFieldName + ")) from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.Countries.TableName + " where " + memberTablesConfig.Countries.IdFieldName + " = $1;",
            params = [countryId];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the center cordinates of the state correspondent to the received id.
   * @param {number} stateId - State id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStateCenter
   * @memberof Filter
   * @inner
   */
  this.getStateCenter = function(stateId, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsText(ST_Centroid(" + memberTablesConfig.States.GeometryFieldName + ")) from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.States.TableName + " where " + memberTablesConfig.States.IdFieldName + " = $1;",
            params = [stateId];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns a list of continents.
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getContinents
   * @memberof Filter
   * @inner
   */
  this.getContinents = function(callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select distinct " + memberTablesConfig.Continents.IdFieldName + " as id, " + memberTablesConfig.Continents.NameFieldName + " as name from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.Continents.TableName + " order by " + memberTablesConfig.Continents.NameFieldName + " asc;";

        // Execution of the query
        client.query(query, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns a continent filtered by the received country id.
   * @param {string} country - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getContinentByCountry
   * @memberof Filter
   * @inner
   */
  this.getContinentByCountry = function(country, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + memberTablesConfig.Continents.IdFieldName + " as id, " + memberTablesConfig.Continents.NameFieldName + " as name from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.Continents.TableName + " where " + memberTablesConfig.Countries.IdFieldName + " = $1;",
            params = [country];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns a continent filtered by the received state id.
   * @param {string} state - State id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getContinentByState
   * @memberof Filter
   * @inner
   */
  this.getContinentByState = function(state, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select a." + memberTablesConfig.Continents.IdFieldName + " as id, a." + memberTablesConfig.Continents.NameFieldName + " as name from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.Continents.TableName + " a inner join " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.States.TableName + " b on (a." + memberTablesConfig.Countries.IdFieldName + " = b." + memberTablesConfig.Countries.IdFieldName + ") where b." + memberTablesConfig.States.IdFieldName + " = $1;",
            params = [state];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns a country filtered by the received state id.
   * @param {string} state - State id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountryByState
   * @memberof Filter
   * @inner
   */
  this.getCountryByState = function(state, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select a." + memberTablesConfig.Countries.IdFieldName + " as id, a." + memberTablesConfig.Countries.NameFieldName + " as name from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.Countries.TableName + " a inner join " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.States.TableName + " b on (a." + memberTablesConfig.Countries.IdFieldName + " = b." + memberTablesConfig.Countries.IdFieldName + ") where b." + memberTablesConfig.States.IdFieldName + " = $1;",
            params = [state];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns a list of countries filtered by the received continent id.
   * @param {string} continent - Continent id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountriesByContinent
   * @memberof Filter
   * @inner
   */
  this.getCountriesByContinent = function(continent, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + memberTablesConfig.Countries.IdFieldName + " as id, " + memberTablesConfig.Countries.NameFieldName + " as name from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.Countries.TableName + " where " + memberTablesConfig.Continents.IdFieldName + " = $1 order by " + memberTablesConfig.Countries.NameFieldName + " asc;",
            params = [continent];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns a list of states filtered by the received country id.
   * @param {number} country - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStatesByCountry
   * @memberof Filter
   * @inner
   */
  this.getStatesByCountry = function(country, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + memberTablesConfig.States.IdFieldName + " as id, " + memberTablesConfig.States.NameFieldName + " as name from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.States.TableName + " where " + memberTablesConfig.Countries.IdFieldName + " = $1 order by " + memberTablesConfig.States.NameFieldName + " asc;",
            params = [country];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the continent extent correspondent to the received id.
   * @param {number} continent - Continent id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getContinentExtent
   * @memberof Filter
   * @inner
   */
  this.getContinentExtent = function(continent, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Extent(" + memberTablesConfig.Continents.GeometryFieldName + ") as extent from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.Continents.TableName + " where " + memberTablesConfig.Continents.IdFieldName + " = $1;",
            params = [continent];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the country extent correspondent to the received id.
   * @param {number} country - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountryExtent
   * @memberof Filter
   * @inner
   */
  this.getCountryExtent = function(country, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Extent(" + memberTablesConfig.Countries.GeometryFieldName + ") as extent from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.Countries.TableName + " where " + memberTablesConfig.Countries.IdFieldName + " = $1;",
            params = [country];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the state extent correspondent to the received id.
   * @param {number} state - State id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStateExtent
   * @memberof Filter
   * @inner
   */
  this.getStateExtent = function(state, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Extent(" + memberTablesConfig.States.GeometryFieldName + ") as extent from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.States.TableName + " where " + memberTablesConfig.States.IdFieldName + " = $1;",
            params = [state];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the number of the fires located in the country correspondent to the received id.
   * @param {number} country - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCountByCountry
   * @memberof Filter
   * @inner
   */
  this.getFiresCountByCountry = function(country, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) as firescount from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.Fires.TableName + " where " + memberTablesConfig.Fires.CountryFieldName + " = $1;",
            params = [country];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the extent of the polygon that intersects with the received point.
   * @param {string} longitude - Longitude of the point
   * @param {string} latitude - Latitude of the point
   * @param {float} resolution - Current map resolution
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getExtentByIntersection
   * @memberof Filter
   * @inner
   */
  this.getExtentByIntersection = function(longitude, latitude, resolution, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        var key = "States";

        if(resolution >= memberFilterConfig.SpatialFilter.Continents.MinResolution)
          key = "Continents";
        else if(resolution >= memberFilterConfig.SpatialFilter.Countries.MinResolution && resolution < memberFilterConfig.SpatialFilter.Countries.MaxResolution)
          key = "Countries";

        // Creation of the query
        var query = "SELECT ST_Extent(" + memberTablesConfig[key].GeometryFieldName + ") as extent, " + memberTablesConfig[key].IdFieldName + " as id, " + memberTablesConfig[key].NameFieldName + " as name, '" + key + "' as key FROM " + memberPgConnectionString.getSchema() + "." + memberTablesConfig[key].TableName + " WHERE ST_Intersects(" + memberTablesConfig[key].GeometryFieldName + ", ST_SetSRID(ST_MakePoint($1, $2), 4326)) group by " + memberTablesConfig[key].IdFieldName + ", " + memberTablesConfig[key].NameFieldName + ";",
            params = [longitude, latitude];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };
};

module.exports = Filter;
