"use strict".
/* global require */
/* global __dirname */
/* global process */
/* global module */
/* global global */


const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Mic = require(__dirname + '/src/mic.js');

// const led = require(__dirname + '/config/led.js')
var led = {
  value: null,
  init: function() {
    this.value = 0
  },
  change: function(value) {
    this.value = value
    console.log('Led brightness is.. ' + this.value)
  }
}
console.log('Initializing application...')


app.set('port', process.env.PORT || 3001)
app.use(bodyParser.json());

// Cors support
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.all('/start', function(req, res) {
  led.change(50)
  if (global.COMPLETED === true) {
    Mic.triggerListening()
  }
  // Mic.listen()
  res.send({})
  led.change(0)
})

led.init()

app.listen(process.env.PORT || 3001)


module.exports = app;
