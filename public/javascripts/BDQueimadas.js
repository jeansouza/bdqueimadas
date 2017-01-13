"use strict";

/**
 * Main class of the BDQueimadas.
 * @class BDQueimadas
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {number} memberHeight - Window height.
 * @property {number} memberHeaderHeight - Header height.
 * @property {number} memberNavbarHeight - Navbar height.
 * @property {number} memberContentHeaderHeight - Content header height.
 * @property {number} memberReducedFooterHeight - Reduced footer height.
 * @property {number} memberMapSubtitleHeight - Map subtitle height.
 * @property {number} memberButtonBlinkingInterval - Timer id of the initial blinking interval of the filter button.
 */
define(
  ['components/Utils', 'components/Filter', 'components/AttributesTable', 'components/Graphics', 'components/Map', 'TerraMA2WebComponents'],
  function(Utils, Filter, AttributesTable, Graphics, Map, TerraMA2WebComponents) {

    // Window height
    var memberHeight = null;
    // Header height
    var memberHeaderHeight = null;
    // Navbar height
    var memberNavbarHeight = null;
    // Content header height
    var memberContentHeaderHeight = null;
    // Reduced footer height
    var memberReducedFooterHeight = 12;
    // Map subtitle height
    var memberMapSubtitleHeight = null;
    // Timer id of the initial blinking interval of the filter button
    var memberButtonBlinkingInterval = null;

    /**
     * Updates the necessary components.
     *
     * @private
     * @function updateComponents
     * @memberof BDQueimadas
     * @inner
     */
    var updateComponents = function() {
      AttributesTable.updateAttributesTable(false);
      Graphics.updateGraphics(false);
      Map.getSubtitlesSatellites(Filter.getSatellites(), Filter.getBiomes(), Filter.getCountries(), Filter.getStates());
    };

    /**
     * Loads the DOM events.
     *
     * @private
     * @function loadEvents
     * @memberof BDQueimadas
     * @inner
     */
    var loadEvents = function() {
      // General Events

      $('#about-btn').on('click', function() {
        $('#about-dialog').dialog({
          width: 800,
          height: $(window).outerHeight() - 30,
          closeOnEscape: true,
          closeText: "",
          position: { my: 'top', at: 'top+15' }
        });
      });

      $('#presentation-btn').on('click', function() {
        if($('#presentation-dialog').html() === "")
          $('#presentation-dialog').html("<iframe style=\"width: 100%; height: 100%; border: none; margin: 0; padding: 0; overflow: hidden;\" src=\"" + Utils.getBaseUrl() + "files/presentation.pdf\"></iframe>");

        $('#presentation-dialog').dialog({
          width: 950,
          height: $(window).outerHeight() - 30,
          closeOnEscape: true,
          closeText: "",
          position: { my: 'top', at: 'top+15' }
        });
      });

      $('#frequently-asked-questions-btn').on('click', function() {
        $('#frequently-asked-questions').dialog({
          width: 800,
          height: $(window).outerHeight() - 30,
          closeOnEscape: true,
          closeText: "",
          position: { my: 'top', at: 'top+15' }
        });
      });

      $('#contact-btn').on('click', function() {
        vex.dialog.alert({
          message: '<p class="text-center">Dúvidas, comentários e sugestões:<br/><a href="mailto:queimadas@inpe.br">queimadas@inpe.br</a></p>',
          buttons: [{
            type: 'submit',
            text: 'Ok',
            className: 'bdqueimadas-btn'
          }]
        });
      });

      $('#notice-btn').on('click', function() {
        vex.dialog.alert({
          message: '<p class="text-center"><strong>Atenção!</strong><br/><br/>Esta aplicação está em <strong>fase de desenvolvimento</strong>. Ela está disponível para fins de teste e coleta de sugestões e críticas sobre suas funcionalidades.</p>',
          buttons: [{
            type: 'submit',
            text: 'Ok, entendi',
            className: 'bdqueimadas-btn'
          }]
        });
      });

      // Sidebar buttons click event
      $(".sidebar-menu > li.left-box").on('click', function(event) {
        event.preventDefault();

        if(memberButtonBlinkingInterval !== null) {
          clearInterval(memberButtonBlinkingInterval);
          memberButtonBlinkingInterval = null;

          setTimeout(function() {
            $('#layer-explorer-and-filter-button > a').removeAttr('style');
            $('#layer-explorer-and-filter-button > a > i').removeAttr('style');
            $('#layer-explorer-and-filter-button > a > div').removeAttr('style');
          }, 1100);
        }

        if($(this).hasClass('active')) {
          $(".sidebar-menu > li.left-box").removeClass('active');
        } else {
          $(".sidebar-menu > li.left-box").removeClass('active');
          $(this).addClass('active');
        }

        var box = $(this).attr('box');
        var id = $(this).attr('id');

        // Checks if the left content box to be open is set in the button
        if(box !== "" && box !== undefined) {
          var active = $("#" + box).hasClass('active');

          // Closes any open left content box and the left content box background
          closeAllLeftContentBoxes();
          closeLeftContentBoxBackground();

          // Opens the left content box corresponding to the button and the left content box background, if the box is not already open
          if(!active) {
            var numberLength = $(this).find(' > a > div.menu-btn-number').text().length;
            var headerText = $(this).text().trim();

            openLeftContentBoxBackground(id, box);
            openLeftContentBox(box, headerText.substring(numberLength));
          }
        } else {
          var active = $("#left-content-box-background").hasClass('active');
          var buttonBoxActive = $("#left-content-box-background").attr('leftContentBoxButton');

          // Closes any open left content box and the left content box background
          closeAllLeftContentBoxes();
          closeLeftContentBoxBackground();

          // Opens the left content box background in case it wasn't already open, or if it was open but not by the same button that was caught in this event
          if(buttonBoxActive !== id || !active) {
            openLeftContentBoxBackground(id, '');
          }
        }
      });

      // Window resize event
      $(window).resize(function() {
        // Updates the variables that keep DOM elements sizes
        updateSizeVars();

        // Elements sizes adjustments
        setReducedContentSize(0);

        // Setting the max height of the exportation window
        $('.component-filter-content').css('max-height', ($(window).outerHeight() - 212) + 'px');
        TerraMA2WebComponents.MapDisplay.updateMapSize();
      });

      // Export click event
      $('#export').on('click', function() {
        vex.dialog.alert({
          className: 'vex-theme-default export-dialog',
          message: '<div class="component-filter">' +
            '<div class="component-filter-title">Confirme abaixo os filtros da exportação.</div>' +
            '<div class="component-filter-content" style="max-height: ' + ($(window).outerHeight() - 212) + 'px;">' +
              '<div class="form-horizontal">' +
                '<div class="form-group bdqueimadas-form">' +
                  '<label for="continents-export" class="col-sm-3 control-label" style="text-align: left;">Continentes</label>' +
                  '<div class="col-sm-9"><select id="continents-export" name="continents-export" class="form-control float-left">' + $('#continents').html() + '</select></div>' +
                '</div>' +
              '</div>' +
              '<div class="clear" style="height: 5px;"></div>' +
              '<div class="form-group bdqueimadas-form">' +
                '<div class="float-left" style="width: 200px;">' +
                  '<label for="countries-export">Países</label>' +
                  '<select multiple id="countries-export" name="countries-export" class="form-control float-left">' + $('#countries').html() + '</select>' +
                '</div>' +
                '<div class="float-right" style="width: 200px;">' +
                  '<label for="states-export">Estados</label>' +
                  '<select multiple id="states-export" name="states-export" class="form-control float-left">' + $('#states').html().replace('<option value="0" selected="">Todos municípios</option>', '') + '</select>' +
                '</div>' +
              '</div>' +
              '<div class="clear"></div>' +
              '<div class="form-group bdqueimadas-form">' +
                '<label for="city-export">Municípios</label>' +
                '<div class="input-group">' +
                  '<input value="' + $('#city').val() + '" type="text" id="city-export" name="city-export" class="form-control" placeholder="Municípios">' +
                  '<span class="input-group-btn">' +
                    '<button type="button" id="search-cities-btn-export" class="btn btn-flat">' +
                      '<i class="fa fa-search"></i>' +
                    '</button>' +
                  '</span>' +
                '</div>' +
              '</div>' +
              '<div class="form-group bdqueimadas-form">' +
                '<label for="pas-export">UCs / TIs (Apenas Brasil)</label>' +
                '<div class="input-group">' +
                  '<input value="' + $('#pas').val() + '" type="text" id="pas-export" name="pas-export" class="form-control" placeholder="UCs / TIs">' +
                  '<span class="input-group-btn">' +
                    '<button type="button" id="search-pas-btn-export" class="btn btn-flat">' +
                      '<i class="fa fa-search"></i>' +
                    '</button>' +
                  '</span>' +
                '</div>' +
              '</div>' +
              '<div class="clear" style="height: 5px;"></div>' +
              '<div class="row">' +
                '<div class="col-md-4">' +
                  '<div class="checkbox">' +
                    '<label>' +
                      '<input type="checkbox" id="buffer-internal" name="buffer-internal"' + ($('#pas').val() == '' ? ' disabled' : '') + '> Interno' +
                    '</label>' +
                  '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                  '<div class="checkbox">' +
                    '<label>' +
                      '<input type="checkbox" id="buffer-five" name="buffer-five"' + ($('#pas').val() == '' ? ' disabled' : '') + '> Buffer 5Km' +
                    '</label>' +
                  '</div>' +
                '</div>' +
                '<div class="col-md-4">' +
                  '<div class="checkbox">' +
                    '<label>' +
                      '<input type="checkbox" id="buffer-ten" name="buffer-ten"' + ($('#pas').val() == '' ? ' disabled' : '') + '> Buffer 10Km' +
                    '</label>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<span class="help-block component-filter-error" id="filter-error-export-aps"></span>' +
              '<div class="clear" style="height: 5px;"></div>' +
              '<div class="form-group bdqueimadas-form">' +
                '<div class="float-left div-date-filter-export">' +
                  '<label for="filter-date-from-export">Data / Hora Início - TMG (Z)</label>' +
                  '<input value="' + $('#filter-date-from').val() + '" type="text" class="form-control float-left" id="filter-date-from-export" placeholder="Data Início">' +
                '</div>' +
                '<div class="float-right div-date-filter-export">' +
                  '<input value="' + $('#filter-time-from').val() + '" type="text" class="form-control float-left" id="filter-time-from-export" placeholder="Hora Início">' +
                '</div>' +
              '</div>' +
              '<div class="clear" style="height: 5px;"></div>' +
              '<div class="form-group bdqueimadas-form">' +
                '<div class="float-left div-date-filter-export">' +
                  '<label for="filter-date-to-export">Data / Hora Fim - TMG (Z)</label>' +
                  '<input value="' + $('#filter-date-to').val() + '" type="text" class="form-control float-left" id="filter-date-to-export" placeholder="Data Fim">' +
                '</div>' +
                '<div class="float-right div-date-filter-export">' +
                  '<input value="' + $('#filter-time-to').val() + '" type="text" class="form-control float-left" id="filter-time-to-export" placeholder="Hora Fim">' +
                '</div>' +
              '</div>' +
              '<div class="clear"></div>' +
              '<span class="help-block component-filter-error" id="filter-error-export-dates"></span>' +
              '<div class="clear" style="height: 5px;"></div>' +
              '<div class="form-horizontal" style="margin-bottom: 7px;">' +
                '<div class="form-group bdqueimadas-form">' +
                  '<label for="filter-satellite-export" class="col-sm-5 control-label" style="text-align: left;">Focos dos Sat&eacute;lites</label>' +
                  '<div class="col-sm-7"><select multiple class="form-control" id="filter-satellite-export">' + $('#filter-satellite').html() + '</select></div>' +
                '</div>' +
              '</div>' +
              '<span class="help-block component-filter-error" id="filter-error-export-satellite"></span>' +
              '<div class="form-horizontal" style="margin-bottom: 7px;">' +
                '<div class="form-group bdqueimadas-form">' +
                  '<label for="filter-biome-export" class="col-sm-5 control-label" style="text-align: left;">Focos nos Biomas</label>' +
                  '<div class="col-sm-7"><select multiple class="form-control" id="filter-biome-export">' + $('#filter-biome').html() + '</select></div>' +
                '</div>' +
              '</div>' +
              '<span class="help-block component-filter-error" id="filter-error-export-biome"></span>' +
              '<div class="form-horizontal">' +
                '<div class="form-group bdqueimadas-form">' +
                '<label for="exportation-type" class="col-sm-6 control-label" style="text-align: left; padding-right: 0; width: 188px;">Formato da exportação</label>' +
                '<div class="col-sm-6" style="float: right; width: 240px;">' +
                  '<select id="exportation-type" class="form-control">' +
                    '<option value="csv">CSV</option>' +
                    '<option value="geojson">GeoJSON</option>' +
                    '<option value="kml">KML</option>' +
                    '<option value="shapefile">Shapefile</option>' +
                  '</select>' +
                '</div>' +
                '</div>' +
              '</div>' +
              '<span class="help-block component-filter-error" id="filter-error-export-type"></span>' +
              '<div class="form-group bdqueimadas-form">' +
                '<label for="city-export">Codifica&ccedil;&atilde;o de Caracteres</label>' +
                '<div class="input-group" style="width: 100%;">' +
                  '<div class="row">' +
                    '<div class="col-sm-6">' +
                      '<input type="radio" name="encoding" value="windows" checked> Windows (ISO 8859-1)' +
                    '</div>' +
                    '<div class="col-sm-6">' +
                      '<input type="radio" name="encoding" value="unix"> Unix (UTF-8)' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>',
          buttons: [
            {
              type: 'submit',
              text: 'Cancelar',
              className: 'bdqueimadas-btn'
            },
            {
              type: 'button',
              text: 'Exportar',
              className: 'bdqueimadas-btn',
              click: function() {
                $("#filter-error-export-aps").text('');
                $("#filter-error-export-dates").text('');
                $("#filter-error-export-satellite").text('');
                $("#filter-error-export-biome").text('');
                $("#filter-error-export-type").text('');

                if($("#filter-date-to-export").datepicker('getDate') !== null && $("#filter-date-from-export").datepicker('getDate') !== null) {
                  var timeDiffBetweenDates = Math.abs($("#filter-date-to-export").datepicker('getDate').getTime() - $("#filter-date-from-export").datepicker('getDate').getTime());
                  var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));
                } else {
                  var diffDaysBetweenDates = 0;
                }

                if($("#filter-date-from-export").val() === "") {
                  $("#filter-error-export-dates").text('Data inicial inválida!');
                } else if($("#filter-date-to-export").val() === "") {
                  $("#filter-error-export-dates").text('Data final inválida!');
                } else if($("#filter-date-from-export").datepicker('getDate') > $("#filter-date-to-export").datepicker('getDate')) {
                  $("#filter-error-export-dates").text('Data final anterior à inicial - corrigir!');
                  $("#filter-date-to-export").val('');
                } else if($("#filter-date-from-export").datepicker('getDate') > Utils.getCurrentDate(true)) {
                  $("#filter-error-export-dates").text('Data inicial posterior à atual - corrigir!');
                  $("#filter-date-from-export").val('');
                } else if($("#filter-date-to-export").datepicker('getDate') > Utils.getCurrentDate(true)) {
                  $("#filter-error-export-dates").text('Data final posterior à atual - corrigir!');
                  $("#filter-date-to-export").val('');
                } else if(diffDaysBetweenDates > 366) {
                  $("#filter-error-export-dates").text('O período do filtro deve ser menor ou igual a 366 dias - corrigir!');
                  $("#filter-date-from-export").val('');
                  $("#filter-date-to-export").val('');
                } else if(!Utils.isTimeValid($("#filter-time-from-export").val()) && !Utils.isTimeValid($("#filter-time-to-export").val())) {
                  $("#filter-error-export-dates").text('Horas inválidas!');
                  $("#filter-time-from-expor").val('');
                  $("#filter-time-to-expor").val('');
                } else if($("#filter-time-from-export").val() === "" || !Utils.isTimeValid($("#filter-time-from-export").val())) {
                  $("#filter-error-export-dates").text('Hora inicial inválida!');
                  $("#filter-time-from-expor").val('');
                } else if($("#filter-time-to-export").val() === "" || !Utils.isTimeValid($("#filter-time-to-export").val())) {
                  $("#filter-error-export-dates").text('Hora final inválida!');
                  $("#filter-time-to-expor").val('');
                } else if($('#filter-satellite-export').val() === null) {
                  $("#filter-error-export-satellite").text('Selecione algum satélite!');
                } else if($('#filter-biome-export').val() === null) {
                  $("#filter-error-export-biome").text('Selecione algum bioma!');
                } else if($("#exportation-type").val() === "") {
                  $("#filter-error-export-type").text('Formato da exportação inválido!');
                } else if(($('#pas-export').data('value') !== undefined && $('#pas-export').data('value') !== '') && (!$('#buffer-internal').is(':checked') && !$('#buffer-five').is(':checked') && !$('#buffer-ten').is(':checked'))) {
                  $("#filter-error-export-aps").text('Quando existe uma UC ou TI filtrada, deve ter pelo menos alguma das três opções marcadas: Interno, Buffer 5Km ou Buffer 10Km!');
                } else {
                  var exportationSpatialFilterData = getSpatialData(2);

                  $.ajax({
                    async: false,
                    url: Utils.getBaseUrl() + "exists-data-to-export",
                    type: "POST",
                    data: {
                      dateTimeFrom: Utils.dateToString(Utils.stringToDate($('#filter-date-from-export').val(), 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat) + ' ' + $('#filter-time-from-export').val() + ':00',
                      dateTimeTo: Utils.dateToString(Utils.stringToDate($('#filter-date-to-export').val(), 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat) + ' ' + $('#filter-time-to-export').val() + ':59',
                      satellites: (Utils.stringInArray($('#filter-satellite-export').val(), "all") ? '' : $('#filter-satellite-export').val().toString()),
                      biomes: (Utils.stringInArray($('#filter-biome-export').val(), "all") ? '' : $('#filter-biome-export').val().toString()),
                      continent: exportationSpatialFilterData.continent,
                      countries: exportationSpatialFilterData.allCountries,
                      states: exportationSpatialFilterData.states,
                      cities: exportationSpatialFilterData.cities,
                      protectedArea: ($('#pas-export').data('value') !== undefined && $('#pas-export').data('value') !== '' ? JSON.parse($('#pas-export').data('value')) : null),
                      bufferInternal: $('#buffer-internal').is(':checked'),
                      bufferFive: $('#buffer-five').is(':checked'),
                      bufferTen: $('#buffer-ten').is(':checked')
                    },
                    success: function(existsDataToExport) {
                      if(existsDataToExport.existsDataToExport) {
                        var exportLink = Utils.getBaseUrl() + "export?dateTimeFrom=" + Utils.dateToString(Utils.stringToDate($('#filter-date-from-export').val(), 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat) + ' ' + $('#filter-time-from-export').val() + ':00' +
                                         "&dateTimeTo=" + Utils.dateToString(Utils.stringToDate($('#filter-date-to-export').val(), 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat) + ' ' + $('#filter-time-to-export').val() + ':59' +
                                         "&satellites=" + (Utils.stringInArray($('#filter-satellite-export').val(), "all") ? '' : $('#filter-satellite-export').val().toString()) +
                                         "&biomes=" + (Utils.stringInArray($('#filter-biome-export').val(), "all") ? '' : $('#filter-biome-export').val().toString()) +
                                         "&continent=" + exportationSpatialFilterData.continent +
                                         "&countries=" + exportationSpatialFilterData.allCountries +
                                         "&states=" + exportationSpatialFilterData.states +
                                         "&cities=" + exportationSpatialFilterData.cities +
                                         "&format=" + $("#exportation-type").val() +
                                         "&protectedArea=" + ($('#pas-export').data('value') !== undefined && $('#pas-export').data('value') !== '' ? $('#pas-export').data('value') : '') +
                                         "&bufferInternal=" + $('#buffer-internal').is(':checked') +
                                         "&bufferFive=" + $('#buffer-five').is(':checked') +
                                         "&bufferTen=" + $('#buffer-ten').is(':checked') +
                                         "&encoding=" + $('input[name=encoding]:checked').val() +
                                         "&t=" + existsDataToExport.token;

                        window.open(exportLink, '_blank');

                        vex.close();
                      } else {
                        vex.dialog.alert({
                          message: '<p class="text-center">Não existem dados para exportar!</p>',
                          buttons: [{
                            type: 'submit',
                            text: 'Ok',
                            className: 'bdqueimadas-btn'
                          }]
                        });
                      }
                    }
                  });
                }
              }
            }
          ]
        });

        $('#filter-date-from-export').blur();

        $("#filter-date-from-export").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});
        $("#filter-date-to-export").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});

        $("#filter-time-from-export").inputmask("99:99", {"placeholder": "hh:mm"});
        $("#filter-time-to-export").inputmask("99:99", {"placeholder": "hh:mm"});

        var datePickerOptions = $.extend(true, {}, Utils.getConfigurations().applicationConfigurations.DatePickerDefaultOptions);

        datePickerOptions['onSelect'] = function(date) {
          var dateFrom = $('#filter-date-from-export').datepicker('getDate');
          var dateTo = $('#filter-date-to-export').datepicker('getDate');

          if(dateTo !== null && dateFrom !== null) {
            var timeDiffBetweenDates = Math.abs(dateTo.getTime() - dateFrom.getTime());
            var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));
          } else {
            var diffDaysBetweenDates = 0;
          }

          if(dateFrom === null) {
            $("#filter-error-export-dates").text('A data inicial deve ser preenchida primeiro!');
            $("#filter-date-to-export").val('');
          } else if(diffDaysBetweenDates > 366) {
            $("#filter-error-export-dates").text('O período do filtro deve ser menor ou igual a 366 dias - corrigir!');
            $("#filter-date-from-export").val('');
            $("#filter-date-to-export").val('');
          } else {
            if(dateFrom > dateTo && dateTo !== null) {
              $("#filter-error-export-dates").text('Data final anterior à inicial - corrigir!');
              $("#filter-date-from-export").val('');
              $("#filter-date-to-export").val('');
            } else {
              $("#filter-error-export-aps").text('');
              $("#filter-error-export-dates").text('');
              $("#filter-error-export-satellite").text('');
              $("#filter-error-export-biome").text('');
              $("#filter-error-export-type").text('');
            }
          }
        };

        $("#filter-date-from-export").datepicker(datePickerOptions);
        $("#filter-date-to-export").datepicker(datePickerOptions);

        $("#filter-satellite-export").val($("#filter-satellite").val());
        $('#filter-biome-export').val($('#filter-biome').val());
        $('#continents-export').val($('#continents').val());
        $('#countries-export').val($('#countries').val());
        $('#states-export').val($('#states').val());

        if(Utils.stringInArray($('#countries').val(), "") || $('#countries').val().length === 0) $('#states-export').attr('disabled', 'disabled');

        if(Filter.getProtectedArea() !== null) $('#pas-export').data('value', JSON.stringify(Filter.getProtectedArea()));

        $('#pas-export').autocomplete({
          minLength: 4,
          source: function(request, response) {
            $.get(Utils.getBaseUrl() + "search-for-pas", {
              value: request.term,
              minLength: 4
            }, function(data) {
              response(data);
            });
          },
          select: function(event, ui) {
            event.preventDefault();

            $('#buffer-internal').removeAttr('disabled');
            $('#buffer-five').removeAttr('disabled');
            $('#buffer-ten').removeAttr('disabled');

            $('#pas-export').val(ui.item.label);

            $('#pas-export').data('value', JSON.stringify({
              id: ui.item.value.id,
              type: ui.item.value.type
            }));
          }
        });

        $('#city-export').autocomplete({
          minLength: 4,
          source: function(request, response) {
            var countriesAndStates = getSpatialData(2);

            $.ajax({
              url: Utils.getBaseUrl() + "search-for-cities",
              dataType: "json",
              data: {
                minLength: 4,
                value: request.term,
                countries: (countriesAndStates.countries !== "" ? countriesAndStates.countries : countriesAndStates.allCountries),
                states: countriesAndStates.states
              },
              success: function(data) {
                response(data);
              }
            });
          },
          select: function(event, ui) {
            event.preventDefault();

            $('#city-export').val(ui.item.label);
            $('#city-export').data('value', ui.item.value.id);
          }
        });
      });

      // Filter Events

      $('#filter-button').on('click', function() {
        var dates = Utils.getFilterDates(true, 0);

        if(dates !== null) {
          var countriesField = $('#countries').val();
          var statesField = $('#states').val();
          var cityField = $('#city').data('value');

          if(dates.length === 0) Filter.updateDatesToCurrent();

          if(cityField !== undefined && (Filter.getCity() !== cityField) && cityField === null) {
            Filter.setCity(null);

            Filter.checkFiresCount();
          } else if(cityField !== undefined && (Filter.getCity() !== cityField) && cityField !== null) {
            Filter.setCity(cityField);

            Utils.getSocket().emit('spatialFilterRequest', { key: 'City', id: cityField });
          } else if(!Utils.areArraysEqual(Filter.getStates(), (statesField == null || (statesField.length == 1 && (statesField[0] == "" || statesField[0] == "0")) ? [] : statesField), false) || Filter.getSpecialRegions().length > 0) {
            Filter.setCity(null);

            $('#city').val("");
            $('#city').data('value', null);

            $('#city-attributes-table').val("");
            $('#city-attributes-table').data('value', null);

            if($('#states').val() !== null) {
              var states = $('#states').val();
              var index = states.indexOf("0");
              if(index > -1) states.splice(index, 1);
            }

            if(!Utils.stringInArray(states, "") && states.length > 0) {
              var filterStates = [],
                  specialRegions = [];

              $('#states > option').each(function() {
                if(Utils.stringInArray(states, $(this).val()) && $(this).data('special-region') !== undefined && $(this).data('special-region')) {
                  specialRegions.push($(this).val());
                } else if(Utils.stringInArray(states, $(this).val()) && ($(this).data('special-region') === undefined || !$(this).data('special-region'))) {
                  filterStates.push($(this).val());
                }
              });

              Utils.getSocket().emit('spatialFilterRequest', { ids: filterStates, specialRegions: specialRegions, key: 'States', filterForm: true });
            } else {
              Utils.getSocket().emit('spatialFilterRequest', { ids: $('#countries').val(), key: 'Countries', filterForm: true });
              Filter.clearStates();
            }
          } else if(!Utils.areArraysEqual(Filter.getCountries(), (countriesField == null || (countriesField.length == 1 && countriesField[0] == "") ? [] : countriesField), false)) {
            Filter.setCity(null);

            $('#city').val("");
            $('#city').data('value', null);

            $('#city-attributes-table').val("");
            $('#city-attributes-table').data('value', null);

            if(!Utils.stringInArray($('#countries').val(), "") && $('#countries').val().length > 0) {
              Utils.getSocket().emit('spatialFilterRequest', { ids: $('#countries').val(), key: 'Countries', filterForm: true });
              Filter.clearStates();
            } else {
              Utils.getSocket().emit('spatialFilterRequest', { ids: $('#continents').val(), key: 'Continent', filterForm: true });
              Filter.clearCountries();
              Filter.clearStates();
            }
          } else {
            Filter.checkFiresCount();
          }
        } else {
          $('#filter-satellite').val(Filter.getSatellites());
          $('#filter-biome').val(Filter.getBiomes());
        }

        $.event.trigger({type: "updateMapInformationsBox"});
      });

      $('#initial-filter-button').on('click', function() {
        Map.resetMapMouseTools();
        Map.initialExtent();
        Map.activateMoveMapTool();
        Filter.resetDropdowns();

        Filter.updateDatesToCurrent();

        $('#pas').val('');
        $('#pas-attributes-table').val('');

        $('#city').val('');
        $('#city-attributes-table').val('');

        $('#filter-satellite').val('all');
        $('#filter-biome').val('all');

        $('#filter-satellite-graphics').val('all');
        $('#filter-biome-graphics').val('all');

        $('#filter-satellite-attributes-table').val('all');
        $('#filter-biome-attributes-table').val('all');

        searchForPAs(false, false);
        searchForCities(false, false);

        Filter.applyFilter();
        updateComponents();
      });

      $('#continents').change(function() {
        $('#continents-graphics').val($('#continents').val());
        $('#continents-graphics').change();

        $('#continents-attributes-table').val($('#continents').val());
        $('#continents-attributes-table').change();

        if($(this).val() !== "")
          Utils.getSocket().emit('spatialFilterRequest', { ids: $(this).val(), key: 'Continent', filterForm: false });
      });

      $('#countries').change(function() {
        $('#countries-graphics').val($('#countries').val());
        $('#countries-graphics').change();

        $('#countries-attributes-table').val($('#countries').val());
        $('#countries-attributes-table').change();

        $('#filter-button').click();
      });

      $('#states').change(function() {
        $('#states-graphics').val($('#states').val());
        $('#states-graphics').change();

        $('#states-attributes-table').val($('#states').val());
        $('#states-attributes-table').change();

        $('#filter-button').click();
      });

      $('#continents-graphics').change(function() {
        if($(this).val() !== "") {
          Utils.getSocket().emit('countriesByContinentRequest', { continent: $(this).val(), filter: 2 });
        }
      });

      $('#countries-graphics').change(function() {
        if(!Utils.stringInArray($(this).val(), "") && $(this).val().length > 0) {
          Utils.getSocket().emit('statesByCountriesRequest', { countries: $(this).val(), filter: 2 });
        } else {
          Utils.getSocket().emit('countriesByContinentRequest', { continent: $('#continents-graphics').val(), filter: 2 });
        }
      });

      $('#states-graphics').change(function() {
        $('#filter-button-graphics').click();
      });

      $('#continents-attributes-table').change(function() {
        if($(this).val() !== "") {
          Utils.getSocket().emit('countriesByContinentRequest', { continent: $(this).val(), filter: 1 });
        }
      });

      $('#countries-attributes-table').change(function() {
        if(!Utils.stringInArray($(this).val(), "") && $(this).val().length > 0) {
          Utils.getSocket().emit('statesByCountriesRequest', { countries: $(this).val(), filter: 1 });
        } else {
          Utils.getSocket().emit('countriesByContinentRequest', { continent: $('#continents-attributes-table').val(), filter: 1 });
        }
      });

      $('#states-attributes-table').change(function() {
        $('#filter-button-attributes-table').click();
      });

      $("#search-pas-btn").on('click', function() {
        searchForPAs(true, true);
      });

      $('#pas').on('change', function() {
        if($('#pas').val().length === 0) {
          $('#pas').val('');
          $('#pas-attributes-table').val('');

          Filter.setProtectedArea(null);

          $('#filter-button').click();
        }
      });

      $("#search-pas-btn-attributes-table").on('click', function() {
        $.ajax({
          url: Utils.getBaseUrl() + "search-for-pas",
          type: "GET",
          data: {
            value: $('#pas-attributes-table').val(),
            minLength: 1
          },
          success: function(data) {
            if(data.length > 0) {
              $('#pas-attributes-table').val(data[0].label);

              $('#pas-attributes-table').data('value', JSON.stringify({
                id: data[0].value.id,
                type: data[0].value.type
              }));

              $('#filter-button-attributes-table').click();
            } else {
              $('#pas-attributes-table').data('value', '');

              vex.dialog.alert({
                message: '<p class="text-center">Nenhuma unidade de conservação / terra indígena corresponde à pesquisa!</p>',
                buttons: [{
                  type: 'submit',
                  text: 'Ok',
                  className: 'bdqueimadas-btn'
                }]
              });
            }
          }
        });
      });

      $('#pas-attributes-table').on('change', function() {
        if($('#pas-attributes-table').val().length === 0) {
          $('#pas-attributes-table').val('');
          $('#pas-attributes-table').data('value', '');

          $('#filter-button-attributes-table').click();
        }
      });

      $(document).on('click', '#search-pas-btn-export', function() {
        $.ajax({
          url: Utils.getBaseUrl() + "search-for-pas",
          type: "GET",
          data: {
            value: $('#pas-export').val(),
            minLength: 1
          },
          success: function(data) {
            if(data.length > 0) {
              $('#buffer-internal').removeAttr('disabled');
              $('#buffer-five').removeAttr('disabled');
              $('#buffer-ten').removeAttr('disabled');

              $('#pas-export').val(data[0].label);

              $('#pas-export').data('value', JSON.stringify({
                id: data[0].value.id,
                type: data[0].value.type
              }));
            } else {
              $('#pas-export').data('value', '');

              vex.dialog.alert({
                message: '<p class="text-center">Nenhuma unidade de conservação / terra indígena corresponde à pesquisa!</p>',
                buttons: [{
                  type: 'submit',
                  text: 'Ok',
                  className: 'bdqueimadas-btn'
                }]
              });
            }
          }
        });
      });

      $(document).on('change', '#pas-export', function() {
        if($('#pas-export').val().length === 0) {
          $('#pas-export').val('');
          $('#pas-export').data('value', '');
        }
      });

      $('#search-cities-btn').on('click', function() {
        searchForCities(true, true);
      });

      $('#city').on('change', function() {
        if($('#city').val().length === 0) {
          $('#city').val("");
          $('#city').data('value', null);

          $('#city-attributes-table').val("");
          $('#city-attributes-table').data('value', null);

          $('#filter-button').click();
        }
      });

      $('#search-cities-btn-attributes-table').on('click', function() {
        var countriesAndStates = getSpatialData(1);

        $.ajax({
          url: Utils.getBaseUrl() + "search-for-cities",
          type: "GET",
          data: {
            value: $('#city-attributes-table').val(),
            countries: (countriesAndStates.countries !== "" ? countriesAndStates.countries : countriesAndStates.allCountries),
            states: countriesAndStates.states,
            minLength: 1
          },
          success: function(data) {
            if(data.length > 0) {
              $('#city-attributes-table').val(data[0].label);
              $('#city-attributes-table').data('value', data[0].value.id);

              $('#filter-button-attributes-table').click();
            } else {
              vex.dialog.alert({
                message: '<p class="text-center">Nenhum município corresponde à pesquisa!</p>',
                buttons: [{
                  type: 'submit',
                  text: 'Ok',
                  className: 'bdqueimadas-btn'
                }]
              });
            }
          }
        });
      });

      $('#city-attributes-table').on('change', function() {
        if($('#city-attributes-table').val().length === 0) {
          $('#city-attributes-table').val('');
          $('#city-attributes-table').data('value', '');

          $('#filter-button-attributes-table').click();
        }
      });

      $(document).on('click', '#search-cities-btn-export', function() {
        var countriesAndStates = getSpatialData(2);

        $.ajax({
          url: Utils.getBaseUrl() + "search-for-cities",
          type: "GET",
          data: {
            value: $('#city-export').val(),
            countries: (countriesAndStates.countries !== "" ? countriesAndStates.countries : countriesAndStates.allCountries),
            states: countriesAndStates.states,
            minLength: 1
          },
          success: function(data) {
            if(data.length > 0) {
              $('#city-export').val(data[0].label);
              $('#city-export').data('value', data[0].value.id);
            } else {
              $('#city-export').data('value', '');

              vex.dialog.alert({
                message: '<p class="text-center">Nenhum município corresponde à pesquisa!</p>',
                buttons: [{
                  type: 'submit',
                  text: 'Ok',
                  className: 'bdqueimadas-btn'
                }]
              });
            }
          }
        });
      });

      $(document).on('change', '#city-export', function() {
        if($('#city-export').val().length === 0) {
          $('#city-export').val('');
          $('#city-export').data('value', '');
        }
      });

      $(document).on('change', '#continents-export', function() {
        if($(this).val() !== "") {
          Utils.getSocket().emit('countriesByContinentRequest', { continent: $(this).val(), filter: 3 });
        }
      });

      $(document).on('change', '#countries-export', function() {
        if(!Utils.stringInArray($(this).val(), "") && $(this).val().length > 0) {
          Utils.getSocket().emit('statesByCountriesRequest', { countries: $(this).val(), filter: 3 });
        } else {
          Utils.getSocket().emit('countriesByContinentRequest', { continent: $('#continents-export').val(), filter: 3 });
        }
      });

      $('.filter-date').on('focus', function() {
        if($(this).parent().hasClass('has-error')) {
          $(this).parent().removeClass('has-error');
        }
      });

      $(document).on("updateComponents", function() {
        updateComponents();
      });

      $(document).on("applyFilter", function() {
        Filter.checkFiresCount();
      });

      // Graphics Events

      $('#show-time-series-graphic').on('click', function() {
        Graphics.setTimeSeriesTool();
      });

      $('#filter-button-graphics').on('click', function() {
        Graphics.updateGraphics(true);
      });

      $('#graph-box').on('click', '.export-graphic-data', function() {
        Graphics.exportGraphicData($(this).data('id'));
      });

      $('#graph-box').on('click', '.collapse-btn', function() {
        if(!$(this).parent().parent().parent().find(' > .box-body').is(':visible')) $(this).text('Minimizar');
        else $(this).text('Expandir');
      });

      // Map Events

      $('#dragbox').on('click', function() {
        Map.resetMapMouseTools();
        Map.activateDragboxTool();
      });

      $('#moveMap').on('click', function() {
        Map.resetMapMouseTools();
        Map.activateMoveMapTool();
      });

      $('#initialExtent').on('click', function() {
        Map.resetMapMouseTools();
        Map.initialExtent();
        Map.activateMoveMapTool();
        Filter.resetDropdowns();
      });

      $('#getAttributes').on('click', function() {
        Map.resetMapMouseTools();
        Map.activateGetFeatureInfoTool();
      });

      $('#fogograma').on('click', function() {
        Map.resetMapMouseTools();
        Map.activateFogoGramaTool();
      });

      $('.map-subtitle-toggle').on('click', function() {
        Map.updateZoomTop(true);

        if($('#map-subtitle > div').hasClass('collapsed-box')) {
          $('#map-subtitle').animate({ 'width': '350px' }, { duration: 500, queue: false });
          $('.map-subtitle-toggle > i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
        } else {
          $('#map-subtitle').animate({ 'width': '150px' }, { duration: 500, queue: false });
          $('.map-subtitle-toggle > i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
        }
      });

      $(document).on("updateMapInformationsBox", function() {
        if($('#map-info-box').parent('.ui-dialog').css('display') !== undefined && $('#map-info-box').parent('.ui-dialog').css('display') !== 'none') {
          var html = getVisibleLayers();

          $('#map-info-box').html(html);
        }
      });

      $('#map-info-button > button').on('click', function() {
        var html = getVisibleLayers();

        $('#map-info-box').html(html);
        $('#map-info-box').dialog({
          dialogClass: "map-info-box",
          title: "Informações da Tela",
          width: 230,
          maxHeight: 300,
          modal: false,
          resizable: true,
          draggable: true,
          closeOnEscape: true,
          closeText: "",
          position: { my: 'top', at: 'top+15' }
        });
      });

      $('#terrama2-layerexplorer').on('click', 'input.terrama2-layerexplorer-checkbox', function(ev) {
        setTimeout(function() {
          $('.ol-viewport a').attr('target', '_blank');
        }, 2000);

        if($(this).is(":checked")) {
          Map.setBackgroundsVisibility($(this).parent().data('layerid'));

          var parents = $(this).parents('.parent_li').find(' > .group-name > span'),
              parentsLength = parents.length,
              parentsString = "";

          if(parentsLength > 0) {
            for(var i = 0; i < parentsLength; i++) {
              parentsString += parents[i].innerText + " > ";
            }
          }

          Map.addVisibleLayer(
            $(this).parent().data('layerid'),
            $(this).parent().find(' > .terrama2-layerexplorer-checkbox-span').html(),
            $(this).parent().attr('title'),
            $(this).parent().data('parentid'),
            (parentsString !== "" ? parentsString : null),
            $(this).parent().attr('id')
          );
        } else {
          Map.removeVisibleLayer($(this).parent().data('layerid'));
        }

        ev.stopPropagation();
      });

      // LayerExplorer events

      $(document).on('click', '.remove-layer', function() {
        Map.removeLayerFromMap($(this).parent().data('layerid'));

        $('.children:empty').parent().find(' > span > div').addClass('terrama2-layerexplorer-plus').removeClass('terrama2-layerexplorer-minus').html('+');
        $('.children:empty').parent().removeClass('open');
        $('.children:empty').parent().hide();
      });

      $(document).on('click', '.new-layer', function() {
        var layerId = $(this).data('layerid');
        var layers = Map.getNotAddedLayers();

        vex.close();

        for(var i = 0, count = layers.length; i < count; i++) {
          if(layerId === layers[i].Id) {
            if(Utils.getConfigurations().mapConfigurations.UseLayerGroupsInTheLayerExplorer) {
              Map.addLayerToMap(layers[i], layers[i].LayerGroup.Id, false);
              $('#' + layers[i].LayerGroup.Id.replace(':', '')).show();
            } else {
              Map.addLayerToMap(layers[i], 'terrama2-layerexplorer', false);
            }

            return false;
          }
        }
      });

      $('#add-layer').on('click', function() {
        var layerGroups = {
          "LayerGroupsIds": [],
          "LayerGroupsNames": []
        };

        var notAddedLayers = Map.getNotAddedLayers();
        var notAddedLayersLength = notAddedLayers.length;

        if(notAddedLayersLength > 0) {
          for(var i = 0; i < notAddedLayersLength; i++) {
            var layerHtml = "<li style=\"display: none;\">" + Utils.processStringWithDatePattern(notAddedLayers[i].Name) + "<span class=\"new-layer\" data-layerid=\"" + notAddedLayers[i].Id + "\"><a href=\"#\">Adicionar</a></span></li>";

            if(layerGroups[notAddedLayers[i].LayerGroup.Id] !== undefined) {
              layerGroups[notAddedLayers[i].LayerGroup.Id] += layerHtml;
            } else {
              layerGroups[notAddedLayers[i].LayerGroup.Id] = layerHtml;

              layerGroups.LayerGroupsIds.push(notAddedLayers[i].LayerGroup.Id);
              layerGroups.LayerGroupsNames.push(notAddedLayers[i].LayerGroup.Name);
            }
          }

          var availableLayers = "<h4 class=\"text-center\"><strong>Camadas dispon&iacute;veis:</strong></h4>";
          availableLayers += "<div id=\"available-layers\">";

          for(var i = 0, count = layerGroups.LayerGroupsIds.length; i < count; i++) {
            availableLayers += "<span class=\"span-group-name\" data-available-layer-group=\"layer-group-" + layerGroups.LayerGroupsIds[i] + "\"><div class=\"layer-group-plus\">+</div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>" + layerGroups.LayerGroupsNames[i] + "</strong></span>";
            availableLayers += "<ul id=\"layer-group-" + layerGroups.LayerGroupsIds[i] + "\">" + layerGroups[layerGroups.LayerGroupsIds[i]] + "</ul>";
          }

          availableLayers += "</div>";

          $('#available-layers li').hide();

          vex.dialog.alert({
            message: availableLayers,
            buttons: [{
              type: 'submit',
              text: 'Fechar',
              className: 'bdqueimadas-btn'
            }]
          });
        } else {
          vex.dialog.alert({
            message: '<p class="text-center">Não existem camadas disponíveis para adicionar ao mapa!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });
        }
      });

      $(document).on('click', '#available-layers > span.span-group-name', function(ev) {
        var children = $("#" + $(this).data('available-layer-group')).find(' > li');

        if(children.is(":visible")) {
          children.hide('fast');
          $(this).find('div').addClass('layer-group-plus').removeClass('layer-group-minus').html('+');
        } else {
          children.show('fast');
          $(this).find('div').addClass('layer-group-minus').removeClass('layer-group-plus').html('-');
        }
      });

      $(document).on('click', '.layer-time-update', function() {
        if(!$("#hidden-layer-time-update-" + $(this).data("id")).hasClass('hasDatepicker')) {
          $("#hidden-layer-time-update-" + $(this).data("id")).datepicker(Utils.getConfigurations().applicationConfigurations.DatePickerDefaultOptions);
        }

        $("#hidden-layer-time-update-" + $(this).data("id")).datepicker("show");
      });

      $(document).on('change', '.hidden-layer-time-update', function() {
        var self = $(this);
        var layers = Map.getLayers();

        for(var i = 0, count = layers.length; i < count; i++) {
          if(layers[i].Id === self.data('id')) {
            layers[i].Params.Time = Utils.dateToString(Utils.stringToDate(self.val(), 'YYYY/MM/DD'), 'YYYY-MM-DD');

            self.parent().find('> span.layer-time-update > a').text(self.val());
            self.parent().find('> input.hidden-layer-time-update').removeClass('hasDatepicker');
            layers[i].Name = self.parent().html();

            Map.updateLayerTime(layers[i]);

            return false;
          }
        }

        $.event.trigger({type: "updateMapInformationsBox"});
      });

      // AttributesTable events

      $('#filter-button-attributes-table').on('click', function() {
        AttributesTable.updateAttributesTable(true);
      });

      // Navbar logos events

      $("#page-title").on('click', '.inpe-image', function() {
        window.open('http://www.inpe.br/', '_blank');
      });

      $("#page-title").on('click', '.programa-queimadas-image', function() {
        window.open('http://www.inpe.br/queimadas/', '_blank');
      });

      $("#page-title").on('click', '.defra-image', function() {
        window.open('https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs', '_blank');
      });

      $("#page-title").on('click', '.banco-mundial-image', function() {
        window.open('http://www.worldbank.org/', '_blank');
      });

      $("#page-title").on('click', '.mma-image', function() {
        window.open('http://www.mma.gov.br/', '_blank');
      });

      $("#page-title").on('click', '.funcate-image', function() {
        window.open('https://www.funcate.org.br/', '_blank');
      });

      // TerraMA2WebComponents events

      TerraMA2WebComponents.MapDisplay.setLayersStartLoadingFunction(function() {
        if($('#loading-span').hasClass('hide')) $('#loading-span').removeClass('hide');
      });

      TerraMA2WebComponents.MapDisplay.setLayersEndLoadingFunction(function() {
        if(!$('#loading-span').hasClass('hide')) $('#loading-span').addClass('hide');
      });

      TerraMA2WebComponents.MapDisplay.setZoomDragBoxEndEvent(function() {
        var dragBoxExtent = TerraMA2WebComponents.MapDisplay.getZoomDragBoxExtent();
        TerraMA2WebComponents.MapDisplay.zoomToExtent(dragBoxExtent);
        updateComponents();
      });

      TerraMA2WebComponents.MapDisplay.setMapResolutionChangeEvent(function() {
        Map.setSubtitlesVisibility();
      });

      TerraMA2WebComponents.MapDisplay.setMapDoubleClickEvent(function(longitude, latitude) {
        Utils.getSocket().emit('dataByIntersectionRequest', {
          longitude: longitude,
          latitude: latitude,
          resolution: TerraMA2WebComponents.MapDisplay.getCurrentResolution()
        });
      });

      TerraMA2WebComponents.MapDisplay.setLayerVisibilityChangeEvent(function(layerId) {
        Map.setSubtitlesVisibility(layerId);
      });
    };

    /**
     * Loads the sockets listeners.
     *
     * @private
     * @function loadSocketsListeners
     * @memberof BDQueimadas
     * @inner
     */
    var loadSocketsListeners = function() {

      // Filter Listeners

      Utils.getSocket().on('spatialFilterResponse', function(result) {
        if(result.extent.rowCount > 0 && result.extent.rows[0].extent !== null) {
          var extent = result.extent.rows[0].extent.replace('BOX(', '').replace(')', '').split(',');
          var extentArray = extent[0].split(' ');
          extentArray = extentArray.concat(extent[1].split(' '));
          TerraMA2WebComponents.MapDisplay.zoomToExtent(extentArray);

          if(result.key === 'Continent') {
            Filter.setContinent(result.ids);
            Filter.clearCountries();
            Filter.clearStates();
            Filter.clearSpecialRegions();

            Utils.getSocket().emit('countriesByContinentRequest', { continent: result.ids });

            Filter.enableDropdown('continents', result.ids);
            Filter.enableDropdown('countries', '');
            Filter.disableDropdown('states', '');
          } else if(result.key === 'Countries') {
            Filter.setCountries(result.ids);
            Filter.clearStates();
            Filter.clearSpecialRegions();

            Utils.getSocket().emit('statesByCountriesRequest', { countries: result.ids });

            Filter.enableDropdown('countries', result.ids);

            var index = $('#states').val() !== null ? $('#states').val().indexOf("0") : -1;

            if(index > -1) {
              Filter.enableDropdown('states', ['', '0']);
            } else {
              Filter.enableDropdown('states', '');
            }
          } else if(result.key === 'States') {
            Filter.setStates(result.ids);
            Filter.setSpecialRegions(result.specialRegions);

            var statesArray = JSON.parse(JSON.stringify(result.ids));

            if($('#states').val() !== null) {
              var index = $('#states').val().indexOf("0");
              if(index > -1) statesArray.push("0");
            }

            var arrayOne = JSON.parse(JSON.stringify(statesArray));
            var arrayTwo = JSON.parse(JSON.stringify(result.specialRegions));

            Filter.enableDropdown('states', $.merge(arrayOne, arrayTwo));
          }
        } else {
          TerraMA2WebComponents.MapDisplay.zoomToInitialExtent();
        }

        Filter.checkFiresCount();
      });

      Utils.getSocket().on('dataByIntersectionResponse', function(result) {
        if(result.data.rowCount > 0) {
          if(result.data.rows[0].key === "States") {
            var index = $('#states').val() !== null ? $('#states').val().indexOf("0") : -1;

            if(index > -1) {
              Filter.setStates(["0", result.data.rows[0].id]);
            } else {
              Filter.setStates([result.data.rows[0].id]);
            }

            Filter.selectStates([result.data.rows[0].id]);
          } else if(result.data.rows[0].key === "Countries") {
            Filter.setCountries([result.data.rows[0].id]);
            Filter.clearStates();
            Filter.selectCountries([result.data.rows[0].id]);
          } else {
            Filter.setContinent(result.data.rows[0].id);
            Filter.clearCountries();
            Filter.clearStates();

            Filter.selectContinentItem(result.data.rows[0].id, result.data.rows[0].name);
          }
        } else {
          Utils.getSocket().emit('spatialFilterRequest', { ids: Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter, key: 'Continent', filterForm: false });
        }

        updateComponents();
      });

      Utils.getSocket().on('continentByCountryResponse', function(result) {
        Filter.setContinent(result.continent.rows[0].id);

        Filter.enableDropdown('continents', result.continent.rows[0].id);

        Utils.getSocket().emit('countriesByContinentRequest', { continent: result.continent.rows[0].id });
      });

      Utils.getSocket().on('continentByStateResponse', function(result) {
        Filter.setContinent(result.continent.rows[0].id);

        Filter.enableDropdown('continents', result.continent.rows[0].id);
      });

      Utils.getSocket().on('countriesByStatesResponse', function(result) {
        var countriesIds = [];

        for(var i = 0; i < result.countriesByStates.rowCount; i++) {
          countriesIds.push(result.countriesByStates.rows[i].id);
        }

        Filter.setCountries(countriesIds);

        Utils.getSocket().emit('statesByCountriesRequest', { countries: countriesIds });

        var html = "<option value=\"\" selected>Todos os pa&iacute;ses</option>",
            countriesCount = result.countries.rowCount;

        for(var i = 0; i < countriesCount; i++) {
          var countryName = result.countries.rows[i].name;

          if(result.countries.rows[i].name === "Falkland Islands") {
            countryName = "I. Malvinas";
          } else if(result.countries.rows[i].name === "Brazil") {
            countryName = "Brasil";
          }

          html += "<option value='" + result.countries.rows[i].id + "'>" + countryName + "</option>";
        }

        $('#countries').empty().html(html);

        Filter.enableDropdown('countries', countriesIds);

        Filter.checkFiresCount();
      });

      Utils.getSocket().on('countriesByContinentResponse', function(result) {
        if(result.filter !== null && result.filter !== undefined && result.filter === 1) {
          var countriesId = '#countries-attributes-table';
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 2) {
          var countriesId = '#countries-graphics';
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 3) {
          var countriesId = '#countries-export';
        } else {
          var countriesId = '#countries';
        }

        var initialValue = $(countriesId).val();

        var html = "<option value=\"\" selected>Todos os pa&iacute;ses</option>",
            countriesCount = result.countries.rowCount;

        for(var i = 0; i < countriesCount; i++) {
          var countryName = result.countries.rows[i].name;

          if(result.countries.rows[i].name === "Falkland Islands") {
            countryName = "I. Malvinas";
          } else if(result.countries.rows[i].name === "Brazil") {
            countryName = "Brasil";
          }

          html += "<option value='" + result.countries.rows[i].id + "'>" + countryName + "</option>";
        }

        $(countriesId).empty().html(html);
        if($(countriesId).attr('data-value') === undefined || $(countriesId).attr('data-value') === "") {
          $(countriesId).val(initialValue);
        } else {
          var countries = $(countriesId).attr('data-value').split(',');
          $(countriesId).val(countries);
        }

        if(result.filter !== null && result.filter !== undefined && result.filter === 1) {
          $('#states-attributes-table').html('');
          $('#states-attributes-table').attr('disabled', '');
          $('#filter-button-attributes-table').click();
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 2) {
          $('#states-graphics').html('');
          $('#states-graphics').attr('disabled', '');
          $('#filter-button-graphics').click();
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 3) {
          $('#states-export').html('');
          $('#states-export').attr('disabled', '');
        }
      });

      Utils.getSocket().on('statesByCountryResponse', function(result) {
        if(result.filter !== null && result.filter !== undefined && result.filter === 1) {
          var statesId = '#states-attributes-table';
          var html = "<option value=\"\" selected>Todos os estados</option>";
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 2) {
          var statesId = '#states-graphics';
          var html = "<option value=\"\" selected>Todos os estados</option>";
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 3) {
          var statesId = '#states-export';
          var html = "<option value=\"\" selected>Todos os estados</option>";
        } else {
          var statesId = '#states';
          var html = "<option value=\"\" selected>Todos os estados</option><option value=\"0\" selected>Todos municípios</option>";
        }

        var initialValue = $(statesId).val();

        var statesCount = result.states.rowCount;

        for(var i = 0; i < statesCount; i++) {
          html += "<option value='" + result.states.rows[i].id + "'>" + result.states.rows[i].name + "</option>";
        }

        $(statesId).empty().html(html);
        if($(statesId).attr('data-value') === undefined || $(statesId).attr('data-value') === "") {
          $(statesId).val(initialValue);
        } else {
          var states = $(statesId).attr('data-value').split(',');
          $(statesId).val(states);
        }

        if(result.filter !== null && result.filter !== undefined && result.filter === 1) {
          $('#states-attributes-table').removeAttr('disabled');
          $('#filter-button-attributes-table').click();
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 2) {
          $('#states-graphics').removeAttr('disabled');
          $('#filter-button-graphics').click();
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 3) {
          $('#states-export').removeAttr('disabled');
        }
      });

      Utils.getSocket().on('statesByCountriesResponse', function(result) {
        if(result.filter !== null && result.filter !== undefined && result.filter === 1) {
          var statesId = '#states-attributes-table';
          var html = "<option value=\"\" selected>Todos os estados</option>";
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 2) {
          var statesId = '#states-graphics';
          var html = "<option value=\"\" selected>Todos os estados</option>";
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 3) {
          var statesId = '#states-export';
          var html = "<option value=\"\" selected>Todos os estados</option>";
        } else {
          var statesId = '#states';
          var html = "<option value=\"\" selected>Todos os estados</option><option value=\"0\" selected>Todos municípios</option>";
        }

        var initialValue = $(statesId).val();

        var statesCount = result.states.rowCount;

        for(var i = 0; i < statesCount; i++) {
          html += "<option value='" + result.states.rows[i].id + "'>" + result.states.rows[i].name + "</option>";
        }

        if(result.specialRegions !== undefined && result.specialRegions !== null) {
          var specialRegionsCount = result.specialRegions.rowCount;

          for(var i = 0; i < specialRegionsCount; i++) {
            html += "<option value='" + result.specialRegions.rows[i].id + "' data-special-region='true'>" + result.specialRegions.rows[i].name + "</option>";
          }
        }

        $(statesId).empty().html(html);
        if($(statesId).attr('data-value') === undefined || $(statesId).attr('data-value') === "") {
          $(statesId).val(initialValue);
        } else {
          var states = $(statesId).attr('data-value').split(',');
          $(statesId).val(states);
        }

        if(result.filter !== null && result.filter !== undefined && result.filter === 1) {
          $('#states-attributes-table').removeAttr('disabled');
          $('#filter-button-attributes-table').click();
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 2) {
          $('#states-graphics').removeAttr('disabled');
          $('#filter-button-graphics').click();
        } else if(result.filter !== null && result.filter !== undefined && result.filter === 3) {
          $('#states-export').removeAttr('disabled');
        }
      });

      Utils.getSocket().on('getSatellitesResponse', function(result) {
        Map.updateSubtitles(result.satellitesList.rows);
      });

      // Graphics Listeners

      Utils.getSocket().on('graphicsFiresCountResponse', function(result) {
        Graphics.loadFiresCountGraphic(result);
      });

      // Proxy Listeners

      Utils.getSocket().on('proxyResponse', function(result) {
        if(result.requestId === 'GetFeatureInfoTool') {
          var featureInfo = result.msg;

          var featuresLength = featureInfo.features.length;

          if(featuresLength > 0) {
            var firesAttributes = "";

            for(var i = 0; i < featuresLength; i++) {
              firesAttributes += "<strong>Id:</strong> " + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.IdFieldName];
              firesAttributes += "<br/><strong>Latitude:</strong> " + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LatitudeFieldName] + ' - ' + Utils.convertLatitudeToDMS(featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LatitudeFieldName]);
              firesAttributes += "<br/><strong>Longitude:</strong> " + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LongitudeFieldName] + ' - ' + Utils.convertLongitudeToDMS(featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LongitudeFieldName]);
              firesAttributes += "<br/><strong>Data / Hora:</strong> " + Utils.dateTimeToString(Utils.stringToDateTime(featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.DateTimeFieldName].toString().replace('T', ' ').replace('Z', ''), Utils.getConfigurations().filterConfigurations.LayerToFilter.DateTimeFormat), "YYYY/MM/DD HH:II:SS");
              firesAttributes += "<br/><strong>Satélite:</strong> " + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.SatelliteFieldName];
              firesAttributes += "<br/><strong>Município:</strong> " + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.CityNameFieldName];
              firesAttributes += "<br/><strong>Estado / País:</strong> " + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.StateNameFieldName] + ' / ' + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.CountryNameFieldName];
              firesAttributes += "<br/><strong>Precipitação 24h:</strong> " + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.PrecipitationFieldName];
              firesAttributes += "<br/><strong>Nº dias sem precipitação:</strong> " + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.NumberOfDaysWithoutPrecipitationFieldName];
              firesAttributes += "<br/><strong>Risco Fogo / Bioma:</strong> " + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.RiskFieldName] + ' / ' + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.BiomeFieldName];
              firesAttributes += "<br/><br/><a target='_blank' href='http://maps.google.com.br/maps?q=" + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LatitudeFieldName] + "," + featureInfo.features[i].properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LongitudeFieldName] + "&hl=pt-BR&t=h&z=10'>Veja esse ponto no Google Maps</a>";
              if(featuresLength > (i + 1)) firesAttributes += "<hr/>";
            }

            $('#feature-info-box').html(firesAttributes);

            $('#feature-info-box').dialog({
              dialogClass: "feature-info-box",
              title: (featuresLength > 1 ? "Atributos dos focos" : "Atributos do foco"),
              width: 300,
              height: 280,
              modal: false,
              resizable: true,
              draggable: true,
              closeOnEscape: true,
              closeText: "",
              position: { my: 'top', at: 'top+15' }
            });
          }
        }
      });

      Utils.getSocket().on('piwikDataResponse', function(result) {
        if(result.piwikData[0] !== undefined && result.piwikData[0] !== null && result.piwikData[0].nb_visits !== undefined && result.piwikData[0].nb_visits !== null) {
          $('#number-of-accesses > span').text(result.piwikData[0].nb_visits);
          $('#number-of-accesses').show();
        }
      });

      Utils.getSocket().on('checkFiresCountResponse', function(result) {
        if(result.firesCount.rows[0].count >= 200000) {
          vex.dialog.alert({
            message: '<p class="text-center">Atenção! O número de focos para esse filtro passou de 200.000, esse procedimento vai demorar.</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });
        }

        Filter.applyFilter();
        updateComponents();
      });
    };

    /**
     * Returns the protected area corresponding to the protected area filter.
     * @param {boolean} showAlerts - Flag that indicates if the alerts should be shown
     * @param {boolean} async - Flag that indicates if the ajax request should be asynchronous
     *
     * @private
     * @function searchForPAs
     * @memberof BDQueimadas
     * @inner
     */
    var searchForPAs = function(showAlerts, async) {
      $.ajax({
        url: Utils.getBaseUrl() + "search-for-pas",
        type: "GET",
        async: async,
        data: {
          value: $('#pas').val(),
          minLength: 1
        },
        success: function(data) {
          if(data.length > 0) {
            $('#pas').val(data[0].label);
            $('#pas-attributes-table').val(data[0].label);

            Filter.setProtectedArea({
              id: data[0].value.id,
              type: data[0].value.type
            });

            Utils.getSocket().emit('spatialFilterRequest', { key: 'ProtectedArea', id: data[0].value.id, type: data[0].value.type });
          } else {
            Filter.setProtectedArea(null);

            if(showAlerts) {
              vex.dialog.alert({
                message: '<p class="text-center">Nenhuma unidade de conservação / terra indígena corresponde à pesquisa!</p>',
                buttons: [{
                  type: 'submit',
                  text: 'Ok',
                  className: 'bdqueimadas-btn'
                }]
              });
            }
          }
        }
      });
    };

    /**
     * Returns the city corresponding to the city filter.
     * @param {boolean} showAlerts - Flag that indicates if the alerts should be shown
     * @param {boolean} async - Flag that indicates if the ajax request should be asynchronous
     *
     * @private
     * @function searchForCities
     * @memberof BDQueimadas
     * @inner
     */
    var searchForCities = function(showAlerts, async) {
      var countriesAndStates = getSpatialData(0);

      $.ajax({
        url: Utils.getBaseUrl() + "search-for-cities",
        type: "GET",
        async: async,
        data: {
          value: $('#city').val(),
          countries: (countriesAndStates.countries !== "" ? countriesAndStates.countries : countriesAndStates.allCountries),
          states: countriesAndStates.states,
          minLength: 1
        },
        success: function(data) {
          if(data.length > 0) {
            $('#city').val(data[0].label);
            $('#city-attributes-table').val(data[0].label);

            $('#city').data('value', data[0].value.id);

            $('#filter-button').click();
          } else {
            Filter.setCity(null);
            $('#city').data('value', null);

            if(showAlerts) {
              vex.dialog.alert({
                message: '<p class="text-center">Nenhum município corresponde à pesquisa!</p>',
                buttons: [{
                  type: 'submit',
                  text: 'Ok',
                  className: 'bdqueimadas-btn'
                }]
              });
            }
          }
        }
      });
    };

    /**
     * Returns the countries, states and cities to be filtered.
     * @param {integer} filter - Parameter that indicates witch filter should be used
     * @returns {object} return - Countries, states and cities data
     *
     * @private
     * @function getSpatialData
     * @memberof BDQueimadas
     * @inner
     */
    var getSpatialData = function(filter) {
      var continentsId = '#continents';
      var countriesId = '#countries';
      var statesId = '#states';
      var citiesId = '#city';

      if(filter === 1) {
        continentsId += '-attributes-table';
        countriesId += '-attributes-table';
        statesId += '-attributes-table';
        citiesId += '-attributes-table';
      } else if(filter === 2) {
        continentsId += '-export';
        countriesId += '-export';
        statesId += '-export';
        citiesId += '-export';
      }

      var continent = $(continentsId).val();
      var countries = $(countriesId).val() === null || (Utils.stringInArray($(countriesId).val(), "") || $(countriesId).val().length === 0) ? [] : $(countriesId).val();
      var states = $(statesId).val() === null || Utils.stringInArray($(statesId).val(), "") || $(statesId).val().length === 0 ? [] : $(statesId).val();

      var filterStates = [];
      var specialRegions = [];

      $(statesId + ' > option').each(function() {
        if(Utils.stringInArray(states, $(this).val()) && $(this).data('special-region') !== undefined && $(this).data('special-region')) {
          specialRegions.push($(this).val());
        } else if(Utils.stringInArray(states, $(this).val()) && ($(this).data('special-region') === undefined || !$(this).data('special-region'))) {
          filterStates.push($(this).val());
        }
      });

      var specialRegionsData = Filter.createSpecialRegionsArrays(specialRegions);

      countries = countries.toString();

      var specialRegionsCountriesJson = JSON.parse(JSON.stringify(specialRegionsData.specialRegionsCountries));

      if(countries.length > 0) {
        var arrayOne = JSON.parse(JSON.stringify(countries));
        var arrayTwo = JSON.parse(JSON.stringify(specialRegionsCountriesJson));

        var arrayCountries = $.merge(arrayOne, arrayTwo);

        states = JSON.parse(JSON.stringify(filterStates));
        states = states.toString();

        var specialRegionsStatesJson = JSON.parse(JSON.stringify(specialRegionsData.specialRegionsStates));

        var filterCity = $(citiesId).data('value') !== undefined && $(citiesId).data('value') !== null && $(citiesId).data('value') !== '' ? $(citiesId).data('value') : Filter.getCity();
        var cities = filterCity !== null ? $.merge(specialRegionsData.specialRegionsCities, [filterCity]) : specialRegionsData.specialRegionsCities;
        var citiesString = cities !== null ? cities.toString() : '';

        if(states.length > 0) {
          var arrayOne = JSON.parse(JSON.stringify(states));
          var arrayTwo = JSON.parse(JSON.stringify(specialRegionsStatesJson));

          var arrayStates = $.merge(arrayOne, arrayTwo);

          return {
            continent: continent,
            allCountries: arrayCountries.toString(),
            countries: arrayCountries.toString(),
            states: arrayStates.toString(),
            cities: citiesString
          };
        } else {
          return {
            continent: continent,
            allCountries: arrayCountries.toString(),
            countries: arrayCountries.toString(),
            states: specialRegionsStatesJson.toString(),
            cities: citiesString
          };
        }
      } else {
        var city = $(citiesId).data('value') !== undefined && $(citiesId).data('value') !== null && $(citiesId).data('value') !== '' ? $(citiesId).data('value') : (Filter.getCity() !== null ? Filter.getCity() : '');

        return {
          continent: continent,
          allCountries: specialRegionsCountriesJson.toString(),
          countries: "",
          states: "",
          cities: city
        };
      }
    };

    /**
     * Loads external plugins.
     *
     * @private
     * @function loadPlugins
     * @memberof BDQueimadas
     * @inner
     */
    var loadPlugins = function() {
      $(".date").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});
      $(".time").inputmask("99:99", {"placeholder": "hh:mm"});

      var datePickerOptions = $.extend(true, {}, Utils.getConfigurations().applicationConfigurations.DatePickerDefaultOptions);

      datePickerOptions['onSelect'] = function (date) {
        $('#filter-error-dates').text('');

        var dateFrom = $('#filter-date-from').datepicker('getDate');
        var dateTo = $('#filter-date-to').datepicker('getDate');

        if(dateTo !== null && dateFrom !== null) {
          var timeDiffBetweenDates = Math.abs(dateTo.getTime() - dateFrom.getTime());
          var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));
        } else {
          var diffDaysBetweenDates = 0;
        }

        if(dateFrom === null) {
          $('#filter-error-dates').text('A data inicial deve ser preenchida primeiro!');
          $("#filter-date-to").val('');
        } else if(diffDaysBetweenDates > 366) {
          $('#filter-error-dates').text('O período do filtro deve ser menor ou igual a 366 dias - corrigir!');
          $('#filter-date-from').val('');
          $("#filter-date-to").val('');
        } else {
          if(dateFrom > dateTo && dateTo !== null) {
            $('#filter-error-dates').text('Data final anterior à inicial - corrigir!');
            $("#filter-date-from").val('');
            $("#filter-date-to").val('');
          }
        }
      };

      $("#filter-date-from").datepicker(datePickerOptions);
      $("#filter-date-to").datepicker(datePickerOptions);

      datePickerOptions['onSelect'] = function (date) {
        $('#filter-error-dates-attributes-table').text('');

        var dateFrom = $('#filter-date-from-attributes-table').datepicker('getDate');
        var dateTo = $('#filter-date-to-attributes-table').datepicker('getDate');

        if(dateTo !== null && dateFrom !== null) {
          var timeDiffBetweenDates = Math.abs(dateTo.getTime() - dateFrom.getTime());
          var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));
        } else {
          var diffDaysBetweenDates = 0;
        }

        if(dateFrom === null) {
          $('#filter-error-dates-attributes-table').text('A data inicial deve ser preenchida primeiro!');
          $("#filter-date-to-attributes-table").val('');
        } else if(diffDaysBetweenDates > 366) {
          $('#filter-error-dates-attributes-table').text('O período do filtro deve ser menor ou igual a 366 dias - corrigir!');
          $('#filter-date-from-attributes-table').val('');
          $('#filter-date-to-attributes-table').val('');
        } else {
          if(dateFrom > dateTo && dateTo !== null) {
            $('#filter-error-dates-attributes-table').text('Data final anterior à inicial - corrigir!');
            $("#filter-date-from-attributes-table").val('');
            $("#filter-date-to-attributes-table").val('');
          }
        }
      };

      $("#filter-date-from-attributes-table").datepicker(datePickerOptions);
      $("#filter-date-to-attributes-table").datepicker(datePickerOptions);

      datePickerOptions['onSelect'] = function (date) {
        $('#filter-error-dates-graphics').text('');

        var dateFrom = $('#filter-date-from-graphics').datepicker('getDate');
        var dateTo = $('#filter-date-to-graphics').datepicker('getDate');

        if(dateTo !== null && dateFrom !== null) {
          var timeDiffBetweenDates = Math.abs(dateTo.getTime() - dateFrom.getTime());
          var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));
        } else {
          var diffDaysBetweenDates = 0;
        }

        if(dateFrom === null) {
          $('#filter-error-dates-graphics').text('A data inicial deve ser preenchida primeiro!');
          $("#filter-date-to-graphics").val('');
        } else if(diffDaysBetweenDates > 366) {
          $('#filter-error-dates-graphics').text('O período do filtro deve ser menor ou igual a 366 dias - corrigir!');
          $('#filter-date-from-graphics').val('');
          $('#filter-date-to-graphics').val('');
        } else {
          if(dateFrom > dateTo && dateTo !== null) {
            $('#filter-error-dates-graphics').text('Data final anterior à inicial - corrigir!');
            $("#filter-date-from-graphics").val('');
            $("#filter-date-to-graphics").val('');
          }
        }
      };

      $("#filter-date-from-graphics").datepicker(datePickerOptions);
      $("#filter-date-to-graphics").datepicker(datePickerOptions);

      $(".sidebar-menu").mousemove(function(e) {
        $(".sidebar-menu").scrollTop(function(i, v) {
          var h = $(window).height();
          var y = e.clientY - h / 2;

          return v + y * 0.004;
        });
      });

      $('#pas').autocomplete({
        minLength: 4,
        source: function(request, response) {
          $.get(Utils.getBaseUrl() + "search-for-pas", {
            value: request.term,
            minLength: 4
          }, function(data) {
            response(data);
          });
        },
        select: function(event, ui) {
          event.preventDefault();

          $('#pas').val(ui.item.label);
          $('#pas-attributes-table').val(ui.item.label);

          Filter.setProtectedArea({
            id: ui.item.value.id,
            type: ui.item.value.type
          });

          Utils.getSocket().emit('spatialFilterRequest', { key: 'ProtectedArea', id: ui.item.value.id, type: ui.item.value.type });
        }
      });

      $('#pas-attributes-table').autocomplete({
        minLength: 4,
        source: function(request, response) {
          $.get(Utils.getBaseUrl() + "search-for-pas", {
            value: request.term,
            minLength: 4
          }, function(data) {
            response(data);
          });
        },
        select: function(event, ui) {
          event.preventDefault();

          $('#pas-attributes-table').val(ui.item.label);

          $('#pas-attributes-table').data('value', JSON.stringify({
            id: ui.item.value.id,
            type: ui.item.value.type
          }));

          $('#filter-button-attributes-table').click();
        }
      });

      $('#city').autocomplete({
        minLength: 4,
        source: function(request, response) {
          var countriesAndStates = getSpatialData(0);

          $.ajax({
            url: Utils.getBaseUrl() + "search-for-cities",
            dataType: "json",
            data: {
              minLength: 4,
              value: request.term,
              countries: (countriesAndStates.countries !== "" ? countriesAndStates.countries : countriesAndStates.allCountries),
              states: countriesAndStates.states
            },
            success: function(data) {
              response(data);
            }
          });
        },
        select: function(event, ui) {
          event.preventDefault();

          $('#city').val(ui.item.label);
          $('#city-attributes-table').val(ui.item.label);

          $('#city').data('value', ui.item.value.id);

          $('#filter-button').click();
        }
      });

      $('#city-attributes-table').autocomplete({
        minLength: 4,
        source: function(request, response) {
          var countriesAndStates = getSpatialData(1);

          $.ajax({
            url: Utils.getBaseUrl() + "search-for-cities",
            dataType: "json",
            data: {
              minLength: 4,
              value: request.term,
              countries: (countriesAndStates.countries !== "" ? countriesAndStates.countries : countriesAndStates.allCountries),
              states: countriesAndStates.states
            },
            success: function(data) {
              response(data);
            }
          });
        },
        select: function(event, ui) {
          event.preventDefault();

          $('#city-attributes-table').val(ui.item.label);
          $('#city-attributes-table').data('value', ui.item.value.id);

          $('#filter-button-attributes-table').click();
        }
      });
    };

    /**
     * Opens the left content box background.
     * @param {string} leftContentBoxButton - Id of the left content box button corresponding to the active box
     * @param {string} leftContentBox - Id of the active left content box
     *
     * @private
     * @function openLeftContentBoxBackground
     * @memberof BDQueimadas
     * @inner
     */
    var openLeftContentBoxBackground = function(leftContentBoxButton, leftContentBox) {
      var width = '';
      var left = '30px';

      if(leftContentBox !== '' && $("#" + leftContentBox).hasClass('fullscreen')) {
        width = '100%';
      } else {
        width = '370px';
      }

      $("#left-content-box-background").addClass('active');
      $("#left-content-box-background").attr('leftContentBoxButton', leftContentBoxButton);
      $("#left-content-box-background").animate({ width: width, left: left }, { duration: 300, queue: false });
    };

    /**
     * Closes the left content box background.
     *
     * @private
     * @function closeLeftContentBoxBackground
     * @memberof BDQueimadas
     * @inner
     */
    var closeLeftContentBoxBackground = function() {
      $("#left-content-box-background").removeClass('active');
      $("#left-content-box-background").animate({ width: '350px', left: '-350px' }, { duration: 300, queue: false });
      $("#left-content-box-background").attr('leftContentBoxButton', '');
    };

    /**
     * Opens the left content box corresponding to the received id.
     * @param {string} leftContentBox - Id of the left content box to be opened
     * @param {string} headerText - Content header text
     *
     * @private
     * @function openLeftContentBox
     * @memberof BDQueimadas
     * @inner
     */
    var openLeftContentBox = function(leftContentBox, headerText) {
      $("#" + leftContentBox).addClass('active');
      $("#" + leftContentBox).animate({ left: '50px' }, { duration: 300, queue: false });
      $("#page-title > .dynamic-text").html(headerText);
      $("#page-second-title").show();
    };

    /**
     * Adjusts the left content box size corresponding to the received id, accordingly with the left menu width.
     * @param {string} id - Left content box id
     *
     * @private
     * @function adjustLeftContentBoxSize
     * @memberof BDQueimadas
     * @inner
     */
    var adjustLeftContentBoxSize = function(id) {
      if($("#" + id).css('left') === '230px') {
        $("#" + id).animate({ left: '50px' }, { duration: 250, queue: false });
        if($("#" + id).hasClass('fullscreen')) $("#" + id).removeClass('fullmenu');
      } else if($("#" + id).css('left') === '210px') {
        $("#" + id).animate({ left: '30px' }, { duration: 250, queue: false });
        if($("#" + id).hasClass('fullscreen')) $("#" + id).removeClass('fullmenu');
      } else if($("#" + id).css('left') === '50px') {
        $("#" + id).animate({ left: '230px' }, { duration: 400, queue: false });
        if($("#" + id).hasClass('fullscreen')) $("#" + id).addClass('fullmenu');
      } else {
        $("#" + id).animate({ left: '210px' }, { duration: 400, queue: false });
        if($("#" + id).hasClass('fullscreen')) $("#" + id).addClass('fullmenu');
      }
    };

    /**
     * Closes all the left content boxes.
     *
     * @private
     * @function closeAllLeftContentBoxes
     * @memberof BDQueimadas
     * @inner
     */
    var closeAllLeftContentBoxes = function() {
      $("#page-title > .dynamic-text").html("Banco de Dados de Queimadas");
      $("#page-second-title").show();
      $(".left-content-box").removeClass('active');
      $(".left-content-box").removeClass('fullmenu');
      $(".left-content-box").animate({ left: '-100%' }, { duration: 300, queue: false });
    };

    /**
     * Updates the variables that keep DOM elements sizes.
     *
     * @private
     * @function updateSizeVars
     * @memberof BDQueimadas
     * @inner
     */
    var updateSizeVars = function() {
      memberHeight = $(window).outerHeight();
      memberHeaderHeight = $('.main-header').outerHeight();
      memberNavbarHeight = $('.navbar').outerHeight();
      memberContentHeaderHeight = $(".content-wrapper > .content-header").outerHeight();
      memberMapSubtitleHeight = $('#map-subtitle').outerHeight();
    };

    /**
     * Updates content to full size.
     * @param {int} duration - Duration of the animation
     *
     * @private
     * @function setFullContentSize
     * @memberof BDQueimadas
     * @inner
     */
    var setFullContentSize = function(duration) {
      $('.content-wrapper').animate({ "min-height": (memberHeight - (memberHeaderHeight + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });
      $('#terrama2-map').animate({ "height": (memberHeight - ((memberHeaderHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });

      $('#box-attributes-table').animate({ "height": (memberHeight - ((memberHeaderHeight + memberContentHeaderHeight) + memberReducedFooterHeight + 60)) + "px" }, { duration: duration, queue: false });

      $('.left-content-box').animate({ "height": (memberHeight - ((memberHeaderHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px", "margin-top": (memberHeaderHeight + memberContentHeaderHeight) + "px" }, { duration: duration, queue: false });

      $('.sidebar-menu').animate({ "max-height": (memberHeight - ((memberHeaderHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });
    };

    /**
     * Updates content to reduced size.
     * @param {int} duration - Duration of the animation
     *
     * @private
     * @function setReducedContentSize
     * @memberof BDQueimadas
     * @inner
     */
    var setReducedContentSize = function(duration) {
      $('.content-wrapper').animate({ "min-height": (memberHeight - (memberNavbarHeight + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });
      $('#terrama2-map').animate({ "height": (memberHeight - ((memberNavbarHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });

      $('#box-attributes-table').animate({ "height": (memberHeight - ((memberNavbarHeight + memberContentHeaderHeight) + memberReducedFooterHeight + 60)) + "px" }, { duration: duration, queue: false });

      $('.left-content-box').animate({ "height": (memberHeight - ((memberNavbarHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px", "margin-top": (memberNavbarHeight + memberContentHeaderHeight) + "px" }, { duration: duration, queue: false });

      $('.sidebar-menu').animate({ "max-height": (memberHeight - ((memberNavbarHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });
    };

    /**
     * Returns the names of the visible layers.
     *
     * @private
     * @function getVisibleLayers
     * @memberof BDQueimadas
     * @inner
     */
    var getVisibleLayers = function() {
      var visibleLayers = Map.getVisibleLayers();

      if($('#filter-date-from').val() !== "" && $('#filter-date-to').val() !== "") {
        var html = $('#filter-date-from').val() + ' - ' + $('#filter-date-to').val() + '<br/>';
      } else {
        var html = 'Período Inválido<br/>';
      }

      var visibleLayersLength = visibleLayers.length;

      if(visibleLayersLength > 0) {
        for(var i = 0; i < visibleLayersLength; i++) {
          if(visibleLayers[i].parentName !== null) html += visibleLayers[i].parentName;
          html += $('#' + visibleLayers[i].elementId + ' > span').text() + '<br/>';
        }
      } else {
        html = '<strong>Nenhuma camada a ser exibida.</strong>';
      }

      return html;
    };

    /**
     * Initializes the necessary features.
     * @param {json} configurations - Configurations object
     * @param {function} callbackFunction - Callback function to be executed when all the components are loaded
     *
     * @function init
     * @memberof BDQueimadas
     * @inner
     */
    var init = function() {
      $(document).ready(function() {
        memberButtonBlinkingInterval = setInterval(function() {
          if($("#layer-explorer-and-filter-button").hasClass('blink')) {
            $("#layer-explorer-and-filter-button").removeClass('blink');

            $("#layer-explorer-and-filter-button > a > i").css('color', '#172938');
            $("#layer-explorer-and-filter-button > a > div").css('color', '#172938');
            $("#layer-explorer-and-filter-button > a").css('background-color', '#ffffff');
          } else {
            $("#layer-explorer-and-filter-button").addClass('blink');

            $("#layer-explorer-and-filter-button > a > i").css('color', '#ffffff');
            $("#layer-explorer-and-filter-button > a > div").css('color', '#ffffff');
            $("#layer-explorer-and-filter-button > a").css('background-color', '#f8b802');
          }
        }, 600);

        Utils.getSocket().emit('piwikDataRequest');

        setTimeout(function() {
          $('#footer-brasil a').attr('target', '_blank');
          $('.ol-viewport a').attr('target', '_blank');
        }, 2000);

        updateSizeVars();
        setReducedContentSize(300);

        loadEvents();
        loadSocketsListeners();
        loadPlugins();

        TerraMA2WebComponents.MapDisplay.updateMapSize();

        vex.dialog.alert({
          message: '<p class="text-center"><strong>Atenção!</strong><br/><br/>Esta aplicação está em <strong>fase de desenvolvimento</strong>. Ela está disponível para fins de teste e coleta de sugestões e críticas sobre suas funcionalidades.<br/><br/>No mapa com a última imagem do satélite NPP, cada cruzinha indica uma detecção de fogo na vegetação.</p>',
          buttons: [{
            type: 'submit',
            text: 'Ok, entendi',
            className: 'bdqueimadas-btn bdqueimadas-initial-alert'
          }]
        });

        setTimeout(function() {
          $('.bdqueimadas-initial-alert').click();
        }, 15000);
      });
    };

    return {
    	init: init
    };
  }
);
