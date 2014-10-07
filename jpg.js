var fs = require("fs");
// var jpeg = require("jpeg-js");
// var jpegData = fs.readFileSync("cameras/0000104502/0000104502_1408022865000.jpg");
// var rawImageData = jpeg.decode(jpegData);

// console.log(rawImageData);

var convert = require('netpbm').convert;

// var img = "cameras/0000104502/0000104502_1408022865000";
// // var img = "cameras/0000104502/0000104502_1408023094000";
// // var img = "cameras/0000104502/0000104502_1408023226000";
// convert(img + '.jpg', 
//   img + '.png', 
//   { width: 352, height: 288 },
//   function(err) {
//     if (!err) {
//       console.log("Hooray, your image is ready!");
//     }
//   }
// );

var GIFEncoder = require('gifencoder');
var encoder = new GIFEncoder(352, 288);
var pngFileStream = require('png-file-stream');

pngFileStream('cameras/0000104502/*.png')
  .pipe(encoder.createWriteStream({ repeat: 0, delay: 500, quality: 10 }))
  .pipe(fs.createWriteStream('cameras/0000104502/0000104502.gif'));