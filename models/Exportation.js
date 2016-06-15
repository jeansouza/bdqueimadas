"use strict";

/**
 * Exportation model, which contains exportation related database manipulations.
 * @class Exportation
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgConnectionString - 'PgConnectionString' module.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {json} memberAttributesTableConfig - Attributes table configuration.
 * @property {object} memberPg - 'pg' module.
 */
var Exportation = function() {

  // 'path' module
  var memberPath = require('path');
  // 'PgConnectionString' module
  var memberPgConnectionString = new (require(memberPath.join(__dirname, '../modules/PgConnectionString.js')))();
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));
  // Attributes table configuration
  var memberAttributesTableConfig = require(memberPath.join(__dirname, '../configurations/AttributesTable.json'));
  // 'pg' module
  var memberPg = require('pg');

  /**
   * Callback of the database operations.
   * @callback Graphics~databaseOperationCallback
   * @param {error} err - Error
   * @param {json} result - Result of the operation
   */

  /**
   * Returns the fires data in GeoJSON format.
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getGeoJSONData
   * @memberof Exportation
   * @inner
   */
  this.getGeoJSONData = function(dateFrom, dateTo, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Setting of the query columns string
    var columns = "";
    for(var i = 0; i < memberAttributesTableConfig.Columns.length; i++) {
      if(memberAttributesTableConfig.Columns[i].Name !== "geom")
        columns += memberAttributesTableConfig.Columns[i].Name + ", ";
    }
    columns = columns.substring(0, (columns.length - 2));

    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsGeoJSON(" + memberTablesConfig.Fires.GeometryFieldName + ")::json as geometry, row_to_json((select columns from (select " +
                    columns + ") as columns)) as properties from " + memberTablesConfig.Fires.Schema + "." +
                    memberTablesConfig.Fires.TableName + " where (" + memberTablesConfig.Fires.DateFieldName +
                    " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateFrom, dateTo];

        // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
        if(options.satellites !== undefined) {
          var satellitesArray = options.satellites.split(',');
          query += " and " + memberTablesConfig.Fires.SatelliteFieldName + " in (";

          for(var i = 0; i < satellitesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(satellitesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.extent' parameter exists, a extent 'where' clause is created
        if(options.extent !== undefined) {
          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", ST_MakeEnvelope($" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", 4326))";
          params.push(options.extent[0], options.extent[1], options.extent[2], options.extent[3]);
        }

        // If the 'options.country' parameter exists, a country 'where' clause is created
        if(options.country !== undefined) {
          query += " and " + memberTablesConfig.Fires.CountryFieldName + " = $" + (parameter++);
          params.push(options.country);
        }

        // If the 'options.state' parameter exists, a state 'where' clause is created
        if(options.state !== undefined) {
          query += " and " + memberTablesConfig.Fires.StateFieldName + " = $" + (parameter++);
          params.push(options.state);
        }

        // If the 'options.limit' parameter exists, a limit clause is created
        if(options.limit !== undefined) {
          query += " limit " + options.limit;
        }

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

module.exports = Exportation;
