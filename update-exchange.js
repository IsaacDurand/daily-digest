// TODO: Better name for this file? Something with controller?
// TODO: Organize methods
"use strict";

var updateExchange = {};

// If I only use this file when the server is running, I don't think I need to
// run sequelize.sync.
var models = require('./models.js');
var Exchange = models.Exchange;
var User = models.User;
var AdditionalAnswer = models.AdditionalAnswer;
var Sequelize = models.Sequelize;

updateExchange.saveStatus = function saveStatus(questionMessageSid, status) {

  // TODO: Replace 'now' with a valid timestampe
  // (Sequelize.NOW() is a function, and it returns an object.)
  if (status === 'delivered') var notificationDate = Date.now();
  return Exchange.findOne({where: {questionMessageSid: questionMessageSid}})
    .then(function(exchange) {
      var newValues = {questionMessageStatus: status}
      if (status === 'delivered') {
        newValues.questionDeliveryConfirmedAt = notificationDate;
      }
      return exchange.set(newValues).save();
    });
}

updateExchange.saveAnswer = function saveAnswer(exchangeId, answerMessage,
  answerReceivedAt) {
  return Exchange.findById(exchangeId)
    .then(function(exchange) {

      // TODO: Does it make sense for this check to be in a separate function?
      if (exchange.questionDeliveryConfirmedAt > answerReceivedAt) {
        throw new Error('Answer was received before question delivery was confirmed');
      }
      // TODO: Else save orphan message?

      // TODO: Put everything below this in another method?
      if (exchange.answerText) {
        return updateExchange.createAdditionalAnswer(exchange, answerMessage);
      } else {
        var newValues = {
          answerText: answerMessage.Body,
          answerMessageSid: answerMessage.MessageSid
        };
        return exchange.set(newValues).save();
      }
    })
}

// TODO: See what happens if I respond to a text message in one really long SMS
// TODO: Try to save three responses to a single question
updateExchange.createAdditionalAnswer = function createAdditionalAnswer(
  exchange, answerMessage) {
  console.log('Time to create an AdditionalAnswer!');

  // TODO: Do that!
  // Create an AdditionalAnswer
  // Find the first exchange or additional answer without a next and link it to
  // the new AdditionalAnswer
  // return a promise to keep the chain going
  // I could put all answers on AdditionalAnswer objects, but I want easy access
  // to the first answer message, especially since many answer won't span
  // multiple messages
}

updateExchange.getCurrent = function getCurrent(userPhoneNumber) {
  return User.findOne({where: {phoneNumber: userPhoneNumber}})
    .then(function(user) {
      return user.get('CurrentExchangeId');
    })
}

module.exports = updateExchange;
