// Run this file after running seed-database.
// I can run this file without the server on.
var models = require('./models.js');
var Exchange = models.Exchange;
var secrets = require('./secrets');
var twilio = require('twilio');

// TODO: Move client creation to a separate module?
var client = twilio(secrets.accountSid, secrets.authToken);

// TODO: Fix this
// Why am I going back and forth between
// ER_BAD_NULL_ERROR: Column 'answerMessageSid' cannot be null
// and
// ER_NO_DEFAULT_FOR_FIELD: Field 'answerMessageSid' doesn't have a default value?

// Forcing the sync adds a new error:
// ER_NO_REFERENCED_ROW_2: Cannot add or update a child row: a foreign key constraint fails (`daily_debrief`.`exchanges`, CONSTRAINT `exchanges_ibfk_1` FOREIGN KEY (`UserPhoneNumber`) REFERENCES `users` (`phoneNumber`) ON DELETE NO ACTION ON UPDATE CASCADE

// Eventually, I want to call this function in a more sophisticated way.
models.sequelize.sync({force: true})
  .then(function() {
    sendQuestion('How are you?', createExchange);
  });

// send SMS
function sendQuestion(question, callback) {
  client.messages.create({
    to: secrets.myMobileNumber,
    from: secrets.myTwilioNumber,
    body: question
  }, callback);
}

function printMessageInfo(err, message) {
  if (!err) console.log(message);
}

// TODO: replace printMessageInfo with a more interesting callback - one that
// creates a new exchange record.

// create exchange record
function createExchange(err, message) {
  if (!err) {
    Exchange.create({
      questionText: message.body,
      questionMessageSid: message.sid,
      UserPhoneNumber: trimPhoneNumber(message.to)
    })
      .then(function(exchange) {
        console.log(exchange);
      });
  }
}

function trimPhoneNumber(phoneNumber) {
  var rv = '';

  if (phoneNumber.length === 12 && phoneNumber.slice(0, 2) === '+1') {
    rv = phoneNumber.slice(2);
  }

  console.log('rv', rv);
  return rv;
}
