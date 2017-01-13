var http = require('http');
var express = require('express');

var createExampleUsers = require('./explorations/create-example-users.js');
var earlyApp = require('./routes/early-app/index.js');
var mainApp = require('./routes/index.js');
var models = require('./models.js');
var secrets = require('./secrets.js');
var util = require('./util.js');

var app = express();
var port = 1337;
var server = http.createServer(app);

// TODO: remove the force option if I don't want to delete the table
// TODO: How do I get all this chaining under control?
models.sequelize.sync({force: true})
  .then(function() {
    console.log("Tables are created. It's now safe to use them.");

    // Uncomment this to see instances added to the database
    // createExampleUsers(models, secrets);

    // TODO: Right about here, start saving actual messages.
    server.listen(port, function() {
      console.log('Express server listening on port', port);

      // Here, decide which "mini-app" to use.
      app.use('/', earlyApp);
    });
  })
  .catch(util.logError);
