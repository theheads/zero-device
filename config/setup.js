'use strict';

const extend = require('util')._extend
const exec = require('child_process').exec
const security = require(__dirname + '/security.js')
const Mic = require(__dirname + '/../src/mic.js')
const errors = require(__dirname + '/error-handler.js')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Microsoft = require(__dirname + '/../services/microsoft-speech.js')
module.exports = (app) => {
  initialize(app)
};

const initialize = (app) =>{
  app.use(cors())
  app.use(bodyParser.urlencoded({extended: true, limit: '1mb'}));
  app.use(bodyParser.json({limit: '1mb'}));

  app.all('/start', (req, res) => {
    Mic.listen()
    res.send({})
  })


  security(app)
  errors(app)
  // Mic.listen()
  // Mic.alwaysListening()
}
