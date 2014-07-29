// Enable pusher logging - don't include this in production
Pusher.log = function(message) {
  if (window.console && window.console.log) {
    window.console.log(message);
  }
};

var tflURL = "http://tfl.gov.uk/tfl/livetravelnews/trafficcams/cctv/";
var cameras = document.querySelector(".cameras");

var pusher = new Pusher("f1b8177ecbc7a66de0c7");
var channel = pusher.subscribe("cameras");
channel.bind("cameras-update", function(data) {
  cameras.innerHTML = "";
  
  var cameraURLs = data.split("|");

  var img;
  _.each(cameraURLs, function(url, index) {
    img = document.createElement("img");
    img.src = tflURL + url + ".jpg";
    img.classList.add("camera-feed");

    cameras.appendChild(img);
  });
});