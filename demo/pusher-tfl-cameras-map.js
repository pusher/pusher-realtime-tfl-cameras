// Enable pusher logging - don't include this in production
// Pusher.log = function(message) {
//   if (window.console && window.console.log) {
//     window.console.log(message);
//   }
// };

var tflURL = "http://tfl.gov.uk/tfl/livetravelnews/trafficcams/cctv/";

// Multiple markers hack
// https://github.com/Leaflet/Leaflet/issues/2201
L.Map = L.Map.extend({
  openPopup: function(popup) {
    // this.closePopup();  // just comment this
    this._popup = popup;

    return this.addLayer(popup).fire('popupopen', {
      popup: this._popup
    });
  }
});

var map = L.map("map").setView([51.505, -0.09], 13);
var cameraMarkers = {};

L.tileLayer("https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'examples.map-i87786ca'
}).addTo(map);

$.getJSON("/cameras", function(cameras) {
  if (_.size(cameras) > 0) {
    addCamerasToMap(cameras);
  }
});

var addCamerasToMap = function(cameras) {
  var markers = new L.MarkerClusterGroup();
  var markerLayer = [];

  _.each(cameras, function(camera, index) {
    var id = camera.file.replace(".jpg", "");
    var marker = new L.marker([camera.lat, camera.lng]).bindPopup(cameraMarkerContent(id), {maxWidth: 352});
    
    cameraMarkers[id] = marker;
    markerLayer.push(marker);
  });

  markers.addLayers(markerLayer);
  markers.addTo(map);
};

var cameraMarkerContent = function(id) {
  return '<img src="' + (tflURL + id + '.jpg?' + Date.now()) + '" class="camera-feed" height="288" width="352">';
}

var pusher = new Pusher("f1b8177ecbc7a66de0c7");
var channel = pusher.subscribe("cameras");
channel.bind("cameras-update", function(data) {
  var cameraURLs = data.split("|");
  var newCameras = 0;

  var marker;
  _.each(cameraURLs, function(url, index) {
    marker = cameraMarkers[url];
    marker.setPopupContent(cameraMarkerContent(url));
  });

  console.log(cameraURLs.length + " updated cameras");
  console.log(newCameras + " new cameras");
  console.log(document.getElementsByClassName("camera-feed").length - newCameras + " existing cameras");
});