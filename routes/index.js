var models = require('./../models.js');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  models.User.findAll()
    .then(function(users) {
      res.send(JSON.stringify(users));
    });
});

module.exports = router;
