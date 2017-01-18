"use strict";

var util = {};

util.logError = function logError(err) {
  console.log('An error has occurred:\n', err);
}

util.trimPhoneNumber = function trimPhoneNumber(phoneNumber) {
  var rv = '';

  if (phoneNumber.length === 12 && phoneNumber.slice(0, 2) === '+1') {
    rv = phoneNumber.slice(2);
  }

  return rv;
}

module.exports = util;
