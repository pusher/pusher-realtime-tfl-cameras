var request = require("request");
var fs = require("fs");
var mkdirp = require("mkdirp");
var getDirName = require("path").dirname;
var parseArgs = require('minimist');

var argv = parseArgs(process.argv.slice(2));

// Required arguments
if (!argv.camera) {
  console.log("Required arguments missing");
  return;
}

var cameraURL = "http://tfl.gov.uk/tfl/livetravelnews/trafficcams/cctv/" + argv.camera;
var cameraHeader;
var startTime = Date.now();
var requestTimer = 30000;

console.log(cameraURL);

var getHeader = function(url) {
  var options = {
    url: url,
    method: "HEAD",
    timeout: 10000
  };

  return request(options, onHeadResponse);
};

var onHeadResponse = function (error, response) {
  if (!response || !response.headers["last-modified"]) {
    setTimeout(function() {
      getHeader(cameraURL);
    }, requestTimer);
    return;
  }

  console.log(response.headers["last-modified"]);

  if (!cameraHeader || cameraHeader["last-modified"] != response.headers["last-modified"]) {
    console.log("Update camera");
    console.log(response.headers["last-modified"]);

    cameraHeader = response.headers;
    
    setImmediate(function() {
      getImage(cameraURL);
    });
  } else {
    setTimeout(function() {
      getHeader(cameraURL);
    }, requestTimer);
  }
};

var getImage = function(url) {
  var options = {
    url: url,
    method: "GET",
    encoding: "binary",
    timeout: requestTimer
  };

  return request(options, onGetResponse);
};

var onGetResponse = function (error, response, body) {
  var cameraInfo = /([\d]+)\.jpg/g.exec(response.request.uri.pathname);
  var lastModified = new Date(response.headers["last-modified"]);

  var filePath = "camera/" + cameraInfo[1] + "/" + startTime + "/" + cameraInfo[1] + "_" + lastModified.getTime() + ".jpg";

  console.log(filePath);
  console.log(getDirName(filePath));

  mkdirp(getDirName(filePath), function (err) {
    if (err) {
      console.log(err);
      return;
    }

    fs.writeFile(filePath, body, 'binary', function(err) {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log("The file was saved!");

        setTimeout(function() {
          getHeader(cameraURL);
        }, requestTimer);
      }
    });
  });
};

getHeader(cameraURL);