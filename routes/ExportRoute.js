"use strict";

/**
 * Route of the Export controller.
 * @class ExportRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var ExportRoute = function(app) {
  var controller = app.controllers.ExportController;
  app.get(BASE_URL + 'export', controller);
};

module.exports = ExportRoute;
