const secrets = require('./secrets.js');

//require the Twilio module and create a REST client
var client = require('twilio')(secrets.accountSid, secrets.authToken);

client.messages.create({
    to: secrets.myMobileNumber,
    from: secrets.myTwilioNumber,
    body: 'Testing 123',
}, function(err, message) {
    console.log(message.sid);
});
