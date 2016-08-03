'use strict';

const express = require('express')
const Mic = require(__dirname + '/src/mic.js')
const extend = require('util')._extend
const exec = require('child_process').exec
const security = require(__dirname + '/config/security.js')
const setup = require(__dirname + '/config/setup.js')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')


console.log('Initializing application...')
const app = express()

require('./config/error-handler')(app)
security(app)


app.set('port', process.env.PORT || 3001)
app.use(bodyParser.json());


// Cors support
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.all('/', function(req, res) {
  res.send()
})
app.all('/start', function(req, res) {
  Mic.listen()
  res.send({})
})

app.listen(process.env.PORT || 3001)


module.exports = app;
