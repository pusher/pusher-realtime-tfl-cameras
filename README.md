# Realtime TfL Traffic Camera API

[Pusher](http://pusher.com) Realtime TfL Traffic Camera API, allowing you to subscribe to a feed of traffic cameras in London with automatic updates.

This API is powered by the [official TfL traffic cameras feed](https://www.tfl.gov.uk/info-for/open-data-users/our-feeds?intcmp=3671#on-this-page-3).

## API overview

Here is an overview of the API:

- The Pusher application key for the Realtime TfL Traffic Camera API is `f1b8177ecbc7a66de0c7`
- New posts are published to the `cameras` [channel](http://pusher.com/docs/client_api_guide/client_channels) using the `cameras-update` [event](http://pusher.com/docs/client_api_guide/client_events)
- Messages are formatted using a pipe-delimited string of updated camera IDs:

```javascript
0000101251|0000101260|0000101301|0000101350|...
```

- Initial camera data can be requested [via the `/cameras` endpoint](http://realtime-tfl-cameras.herokuapp.com/cameras):

```javascript
{
  "1.01251": {
    "corridor": true,
    "location": "Old Street e of Vince St",
    "currentview": true,
    "file": "0000101251.jpg",
    "capturetime": "2014-10-13T14:06:00.000Z",
    "easting": 532899,
    "northing": 182552,
    "lat": 51.52625,
    "lng": -0.08563431,
    "osgr": "TQ329826",
    "postcode": "EC1V 9HB",
    "@id": 1.01251,
    "@available": true
  },
  "1.01252": {
    "corridor": true,
    "location": "Curtain Rd / Old Street",
    "currentview": true,
    "file": "0000101252.jpg",
    "capturetime": "2014-10-13T14:05:46.000Z",
    "easting": 533252,
    "northing": 182647,
    "lat": 51.52702,
    "lng": -0.08051296,
    "osgr": "TQ333826",
    "postcode": "EC1V 9LE",
    "@id": 1.01252,
    "@available": true
  },
  ...
}
```


## Using the API

The Realtime TfL Traffic Camera API has been built with simplicity in mind. All you need to do is subscribe using [one of Pusher's free platform libraries](http://pusher.com/docs/libraries) and decide what you want to do with each camera update.

[Here's an example](http://jsbin.com/mazaf/3/edit?html,js,console) that uses JavaScript and outputs the URL of the first camera in each update to the browser console (you may have to wait a few minutes for the next update):

```html
<!-- Include the Pusher JavaScript library -->
<script src="http://js.pusher.com/2.2/pusher.min.js"></script>

<script>
  // Open a Pusher connection to the Realtime TfL Traffic Camera API
  var pusher = new Pusher("f1b8177ecbc7a66de0c7");

  var channel = pusher.subscribe("cameras");
  
  var tflURL = "http://tfl.gov.uk/tfl/livetravelnews/trafficcams/cctv/";

  // Listen for new updates
  channel.bind("cameras-update", function(cameras) {
    var camerasArr = cameras.split("|");
    console.log(tflURL + camerasArr[0] + ".jpg");
  });
</script>
```