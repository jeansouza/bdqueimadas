"use strict";

/**
 * Graphics class of the BDQueimadas.
 * @class Graphics
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberFiresCountGraphics - Graphics of fires count.
 */
define(
  ['components/Utils', 'components/Filter', 'components/Map', 'TerraMA2WebComponents'],
  function(Utils, Filter, Map, TerraMA2WebComponents) {

    // Graphics of fires count
    var memberFiresCountGraphics = {};

    /**
     * Activates or deactivates the time series tool.
     *
     * @function setTimeSeriesTool
     * @memberof Graphics(2)
     * @inner
     */
    var setTimeSeriesTool = function() {
      if($('#show-time-series-graphic').hasClass('active')) {
        Map.resetMapMouseTools();
        Map.activateMoveMapTool();
      } else {
        Map.resetMapMouseTools();
        $('#show-time-series-graphic').addClass('active');
        $('#terrama2-map').addClass('cursor-pointer');
        TerraMA2WebComponents.MapDisplay.setMapSingleClickEvent(function(longitude, latitude) {
          showTimeSeriesGraphic(longitude, latitude, "2000-01", "2000-12");
        });
      }
    };

    /**
     * Shows the time series graphic to the received parameters.
     * @param {float} longitude - Received longitude
     * @param {float} latitude - Received latitude
     * @param {string} start - Time series start month (YYYY-MM)
     * @param {string} end - Time series end month (YYYY-MM)
     *
     * @private
     * @function showTimeSeriesGraphic
     * @memberof Graphics(2)
     * @inner
     */
    var showTimeSeriesGraphic = function(longitude, latitude, start, end) {
      var wtssObj = new wtss(Utils.getConfigurations().graphicsConfigurations.TimeSeries.URL);

      wtssObj.time_series({
        coverage: Utils.getConfigurations().graphicsConfigurations.TimeSeries.Coverage,
        attributes: Utils.getConfigurations().graphicsConfigurations.TimeSeries.Attributes,
        longitude: longitude,
        latitude: latitude,
        start: start,
        end: end
      }, function(data) {
        if(data.result !== undefined) {
          var graphicData = {
            labels: data.result.timeline,
            datasets: [
              {
                label: "Séries Temporais",
                fillColor: "rgb(220,75,56)",
                strokeColor: "rgb(220,75,56)",
                pointColor: "rgb(220,75,56)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgb(220,75,56)",
                data: data.result.attributes[0].values
              }
            ]
          };

          $('#time-series-dialog').dialog({
            width: 855,
            height: 480,
            resizable: false,
            closeOnEscape: true,
            closeText: "",
            position: { my: 'top', at: 'top+15' }
          });

          var htmlElement = $("#time-series").get(0).getContext("2d");

          if(memberFiresCountGraphics["timeSeries"] !== undefined && memberFiresCountGraphics["timeSeries"] !== null)
            memberFiresCountGraphics["timeSeries"].destroy();

          memberFiresCountGraphics["timeSeries"] = new Chart(htmlElement).Line(graphicData, { responsive : true, maintainAspectRatio: true });
        } else {
          throw new Error("Time Series Server Error!");
        }
      });
    };

    /**
     * Updates all the graphics.
     * @param {boolean} useGraphicsFilter - Flag that indicates if the graphics filter should be used
     *
     * @function updateGraphics
     * @memberof Graphics(2)
     * @inner
     */
    var updateGraphics = function(useGraphicsFilter) {
      var dates = Utils.getFilterDates(true, (useGraphicsFilter ? 2 : 0));

      if(dates !== null) {
        if(dates.length === 0) {
          vex.dialog.alert({
            message: '<p class="text-center">Datas inválidas!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });
        } else {
          var dateFrom = Utils.dateToString(Utils.stringToDate(dates[0], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
          var dateTo = Utils.dateToString(Utils.stringToDate(dates[1], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);

          var satellites = useGraphicsFilter ?
                           (Utils.stringInArray($('#filter-satellite-graphics').val(), "all") ? '' : $('#filter-satellite-graphics').val().toString()) :
                           Utils.stringInArray(Filter.getSatellites(), "all") ? '' : Filter.getSatellites().toString();

          var biomes = useGraphicsFilter ?
                       (Utils.stringInArray($('#filter-biome-graphics').val(), "all") ? '' : $('#filter-biome-graphics').val().toString()) :
                       Utils.stringInArray(Filter.getBiomes(), "all") ? '' : Filter.getBiomes().toString();

          if(!useGraphicsFilter) {
            $('#filter-date-from-graphics').val(Filter.getFormattedDateFrom('YYYY/MM/DD'));
            $('#filter-date-to-graphics').val(Filter.getFormattedDateTo('YYYY/MM/DD'));
          }

          $.each(Utils.getConfigurations().graphicsConfigurations.FiresCount, function(i, firesCountGraphicsConfig) {
            if(memberFiresCountGraphics[firesCountGraphicsConfig.Id] === undefined) {
              var htmlElements = "<div class=\"box box-default graphic-item\" style=\"display: none;\"><div class=\"box-header with-border\"><h3 class=\"box-title\">" +
                                 firesCountGraphicsConfig.Title + "<span class=\"additional-title\"> | 0 focos, de " + $('#filter-date-from-graphics').val() + " a " +
                                 $('#filter-date-to-graphics').val() + "</span></h3><div class=\"box-tools pull-right\">" +
                                 "<button type=\"button\" class=\"btn btn-box-tool\" data-widget=\"collapse\"><i class=\"fa fa-minus\"></i></button></div></div>" +
                                 "<div class=\"box-body\" style=\"display: block;\"><div class=\"chart\">" +
                                 "<canvas id=\"fires-count-" + firesCountGraphicsConfig.Id + "-graphic\"></canvas>" +
                                 "<a href=\"#\" class=\"btn btn-app export-graphic-data\" data-id=\"" + firesCountGraphicsConfig.Id +
                                 "\"><i class=\"fa fa-download\"></i>Exportar Dados em CSV</a>" +
                                 "<div id=\"fires-count-" + firesCountGraphicsConfig.Id +
                                 "-graphic-message-container\" class=\"text-center\">" +
                                 "</div></div></div></div>";

              $("#graphics-container").append(htmlElements);
              memberFiresCountGraphics[firesCountGraphicsConfig.Id] = null;
            }

            var countries = (Utils.stringInArray(Filter.getCountriesBdqNames(), "") || Filter.getCountriesBdqNames().length === 0 ? '' : Filter.getCountriesBdqNames().toString());
            var states = (Utils.stringInArray(Filter.getStatesBdqNames(), "") || Filter.getStatesBdqNames().length === 0 ? '' : Filter.getStatesBdqNames().toString());

            if((Filter.getContinent() !== null && Filter.getContinent() == Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter) && countries === '') {
              var initialContinentCountries = Utils.getConfigurations().applicationConfigurations.InitialContinentCountries;
              var initialContinentCountriesLength = initialContinentCountries.length;

              for(var i = 0; i < initialContinentCountriesLength; i++) {
                countries += initialContinentCountries[i].Name + ',';
              }

              countries = countries.substring(0, countries.length - 1);
            }

            Utils.getSocket().emit(
              'graphicsFiresCountRequest',
              {
                dateFrom: dateFrom,
                dateTo: dateTo,
                id: firesCountGraphicsConfig.Id,
                y: firesCountGraphicsConfig.Y,
                key: firesCountGraphicsConfig.Key,
                limit: firesCountGraphicsConfig.Limit,
                title: firesCountGraphicsConfig.Title,
                satellites: satellites,
                biomes: biomes,
                countries: countries,
                states: states,
                filterRules: {
                  ignoreCountryFilter: firesCountGraphicsConfig.IgnoreCountryFilter,
                  ignoreStateFilter: firesCountGraphicsConfig.IgnoreStateFilter,
                  showOnlyIfThereIsACountryFiltered: firesCountGraphicsConfig.ShowOnlyIfThereIsACountryFiltered,
                  showOnlyIfThereIsNoCountryFiltered: firesCountGraphicsConfig.ShowOnlyIfThereIsNoCountryFiltered,
                  showOnlyIfThereIsAStateFiltered: firesCountGraphicsConfig.ShowOnlyIfThereIsAStateFiltered,
                  showOnlyIfThereIsNoStateFiltered: firesCountGraphicsConfig.ShowOnlyIfThereIsNoStateFiltered
                }
              }
            );
          });
        }
      }
    };

    /**
     * Loads a given graphic of fires count.
     * @param {json} firesCount - Data to be used in the graphic
     *
     * @function loadFiresCountGraphic
     * @memberof Graphics(2)
     * @inner
     */
    var loadFiresCountGraphic = function(firesCount) {
      var graphHeight = (firesCount.firesCount.rowCount * 20) + 100;
      var labels = [];
      var values = [];

      var yFields = firesCount.y.match(/[^{\}]+(?=})/g);
      var y = firesCount.y;

      $.each(firesCount.firesCount.rows, function(i, firesCountItem) {
        var label = y;

        for(var i = 0, count = yFields.length; i < count; i++) {
          var field = (firesCountItem[yFields[i]] !== null && firesCountItem[yFields[i]] !== undefined && firesCountItem[yFields[i]] !== "" ? firesCountItem[yFields[i]]: "Não Identificado");

          label = label.replace("{" + yFields[i] + "}", field);
        }

        labels.push(label);
        values.push(firesCountItem.count);
      });

      var firesCountGraphicData = {
        labels : labels,
        datasets : [
          {
            backgroundColor : "rgba(220,75,56,0.5)",
            borderColor : "rgba(220,75,56,0.8)",
            hoverBackgroundColor : "rgba(220,75,56,0.75)",
            hoverBorderColor : "rgba(220,75,56,1)",
            data : values
          }
        ]
      };

      if(memberFiresCountGraphics[firesCount.id] !== undefined && memberFiresCountGraphics[firesCount.id] !== null)
        memberFiresCountGraphics[firesCount.id].destroy();

      $("#fires-count-" + firesCount.id + "-graphic").attr('height', graphHeight + 'px');
      $("#fires-count-" + firesCount.id + "-graphic").css('min-height', graphHeight + 'px');
      $("#fires-count-" + firesCount.id + "-graphic").css('max-height', graphHeight + 'px');
      $("#fires-count-" + firesCount.id + "-graphic-message-container").hide();
      $("#fires-count-" + firesCount.id + "-graphic").show();

      var htmlElement = $("#fires-count-" + firesCount.id + "-graphic").get(0).getContext("2d");

      memberFiresCountGraphics[firesCount.id] = new Chart(htmlElement, {
        type: 'horizontalBar',
        data: firesCountGraphicData,
        options: {
          responsive : true,
          maintainAspectRatio: false,
          tooltips: {
            callbacks: {
              label: function(tooltipItems, data) {
                var percentage = ((parseFloat(tooltipItems.xLabel) / parseFloat(firesCount.firesTotalCount.rows[0].count)) * 100).toFixed(1);
                return tooltipItems.xLabel + ' F | ' + percentage + '%';
              }
            }
          },
          legend: {
            display: false
          }
        }
      });

      var additionalTitle = " | " + firesCount.firesTotalCount.rows[0].count + " focos, de " + $('#filter-date-from-graphics').val() + " a " + $('#filter-date-to-graphics').val();
      $("#fires-count-" + firesCount.id + "-graphic").parents('.graphic-item').find('.box-title > .additional-title').text(additionalTitle);
      $("#fires-count-" + firesCount.id + "-graphic").parent().children('.export-graphic-data').show();
      $("#fires-count-" + firesCount.id + "-graphic").parents('.graphic-item').show();

      var countries = (Utils.stringInArray(Filter.getCountriesBdqNames(), "") || Filter.getCountriesBdqNames().length === 0 ? '' : Filter.getCountriesBdqNames().toString());
      var states = (Utils.stringInArray(Filter.getStatesBdqNames(), "") || Filter.getStatesBdqNames().length === 0 ? '' : Filter.getStatesBdqNames().toString());

      if(firesCount.firesCount.rowCount <= 1) {
        hideGraphic(firesCount.id);
      } else if(firesCount.filterRules.showOnlyIfThereIsACountryFiltered && countries === '') {
        hideGraphic(firesCount.id);
      } else if(firesCount.filterRules.showOnlyIfThereIsNoCountryFiltered && countries !== '') {
        hideGraphic(firesCount.id);
      } else if(firesCount.filterRules.showOnlyIfThereIsAStateFiltered && states === '') {
        hideGraphic(firesCount.id);
      } else if(firesCount.filterRules.showOnlyIfThereIsNoStateFiltered && states !== '') {
        hideGraphic(firesCount.id);
      }
    };

    /**
     * Hides the graphic with the given id.
     * @param {string} id - Graphic id
     *
     * @private
     * @function hideGraphic
     * @memberof Graphics(2)
     * @inner
     */
    var hideGraphic = function(id) {
      $("#fires-count-" + id + "-graphic").parent().children('.export-graphic-data').hide();
      $("#fires-count-" + id + "-graphic").parents('.graphic-item').find('.box-title > .additional-title').text(" | 0 focos, de " + $('#filter-date-from-graphics').val() + " a " + $('#filter-date-to-graphics').val());
      $("#fires-count-" + id + "-graphic").hide();
      $("#fires-count-" + id + "-graphic-message-container").show();
      $("#fires-count-" + id + "-graphic-message-container").html('Não existem dados a serem exibidos!');
      $("#fires-count-" + id + "-graphic").parents('.graphic-item').hide();
    };

    /**
     * Exports graphic data in csv format.
     * @param {string} id - Graphic id
     *
     * @function exportGraphicData
     * @memberof Graphics(2)
     * @inner
     */
    var exportGraphicData = function(id) {
      var dates = Utils.getFilterDates(true, 2);

      if(dates !== null) {
        if(dates.length === 0) {
          vex.dialog.alert({
            message: '<p class="text-center">Datas inválidas!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });
        } else {
          var dateFrom = Utils.dateToString(Utils.stringToDate(dates[0], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
          var dateTo = Utils.dateToString(Utils.stringToDate(dates[1], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
          var satellites = (Utils.stringInArray($('#filter-satellite-graphics').val(), "all") ? '' : $('#filter-satellite-graphics').val().toString());
          var biomes = (Utils.stringInArray($('#filter-biome-graphics').val(), "all") ? '' : $('#filter-biome-graphics').val().toString());
          var countries = (Utils.stringInArray(Filter.getCountriesBdqNames(), "") || Filter.getCountriesBdqNames().length === 0 ? '' : Filter.getCountriesBdqNames().toString());
          var states = (Utils.stringInArray(Filter.getStatesBdqNames(), "") || Filter.getStatesBdqNames().length === 0 ? '' : Filter.getStatesBdqNames().toString());

          var exportLink = Utils.getBaseUrl() + "export-graphic-data?dateFrom=" + dateFrom + "&dateTo=" + dateTo + "&satellites=" + satellites + "&biomes=" + biomes + "&countries=" + countries + "&states=" + states + "&id=" + id;
          location.href = exportLink;
        }
      }
    };

    /**
     * Initializes the necessary features.
     *
     * @function init
     * @memberof Graphics(2)
     * @inner
     */
    var init = function() {
      $(document).ready(function() {
        updateGraphics(false);
      });
    };

    return {
      setTimeSeriesTool: setTimeSeriesTool,
      updateGraphics: updateGraphics,
      loadFiresCountGraphic: loadFiresCountGraphic,
      exportGraphicData: exportGraphicData,
      init: init
    };
  }
);
