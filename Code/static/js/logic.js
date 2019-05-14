function perc2color(perc) {
  var r, g, b = 0;
  if(perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  }
  else {
    g = 255;
    r = Math.round(510 - 5.10 * perc);
  }
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
};

function createMap(earthquakefeatures) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create an overlayMaps object to hold the earthquakefeatures layer
  var overlayMaps = {
    "earthquake features": earthquakefeatures
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [39.8283, -98.5795],
    zoom: 2,
    layers: [lightmap, earthquakefeatures]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5, 6],
          labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + perc2color(100 - (grades[i] + 1)/8* 100) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(map);

}

function createMarkers(response) {

  // Pull the "features" property off of response.data
  var features = response.features;

  // Initialize an array to hold earthquake markers
  var earthquakeMarkers = [];

  // Loop through the features array
  for (var index = 0; index < features.length; index++) {
    var feature = features[index];
  //epoch time to datetime
    var earthquakeTime = new Date(0);
    earthquakeTime.setUTCSeconds(feature.properties.time) ;

    var colorPerc = (feature.properties.mag / 8) * 100;

    // For each feature, create a marker and bind a popup with the feature's name
    var earthquakeMarker = L.circle([feature.geometry.coordinates[1],
      feature.geometry.coordinates[0]],
      feature.properties.sig * 400,
      { fillColor: perc2color(100 - colorPerc), opacity: 1, color: "black", fillOpacity: .7 , weight : .3})
      .bindPopup("<h3>" + feature.properties.title + "<h3><h3>Magnitude: " + feature.properties.mag + "<h3><h3>Time: " + earthquakeTime + "<h3><h3>Significance: " + feature.properties.sig + "<h3>");

    // Add the marker to the earthquakeMarkers array
    earthquakeMarkers.push(earthquakeMarker);
  }

  // Create a layer group made from the earthquake markers array, pass it into the createMap function
  createMap(L.layerGroup(earthquakeMarkers));
}





// Perform an API call to the Citi earthquake API to get feature information. Call createMarkers when complete
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", createMarkers);
