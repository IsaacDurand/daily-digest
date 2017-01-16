// Run this file after running seed-database.
// I can run this file without the server on.
var models = require('./models.js');
var Exchange = models.Exchange;
var User = models.User;

var secrets = require('./secrets');
var twilio = require('twilio');

// TODO: Move client creation to a separate module?
var client = twilio(secrets.accountSid, secrets.authToken);

// Eventually, I want to call this function in a more sophisticated way.
// Forcing this sync will cause an error because I can't drop the user table
// without first dropping the exchange table.
// It may still delete rows, though.
models.sequelize.sync()
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

// create exchange record
function createExchange(err, message) {
  if (!err) {
    Exchange.create({
      questionText: message.body,
      questionMessageSid: message.sid,
      UserPhoneNumber: trimPhoneNumber(message.to)
    })
      .then(function(exchange) {

        // TODO: Fix this - update user's currentExchange
        // TODO: Is there a simpler way to get the user we want (to follow the
        // foreign key)?
        User.findById(exchange.get('UserPhoneNumber'))
          .then(function(user) {
            if (user) {
              var rv = user.set('CurrentExchangeId', exchange.get('id'))
              // console.log('rv', rv); // rv is correct
                .save()
                .then(function(user) {
                  console.log('Save successful');
                });
            }
          });
      });
  }
}

function trimPhoneNumber(phoneNumber) {
  var rv = '';

  if (phoneNumber.length === 12 && phoneNumber.slice(0, 2) === '+1') {
    rv = phoneNumber.slice(2);
  }

  return rv;
}
