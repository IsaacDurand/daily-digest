// Run this file after running seed-database.
// I can run this file without the server on.
var models = require('./models.js');
var Exchange = models.Exchange;
var User = models.User;

var secrets = require('./secrets');
var twilio = require('twilio');
var util = require('./util.js');

// TODO: Move client creation to a separate module?
var client = twilio(secrets.accountSid, secrets.authToken);

// **This is the core of the script.**
// Annoyingly, twilio-node uses Q
// (http://twilio.github.io/twilio-node/#callbacks), while Sequelize uses
// Bluebird
// (http://docs.sequelizejs.com/en/latest/docs/getting-started/#promises).
// Eventually, I want to call this function in a more sophisticated way.
// Forcing this sync will cause an error because I can't drop the user table
// without first dropping the exchange table.
// It may still delete rows, though.
models.sequelize.sync() // returns Bluebird promise
  .then(function() {
    return sendQuestion('How are you?'); // Q promise?
  })
  .then(createExchange) // returns Bluebird promise
  .then(updateUser) // returns Bluebird promise
  .then(function(user) {
    console.log('SUCCESS: message and exchange created, user updated.');
  })
  .catch(util.logError);


// **Helper functions**
// Create a new exchange record for an SMS
function createExchange(message) {
  return Exchange.create({
    questionText: message.body,
    questionMessageSid: message.sid,
    UserPhoneNumber: trimPhoneNumber(message.to)
  });
}

// Send an SMS via Twilio
function sendQuestion(question) {
  return client.messages.create({
    to: secrets.myMobileNumber,
    from: secrets.myTwilioNumber,
    body: question,
    statusCallback: secrets.ngrokUrl + secrets.statusPath
  });
}

// TODO: Move to util
function trimPhoneNumber(phoneNumber) {
  var rv = '';

  if (phoneNumber.length === 12 && phoneNumber.slice(0, 2) === '+1') {
    rv = phoneNumber.slice(2);
  }

  return rv;
}

// TODO: Is there a simpler way to get the user we want (to follow the
// foreign key)?
// Update the CurrentExchangeId of the user associated with this exchange
function updateUser(exchange) {
  return User.findById(exchange.get('UserPhoneNumber')) // Bluebird promise
    .then(function(user) {
      return user.set('CurrentExchangeId', exchange.get('id')).save();
    });
}
