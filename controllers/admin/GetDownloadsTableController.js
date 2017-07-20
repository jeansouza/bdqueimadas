"use strict";

/**
 * Controller responsible for returning the downloads table data accordingly with the received parameters.
 * @class GetDownloadsTableController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberDownloads - 'Downloads' model.
 */
var GetDownloadsTableController = function(app) {

  // 'Downloads' model
  var memberDownloads = new (require('../../models/admin/Downloads.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function getDownloadsTableController
   * @memberof GetDownloadsTableController
   * @inner
   */
  var getDownloadsTableController = function(request, response) {
    // Call of the method 'getDownloadsTableData', responsible for returning data of the attributes table accordingly with the request parameters
    memberDownloads.getDownloadsTableData(request.body.length, request.body.start, request.body.search.value, request.body.initialDate, request.body.finalDate, function(err, result) {
      if(err) return console.error(err);

      // Call of the method 'getDownloadsTableCount', responsible for returning the number of rows of the attributes table accordingly with the request parameters, not considering the table search
      memberDownloads.getDownloadsTableCount(request.body.initialDate, request.body.finalDate, function(err, resultCount) {
        if(err) return console.error(err);

        // Call of the method 'getDownloadsTableCount', responsible for returning the number of rows of the attributes table accordingly with the request parameters, considering the table search
        memberDownloads.getDownloadsTableCountWithSearch(request.body.initialDate, request.body.finalDate, request.body.search.value, function(err, resultCountWithSearch) {
          if(err) return console.error(err);

          // Array responsible for keeping the data obtained by the method 'getDownloadsTableData'
          var data = [];

          // Conversion of the result object to array
          result.rows.forEach(function(val) {
            var temp = [];
            for(var key in val) temp.push(val[key]);
            data.push(temp);
          });

          // JSON response
          response.json({
            draw: parseInt(request.body.draw),
            recordsTotal: parseInt(resultCount.rows[0].count),
            recordsFiltered: parseInt(resultCountWithSearch.rows[0].count),
            data: data
          });
        });
      });
    });
  };

  return getDownloadsTableController;
};

module.exports = GetDownloadsTableController;
