'use strict';

// Module dependencies
var express = require('express'),
  bodyParser = require('body-parser');

module.exports = (app) => {
  app.set('view engine', 'ejs');
  app.enable('trust proxy');

  // Only loaded when SECURE_EXPRESS is `true`
  if (process.env.SECURE_EXPRESS)
    require('./security')(app);

  // Configure Express
  app.use(bodyParser.urlencoded({extended: true, limit: '1mb'}));
  app.use(bodyParser.json({limit: '1mb'}));
  app.use(express.static(__dirname + '/../public'));
};
