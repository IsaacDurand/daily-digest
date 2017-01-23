// TODO: Better name for this file? Something with controller?
// TODO: Organize methods
"use strict";

var updateExchange = {};

// If I only use this file when the server is running, I don't think I need to
// run sequelize.sync.
var models = require('./models.js');
var Exchange = models.Exchange;
var User = models.User;
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
      var newValues = {
        answerText: answerMessage.Body,
        answerMessageSid: answerMessage.MessageSid
      };
      // TODO: Does it make sense for this check to be in a separate function?
      if (exchange.questionDeliveryConfirmedAt < answerReceivedAt) {
          return exchange.set(newValues).save();
        } else {
          throw new Error('Answer was received before question delivery was confirmed');
          // TODO: Save orphan message?
        }
    })
}

updateExchange.getCurrent = function getCurrent(userPhoneNumber) {
  return User.findOne({where: {phoneNumber: userPhoneNumber}})
    .then(function(user) {
      return user.get('CurrentExchangeId');
    })
}

module.exports = updateExchange;
