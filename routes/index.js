var models = require('./../models.js');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send('Router seems to be working!');
});

module.exports = router;
