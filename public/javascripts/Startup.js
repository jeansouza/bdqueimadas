//$.blockUI({ message: '<h3>Inicializando o BDQueimadas...</h3>' });

requirejs.config({
  baseUrl: BASE_URL + 'javascripts',
  paths: {
    TerraMA2WebComponents: BASE_URL + 'externals/TerraMA2WebComponents/TerraMA2WebComponents.min'
  }
});

requirejs(
  [
    'BDQueimadas',
    'components/Utils',
    'components/Filter',
    'components/AttributesTable',
    'components/Graphics',
    'components/Map',
    'TerraMA2WebComponents'
  ],
  function(BDQueimadas, Utils, Filter, AttributesTable, Graphics, Map, TerraMA2WebComponents) {
    TerraMA2WebComponents.LayerExplorer.init();
    TerraMA2WebComponents.MapDisplay.init();

    if(TerraMA2WebComponents.MapDisplay.addOSMLayer('osm', 'OpenStreetMap', false, 'terrama2-layerexplorer'))
      TerraMA2WebComponents.LayerExplorer.addLayersFromMap('osm', 'terrama2-layerexplorer');

    if(TerraMA2WebComponents.MapDisplay.addMapQuestSatelliteLayer('mqt', 'MapQuest', true, 'terrama2-layerexplorer'))
      TerraMA2WebComponents.LayerExplorer.addLayersFromMap('mqt', 'terrama2-layerexplorer');

    //TerraMA2WebComponents.MapDisplay.addCapabilitiesLayers('http://localhost:9095/geoserver/ows?service=WMS&request=getCapabilities', 'http://localhost:9095/geoserver/ows', 'geoserver', 'local', 'Local Server', function() {
    //  TerraMA2WebComponents.LayerExplorer.addLayersFromMap('local', 'terrama2-layerexplorer');
    //});

    TerraMA2WebComponents.MapDisplay.disableDoubleClickZoom();
    TerraMA2WebComponents.MapDisplay.addMousePosition();
    TerraMA2WebComponents.MapDisplay.addScale();

    TerraMA2WebComponents.MapDisplay.setLayersStartLoadingFunction(function() {
      if($('#loading-span').hasClass('hide')) $('#loading-span').removeClass('hide');
    });

    TerraMA2WebComponents.MapDisplay.setLayersEndLoadingFunction(function() {
      if(!$('#loading-span').hasClass('hide')) $('#loading-span').addClass('hide');
    });

    Utils.init(configurations, BASE_URL);
    BDQueimadas.init();
    Filter.init();
    AttributesTable.init();
    Graphics.init();
    Map.init();

    Filter.applyFilter();
    $.event.trigger({type: "updateComponents"});

    $("#date_cont").datepicker();
    $("#lbl_date_cont").click(function(){ $("#date_cont").datepicker("show"); });

    $("#date_cont").on('change', function() {
      alert($(this).val());
    });
  }
);

$('#about-btn').on('click', function() {
  $('#about-dialog').dialog({
    width: 800,
    height: 900,
    modal: true,
    resizable: false,
    draggable: false,
    closeOnEscape: true,
    closeText: "",
    position: { my: 'top', at: 'top+15' }
  });
});
