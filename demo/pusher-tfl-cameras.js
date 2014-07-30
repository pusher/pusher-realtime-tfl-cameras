// Enable pusher logging - don't include this in production
// Pusher.log = function(message) {
//   if (window.console && window.console.log) {
//     window.console.log(message);
//   }
// };

var tflURL = "http://tfl.gov.uk/tfl/livetravelnews/trafficcams/cctv/";
var cameras = document.querySelector(".cameras");

var pusher = new Pusher("f1b8177ecbc7a66de0c7");
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
      cameras.appendChild(img);
      newCameras++;
    }

    img.src = tflURL + url + ".jpg?" + Date.now();
  });

  console.log(cameraURLs.length + " updated cameras");
  console.log(newCameras + " new cameras");
  console.log(document.getElementsByClassName("camera-feed").length - newCameras + " existing cameras");
});