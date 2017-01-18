var models = require('./../models.js');
var express = require('express');
var router = express.Router();
var secrets = require('./../secrets.js');
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});
var updateExchange = require('./../update-exchange.js');
var util = require('./../util.js');

// TODO: Use fs to read my XML file rather than just saving XML to a variable
// here?
var thankYou = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>
      Got it - I've saved your answer. Thanks for taking the time to respond!
    </Message>
</Response>`;

router.get('/', function(req, res) {
  models.User.findAll()
    .then(function(users) {
      res.send(JSON.stringify(users));
    });
});

router.post(secrets.statusPath, urlEncodedParser, function(req, res) {
  updateExchange.saveStatus(req.body.MessageSid, req.body.MessageStatus)
    .then(function(exchange) {
      return res.sendStatus(200); // a server response.
      // As demonstrated below, server responses seem to be thenable.
      // Or is Bluebird somehow "promisifying" the server response?
      // TODO: Understand what's happening here
    })
    .then(function(res) {
      console.log('SUCCESS: Exchange updated and HTTP response sent to Twilio');
    })
    // TODO: Is this catch handling errors correctly? It didn't run when I
    //  messed with the questionMessageSid param given to Exchange.findOne.
    .catch(util.logError);
});

router.post('/answer', urlEncodedParser, function(req, res) {
  var message = req.body;
  var shortPhoneNumber = util.trimPhoneNumber(message.From);
  updateExchange.getCurrent(shortPhoneNumber)
    .then(function(exchangeId) {
      return updateExchange.saveAnswer(exchangeId, message)
    })
    .then(function(exchange) {
      // TODO: Do I have to send an SMS in response to the one Twilio receives?
      return res.send(thankYou);
      // return res.send('Will I get this in an SMS?'); // No, it's not valid Twiml.
      // return res.sendStatus(200); // sends me an SMS with the body 'OK'
    })
    .then(function(res) {
      console.log('SUCCESS: Exchange updated and HTTP response sent to Twilio');
    })
    .catch(util.logError);
});

module.exports = router;
