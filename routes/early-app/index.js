var express = require('express');
var router = express.Router();
var fs = require('fs');
var secrets = require('./../../secrets.js');

// When the interpreter sees 'require('twilio')', it looks for the module ID for
// twilio, which is specified in the "main" field of twilio's package.json.
// Since twilio's package.json specifies a folder (lib), the interpreter runs
// lib/index.js.
var twilio = require('twilio');
var bodyParser = require('body-parser');

// Basically, this client communicates with the Twilio REST API for us so that
// we don't have to send and receive HTTP requests manually. It's a layer of
// abstraction.
var client = twilio(secrets.accountSid, secrets.authToken);
var jsonParser = bodyParser.json();
var urlEncodedParser = bodyParser.urlencoded({extended: false});

var databaseRoot = __dirname + '/database';
var inboundMsgDb = databaseRoot + '/inbound-messages.txt';
var outboundMsgDb = databaseRoot + '/outbound-messages.txt';
var statusDatabase = databaseRoot + '/updates.txt';
var options = {root: __dirname};
var record;
var statusPath = '/status-update';

router.get('/', function(req, res) {
  res.sendFile('index.html', options);
});

router.get('/main.js', function(req, res) {
  res.sendFile('main.js', options);
});

// Allow the user to send an SMS via a form on the website
router.post('/send', jsonParser, function(req, res) {
  var message = req.body.message;

  if (message) {
    // Would it be better to use client.sendMessage?
    // See http://twilio.github.io/twilio-node/#quickstart
    client.messages.create({
      to: secrets.myMobileNumber,
      from: secrets.myTwilioNumber,
      body: message,
      statusCallback: secrets.ngrokUrl + statusPath
    }, function(err, message) {
      if (!err) {

        // Add messages successfully sent to Twilio to my "database"
        // The message object contains a lot of information about the message
        // Twilio created, including whether it has been queued, but not
        // whether it has been sent.
        record = message.sid + '\n' + message.body + '\n' +
          JSON.stringify(message) + '\n\n';
        fs.appendFile(outboundMsgDb, record);
      }
    });
  }

  // TODO: Show success message on front end, or at least improve this response.
  res.send('message received');
});

// Add SMS messages I receive through Twilio to my "database"
router.post('/sms', urlEncodedParser, function(req, res) {

  if (req.body) {
    record = req.body.SmsSid + '\n' + req.body.Body + '\n' +
      JSON.stringify(req.body) + '\n\n';
    fs.appendFile(inboundMsgDb, record);
  }

  // This is from https://www.twilio.com/docs/quickstart/node/programmable-sms
  // #receiving-sms-messages
  // TODO: log these outbound messsages?
  var twiml = new twilio.TwimlResponse();
  twiml.message('The Robots are coming! Head for the hills!');
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

// Update my "database" when I receive an SMS delivery notification from Twilio
router.post(statusPath, urlEncodedParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);

  // What is the difference between SmsStatus and MessageStatus?
  // What about SmsSid vs. MessageSid?
  if (req.body.SmsStatus === 'delivered') {
    record = req.body.SmsSid + '\n' + JSON.stringify(req.body) + '\n\n';
    fs.appendFile(statusDatabase, record);
  }
  res.sendStatus(200);
})

module.exports = router;

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
