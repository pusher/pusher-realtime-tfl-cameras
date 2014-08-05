// Enable pusher logging - don't include this in production
// Pusher.log = function(message) {
//   if (window.console && window.console.log) {
//     window.console.log(message);
//   }
// };

var pusher = new Pusher("f1b8177ecbc7a66de0c7");

var tflURL = "http://tfl.gov.uk/tfl/livetravelnews/trafficcams/cctv/";
var camerasDOM = document.querySelector(".cameras");

var cols = 40;
var cameraPositions = {};
var ctx = camerasDOM.getContext("2d");

camerasDOM.width = 14080;

// Fit camera container
var scale = window.innerWidth / 14080;
camerasDOM.style.mozTransform = "translateX(-50%) translateY(-50%) scale(" + scale + ")";
camerasDOM.style.webkitTransform = "translateX(-50%) translateY(-50%) scale(" + scale + ")";
camerasDOM.style.transform = "translateX(-50%) translateY(-50%) scale(" + scale + ")";

$.getJSON("/cameras", function(cameras) {
  if (_.size(cameras) > 0) {
    addCameras(cameras);
  }
});

var addCameras = function(cameras) {
  var newCameras = 0;

  // Set canvas height
  camerasDOM.height = Math.ceil(_.size(cameras) / cols) * 288;

  _.each(cameras, function(camera, index) {
    var id = camera.file.replace(".jpg", "");

    cameraPositions[id] = [newCameras - (cols * Math.floor(newCameras / cols)), Math.floor(newCameras / cols)];

    var img = new Image();

    // Perform action when image has finished loading
    img.onload = function() {
      // ctx.fillStyle = "#" + Math.floor(Math.random()*16777215).toString(16);
      // ctx.fillRect(cameraPositions[id][0] * 352, cameraPositions[id][1] * 288, 352, 288);
      ctx.drawImage(img, cameraPositions[id][0] * 352, cameraPositions[id][1] * 288);
      img = undefined;
    };

    img.src = tflURL + id + ".jpg?" + Date.now();

    newCameras++;
  });

  console.log(newCameras + " new cameras");

  subscribeToCameras();
};

var subscribeToCameras = function() {
  var channel = pusher.subscribe("cameras");
  channel.bind("cameras-update", function(data) {
    var cameraURLs = data.split("|");
    var newCameras = 0;

    _.each(cameraURLs, function(id, index) {
      if (!cameraPositions[id]) {
        console.log("Skipping non-existent camera");
        return;
      }

      var img = new Image();

      // Perform action when image has finished loading
      img.onload = function() {
        // ctx.fillStyle = "#" + Math.floor(Math.random()*16777215).toString(16);
        // ctx.fillRect(cameraPositions[id][0] * 352, cameraPositions[id][1] * 288, 352, 288);
        ctx.drawImage(img, cameraPositions[id][0] * 352, cameraPositions[id][1] * 288);
        img = undefined;
      };

      img.src = tflURL + id + ".jpg?" + Date.now();

      newCameras++;
    });

    console.log(cameraURLs.length + " updated cameras");
    console.log(newCameras + " new cameras");
  });
};