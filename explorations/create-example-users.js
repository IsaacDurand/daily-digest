"use strict";

var util = require('./../util.js');

module.exports = function createExampleUsers(models, secrets) {
  var User = models.User;
  var Exchange = models.Exchange;

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
    UserPhoneNumber: secrets.myMobileNumberShort // This seems to work
  })
    .then(function(exchange) {
      // Get this user
      User.findOne({
        where: {phoneNumber: exchange.get('UserPhoneNumber')}
      })
        .then(function(user) {
          // user will be null if no match is found
          if (user) {
            user.setCurrentExchange(exchange)
              .then(function(user) {
                console.log('As you can see, user has been updated:\n',
                  user.get());
              })
              .catch(util.logError);
          }
        });

      // Save their currentExchange

      // console.log(exchange.get()); // seems identical to exchange.dataValues
      // TODO: How are these two different?
      // console.log(exchange.get('UserPhoneNumber'));
      // console.log(exchange.getDataValue('UserPhoneNumber'));
    })
    .catch(util.logError);
}
