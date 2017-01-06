var http = require('http');
var fs = require('fs');
var express = require('express');

// When the interpreter sees 'require('twilio')', it looks for the module ID for
// twilio, which is specified in the "main" field of twilio's package.json.
// Since twilio's package.json specifies a folder (lib), the interpreter runs
// lib/index.js.
var twilio = require('twilio');
var bodyParser = require('body-parser');
var secrets = require('./secrets.js');

var app = express();

// Basically, this client communicates with the Twilio REST API for us so that
// we don't have to send and receive HTTP requests manually. It's a layer of
// abstraction.
var client = twilio(secrets.accountSid, secrets.authToken);
var jsonParser = bodyParser.json();
var urlEncodedParser = bodyParser.urlencoded({extended: false});

var databaseRoot = __dirname + '/database';
var messageDatabase = databaseRoot + '/messages.txt';
var statusDatabase = databaseRoot + '/updates.txt';
var options = {root: __dirname};
var record;
var statusCallback = '/status-update';

// console.log(client); // has a lot of stuff :)
// console.log(client.messages); // has get, list, post, and create methods
// I think this basically lets us interact with the Messages list resource.
// We can easily get a message if we have its SID - but what if we don't?

// Show all messages associated with this account
// See https://www.twilio.com/docs/api/rest/message
// client.messages.list(function(err, data) {
//     data.messages.forEach(function(message) {
//         console.log(message.body);
//     });
// });

app.get('/', function(req, res) {
  res.sendFile('index.html', options);
});

app.get('/main.js', function(req, res) {
  res.sendFile('main.js', options);
});

// Allow the user to send an SMS via a form on the website
app.post('/', jsonParser, function(req, res) {
  var message = req.body.message;

  if (message) {
    // Would it be better to use client.sendMessage?
    // See http://twilio.github.io/twilio-node/#quickstart
    client.messages.create({
      to: secrets.myMobileNumber,
      from: secrets.myTwilioNumber,
      body: message,
      statusCallback: secrets.ngrokUrl + statusCallback
    }, function(err, message) {
      if (!err) {

        // Add messages successfully sent to Twilio to my "database"
        // console.log(message);
        // The message object contains a lot of information about the message
        // Twilio created, including whether it has been queued, but not
        // whether it has been sent.
        record = message.sid + '\n' + message.body + '\n' +
          JSON.stringify(message) + '\n\n';
        fs.appendFile(messageDatabase, record);
      }
    });
  }

  // TODO: Show success message on front end, or at least improve this response.
  res.send('message received');
});

app.post(statusCallback, urlEncodedParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);
  // console.log(req.body);

  // What is the difference between SmsStatus and MessageStatus?
  // What about SmsSid vs. MessageSid?
  if (req.body.SmsStatus === 'delivered') {
    record = req.body.SmsSid + '\n' + JSON.stringify(req.body) + '\n\n';
    fs.appendFile(statusDatabase, record);
  }
  res.sendStatus(200);
})

// TODO: See if this is still working. Where did I get the code from?
app.post('/sms', function(req, res) {
  var twiml = new twilio.TwimlResponse();
  twiml.message('The Robots are coming! Head for the hills!');
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, function () {
  console.log("Express server listening on port 1337");
});
