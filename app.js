// TODO: Requesting individual camera images will result in faster updates
// - Seems camera feed is updated less often than the images are
// - Comparing new image to existing image to work out if it has changed
// - Could perhaps use headers for checking, then request full image if updated

var _ = require("underscore");
var request = require("request");
var JXON = require("jxon");
var DOMParser = require("xmldom").DOMParser;

var config;
try {
  config = require("./config");
} catch(e) {
  console.log("Failed to find local config, falling back to environment variables");
  config = {
    app_id: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET
  }
}

// --------------------------------------------------------------------
// SET UP PUSHER
// --------------------------------------------------------------------
var Pusher = require("pusher");
var pusher = new Pusher({
  appId: config.app_id,
  key: config.key,
  secret: config.secret
});

// --------------------------------------------------------------------
// TfL
// --------------------------------------------------------------------
var tflURL = "http://www.tfl.gov.uk/tfl/livetravelnews/trafficcams/cctv/jamcams-camera-list.xml";

var lastUpdated;
var cameras = {};

var staleCameras;
var errorRetryTime = 2000;

var onResponse = function(error, response, body) {
  if (error || response.statusCode != 200) {
    console.log("Request failed, re-attempting");
    console.log(error);
    console.log(response);

    errorRetryTime *= 1.5;

    if (errorRetryTime > 30000) {
      errorRetryTime = 30000;
    }

    setTimeout(requestCameras, errorRetryTime);

    return;
  }

  errorTimeout = 2000;
  staleCameras = 0;

  var jxon = JXON.build(new DOMParser().parseFromString(body).documentElement);
  // console.log(JSON.stringify(jxon, null, 2));
  //console.log(JSON.stringify(jxon));

  var header = jxon.header;

  if (header.publishdatetime - lastUpdated === 0) {
    console.log("No change");
    setTimeout(requestCameras, 10000);
    return;
  }

  console.log(header);

  lastUpdated = header.publishdatetime;

  var cameraList = jxon.cameralist;

  var output = [];

  _.each(cameraList.camera, function(camera, index) {
    // Don't use inactive cameras
    // if (!camera["@available"]) {
    //   return;
    // }

    // console.log(camera["@id"], index);
    // console.log("http://tfl.gov.uk" + cameraList.rooturl + camera.file);

    if (!cameras[camera["@id"]]) {
      cameras[camera["@id"]] = camera;
      output.push(camera.file.replace(".jpg", ""));
    // Only update cameras that have changed
    } else if (camera.capturetime - cameras[camera["@id"]].capturetime > 0) {
      output.push(camera.file.replace(".jpg", ""));
    // Camera hasn't been updated
    } else {
      staleCameras++;
    }
  });

  console.log(output.length + " updated cameras");
  console.log(staleCameras + " stale cameras");
  
  var data = output.join("|");

  console.log(data);

  pusher.trigger("cameras", "cameras-update", data);

  setTimeout(requestCameras, 10000);
};

var requestCameras = function() {
  request(tflURL, onResponse);
};

requestCameras();