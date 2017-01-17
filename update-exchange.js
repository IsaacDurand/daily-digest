"use strict";

var updateExchange = {};

// If I only use this file when the server is running, I don't think I need to
// run sequelize.sync.
var models = require('./models.js');
var Exchange = models.Exchange;

// I want a function that takes a req and updates the appropriate Exchange
updateExchange.saveStatus = function saveStatus(questionMessageSid, status) {
  return Exchange.findOne({where: {questionMessageSid: questionMessageSid}})
    .then(function(exchange) {
      return exchange.set('questionMessageStatus', status).save();
    });
}

module.exports = updateExchange;
