// TODO: Better name for this file? Something with controller?
// TODO: Organize methods
"use strict";

var updateExchange = {};

// If I only use this file when the server is running, I don't think I need to
// run sequelize.sync.
var models = require('./models.js');
var Exchange = models.Exchange;
var User = models.User;

updateExchange.saveStatus = function saveStatus(questionMessageSid, status) {
  return Exchange.findOne({where: {questionMessageSid: questionMessageSid}})
    .then(function(exchange) {
      return exchange.set('questionMessageStatus', status).save();
    });
}

updateExchange.saveAnswer = function saveAnswer(exchangeId, answerMessage) {
  return Exchange.findById(exchangeId)
    .then(function(exchange) {
      var newValues = {
        answerText: answerMessage.Body,
        answerMessageSid: answerMessage.MessageSid
      };
      return exchange.set(newValues).save();
    })
  // answerText
  // answerMessageSid
}

updateExchange.getCurrent = function getCurrent(userPhoneNumber) {
  return User.findOne({where: {phoneNumber: userPhoneNumber}})
    .then(function(user) {
      return user.get('CurrentExchangeId');
    })
}

// TODO: Flesh this out and incorporate it into /answer route
updateExchange.isOrderCorrect = function isOrderCorrect(exchangeId, answerSendTime) {
  // Find the exchange and compare the time its question was delivered to the
  // time the answer was received
}

module.exports = updateExchange;
