var models = require('./../models.js');
var express = require('express');
var router = express.Router();
var secrets = require('./../secrets.js');
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended: false});
var updateExchange = require('./../update-exchange.js');
var util = require('./../util.js');

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

module.exports = router;
