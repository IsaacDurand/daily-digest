var http = require('http');
var express = require('express');
var twilio = require('twilio');
var bodyParser = require('body-parser');

var app = express();
var options = {root: __dirname};

app.get('/', function(req, res) {
  res.sendFile('index.html', options);
});

app.get('/main.js', function(req, res) {
  res.sendFile('main.js', options);
});

app.use(bodyParser.urlencoded());

app.post('/', function(req, res) {
  // I'm getting something here, but it's not exactly in the format I want.
  // TODO: Fix the format of this data, and send it as an SMS to myself
  console.log(req.body);
  res.send('message received');
});

app.post('/sms', function(req, res) {
  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse();
  twiml.message('The Robots are coming! Head for the hills!');
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, function () {
  console.log("Express server listening on port 1337");
});
