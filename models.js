// TODO: Understand why I'm using strict mode
"use strict";

var Sequelize = require('sequelize');
var secrets = require('./secrets.js');

var db = {};
var sequelize = new Sequelize('daily_debrief', secrets.database.username,
 secrets.database.password);

 // Test the database connection
 sequelize.authenticate()
   .then(function(err) {
     console.log('Database connection has been established successfully.');
   })
   .catch(function (err) {
     console.log('Unable to connect to the database:', err);
   });

// Database
// TODO: Turn off database logging in Terminal if I don't want it.
// Define a user model
var User = sequelize.define('user', {
  name: {
    allowNull: false,
    type: Sequelize.STRING,
 },
 phoneNumber: {
   primaryKey: true,
   type: Sequelize.STRING,
   validate: {
     is: /[0-9]{10}/
   }
 }
});

// TODO: Define an exchange model
var Exchange = sequelize.define('exchange', {
 date: {
   type: Sequelize.DATEONLY,
   defaultValue: Sequelize.NOW
 },
 // TODO: Think about whether it makes sense to use foreign keys here
 //(especially for questions, which will be repeated)
 // I don't want questionText to be null, but I suppose it's possible that I
 // could send a blank SMS.
 questionText: {
   type: Sequelize.STRING
 },
 questionMessageSid: {
   allowNull: false,
   type: Sequelize.STRING,
   // https://support.twilio.com/hc/en-us/articles/223134387-What-is-a-Message-SID-
   validate: {
     is: /SM[a-z0-9]{32}/
   }
 },
 answerText: {
   type: Sequelize.STRING
 },
 answerMessageSid: {
   // TODO: Don't allow null unless answerText is also null?
   //  allowNull: false,
   defaultValue: null,
   type: Sequelize.STRING,
   validate: {
     is: /SM[0-9a-z]{32}/
   }
 }
});

// Useful: http://docs.sequelizejs.com/en/latest/docs/associations/
// TODO: Is there any way for me to see the related user's name in the Exchange
// table rather than their phone number?
Exchange.belongsTo(User, {
 foreignKey: {
   name: 'UserPhoneNumber',
   allowNull: false
 }
});

// TODO: Understand constraints better.
// TODO: What SQL is being generated here? In Terminal, I'm seeing the SQL
// statements for inserting rows, but I'm not seeing the table creation.
User.belongsTo(Exchange, {
 as: 'CurrentExchange',
 constraints: false
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = User;
db.Exchange = Exchange;

module.exports = db;
