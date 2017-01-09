var http = require('http');
var fs = require('fs');
var express = require('express');
var Sequelize = require('sequelize');

// When the interpreter sees 'require('twilio')', it looks for the module ID for
// twilio, which is specified in the "main" field of twilio's package.json.
// Since twilio's package.json specifies a folder (lib), the interpreter runs
// lib/index.js.
var twilio = require('twilio');
var bodyParser = require('body-parser');
var secrets = require('./secrets.js');

var app = express();
var sequelize = new Sequelize('daily_debrief', secrets.database.username,
 secrets.database.password);

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

// Test the database connection
sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

// Database
// TODO: Turn off database logging in Terminal if I don't want it.
// Define a user model
var User = sequelize.define('user', {
  name: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  phoneNumber: {
    primaryKey: true,
    type: Sequelize.STRING,
    validate: {
      is: /[0-9]{10}/
    }
  }
});

// TODO: Define an exchange model
var Exchange = sequelize.define('exchange', {
  date: {
    type: Sequelize.DATEONLY,
    defaultValue: Sequelize.NOW
  },
  // TODO: Think about whether it makes sense to use foreign keys here
  //(especially for questions, which will be repeated)
  // I don't want questionText to be null, but I suppose it's possible that I
  // could send a blank SMS.
  questionText: {
    type: Sequelize.STRING
  },
  questionMessageSid: {
    allowNull: false,
    type: Sequelize.STRING,
    // https://support.twilio.com/hc/en-us/articles/223134387-What-is-a-Message-SID-
    validate: {
      is: /SM[a-z0-9]{32}/
    }
  },
  answerText: {
    type: Sequelize.STRING
  },
  answerMessageSid: {
    allowNull: false,
    type: Sequelize.STRING,
    validate: {
      is: /SM[0-9a-z]{32}/
    }
  }
});

// TODO: remove the force option if I don't want to delete the table
sequelize.sync({force: true})
  .then(function() {
    User.create({
      name: 'Isaac',
      phoneNumber: secrets.myMobileNumberShort
    });
    User.create({
      name: 'TestUser',
      phoneNumber: '5555555555'
    });
    Exchange.create({
      questionText: 'Sent from your Twilio trial account - The Robots are coming! Head for the hills!',
      questionMessageSid: 'SMc509fec438cc4660f63de77bf608bbf0',
      answerText: 'Again, boy is not body',
      answerMessageSid: 'SM798a525dcf7263f22fea639ccba2f3bd',
      userPhoneNumber: secrets.myMobileNumberShort // This seems to work
    })
  })
  .catch(function(err) {
    console.log('Error:', err);
  });

// Useful: http://docs.sequelizejs.com/en/latest/docs/associations/
// I won't see an error if I omit the line below, but the exchange will save
// without a userPhoneNumber column.
// TODO: Change name of userPhoneNumber column to user and show user's name
// instead of phone number?
Exchange.belongsTo(User);
// TODO: Change name of exchangeId column to currentExchange, and understand
// constraints better.
User.belongsTo(Exchange, {constraints: false});
// TODO: look at the SQL being generated to really understand what's going on

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

http.createServer(app).listen(1337, function () {
  console.log("Express server listening on port 1337");
});
