var http = require('http');
var express = require('express');
var twilio = require('twilio');
var bodyParser = require('body-parser');
var secrets = require('./secrets.js');

var app = express();
var client = twilio(secrets.accountSid, secrets.authToken);
var options = {root: __dirname};

app.get('/', function(req, res) {
  res.sendFile('index.html', options);
});

app.get('/main.js', function(req, res) {
  res.sendFile('main.js', options);
});

app.use(bodyParser.json());

app.post('/', function(req, res) {
  var message = req.body.message;

  if (message) {
    // TODO: Review Twilio docs to understand what's going on here
    client.messages.create({
      to: secrets.myMobileNumber,
      from: secrets.myTwilioNumber,
      body: message,
    }, function(err, message) {
      console.log(message.sid);
    });
  }

  // TODO: Show success message on front end
  res.send('message received');
});

app.post('/sms', function(req, res) {
  var twiml = new twilio.TwimlResponse();
  twiml.message('The Robots are coming! Head for the hills!');
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, function () {
  console.log("Express server listening on port 1337");
});
