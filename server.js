var http = require('http');
var express = require('express');
var twilio = require('twilio');
var bodyParser = require('body-parser');
var secrets = require('./secrets.js');

var app = express();
var client = twilio(secrets.accountSid, secrets.authToken);
var options = {root: __dirname};

// console.log(client); // has a lot of stuff :)
// console.log(client.messages); // has get, list, post, and create methods
// I think this basically lets us interact with the Messages list resource.
// We can easily get a message if we have its SID - but what if we don't?

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
    // Would it be better to use client.sendMessage?
    // See http://twilio.github.io/twilio-node/#quickstart
    client.messages.create({
      to: secrets.myMobileNumber,
      from: secrets.myTwilioNumber,
      body: message,
      // Is there any way I can use the statusCallback option before actually
      // deploying this?
      // With the setup below, I can see in Request Bin that my SMS was
      // successfully delivered.
      statusCallback: secrets.requestBinUrl
    }, function(err, message) {
      if (!err) {
        // The message object contains a lot of information about the SMS I just
        // created. However, it doesn't indicate whether the message was
        // actually sent - only that it was queued.
      }
    });
  }

  // TODO: Show success message on front end, or at least improve this response.
  res.send('message received');

  // TODO: See list of the messages I've sent
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
