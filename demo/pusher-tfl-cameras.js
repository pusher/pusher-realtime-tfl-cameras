// Enable pusher logging - don't include this in production
// Pusher.log = function(message) {
//   if (window.console && window.console.log) {
//     window.console.log(message);
//   }
// };

var pusher = new Pusher("f1b8177ecbc7a66de0c7");

var tflURL = "http://tfl.gov.uk/tfl/livetravelnews/trafficcams/cctv/";
var camerasDOM = document.querySelector(".cameras");

// Fit camera container
var scale = window.innerWidth / 14080;
camerasDOM.style.mozTransform = "translateX(-50%) translateY(-50%) translateZ(0) scale(" + scale + ")";
camerasDOM.style.webkitTransform = "translateX(-50%) translateY(-50%) translateZ(0) scale(" + scale + ")";
camerasDOM.style.transform = "translateX(-50%) translateY(-50%) translateZ(0) scale(" + scale + ")";

$.getJSON("/cameras", function(cameras) {
  if (_.size(cameras) > 0) {
    addCameras(cameras);
  }
});

var addCameras = function(cameras) {
  var newCameras = 0;

  _.each(cameras, function(camera, index) {
    var url = camera.file.replace(".jpg", "");
    if (!(img = document.getElementById("camera-" + url))) {
      img = document.createElement("img"); 
      img.id = "camera-" + url;
      img.classList.add("camera-feed");
      camerasDOM.appendChild(img);
      newCameras++;
    }

    // Perform action when image has finished loading
    // img.onload = function() {};

    img.src = tflURL + url + ".jpg?" + Date.now();
  });

  console.log(cameras.length + " updated cameras");
  console.log(newCameras + " new cameras");
  console.log(document.getElementsByClassName("camera-feed").length - newCameras + " existing cameras");

  subscribeToCameras();
};

var subscribeToCameras = function() {
  var channel = pusher.subscribe("cameras");
  channel.bind("cameras-update", function(data) {
    var cameraURLs = data.split("|");
    var newCameras = 0;

    var img;
    _.each(cameraURLs, function(url, index) {
      if (!(img = document.getElementById("camera-" + url))) {
        img = document.createElement("img"); 
        img.id = "camera-" + url;
        img.classList.add("camera-feed");
        camerasDOM.appendChild(img);
        newCameras++;
      }

      // Perform action when image has finished loading
      // img.onload = function() {};

      img.src = tflURL + url + ".jpg?" + Date.now();
    });

    console.log(cameraURLs.length + " updated cameras");
    console.log(newCameras + " new cameras");
    console.log(document.getElementsByClassName("camera-feed").length - newCameras + " existing cameras");
  });
};