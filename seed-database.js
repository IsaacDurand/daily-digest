// This file should add me to the User table.
// TODO: Can I use ES5 on the server?
var models = require('./models.js');
var User = models.User;
var secrets = require('./secrets.js');
var myData = {
  name: 'Isaac',
  phoneNumber: secrets.myMobileNumberShort
};

models.sequelize.sync()
  .then(function() {
    User.findOne({where: myData})
      .then(function(user) {
        if (user) {
          console.log('You are already in the table');
        } else {
          User.create(myData)
            .then(function(user) {
              if (user) console.log('You have been added to the table.');
            });
        }
      });
  });
