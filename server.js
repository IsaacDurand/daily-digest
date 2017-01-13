var http = require('http');
var fs = require('fs');
var express = require('express');

// When the interpreter sees 'require('twilio')', it looks for the module ID for
// twilio, which is specified in the "main" field of twilio's package.json.
// Since twilio's package.json specifies a folder (lib), the interpreter runs
// lib/index.js.
var twilio = require('twilio');
var bodyParser = require('body-parser');
var createExampleUsers = require('./explorations/create-example-users.js');
// var earlyApp = require('./routes/early-app.js');
var mainApp = require('./routes/index.js');
var models = require('./models.js');
var secrets = require('./secrets.js');
var util = require('./util.js');

var app = express();
var port = 1337;
var server = http.createServer(app);

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
var statusCallback = '/status-update';


// TODO: remove the force option if I don't want to delete the table
// TODO: How do I get all this chaining under control?
models.sequelize.sync({force: true})
  .then(function() {
    console.log("Tables are created. It's now safe to use them.");

    // Uncomment this to see instances added to the database
    createExampleUsers(models, secrets);

    // TODO: Right about here, start saving actual messages.
    // TODO: Start server here?
    server.listen(port, function() {
      console.log('Express server listening on port', port);

      // Here, decide which "mini-app" to use.
      app.use('/', mainApp);
    });
  })
  .catch(util.logError);


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

/*
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
        fs.appendFile(outboundMsgDb, record);
      }
    });
  }

  // TODO: Show success message on front end, or at least improve this response.
  res.send('message received');
});

// Update my "database" when I receive an SMS delivery notification from Twilio
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

// Add SMS messages I receive through Twilio to my "database"
app.post('/sms', urlEncodedParser, function(req, res) {

  // console.log(req.body);
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
*/
