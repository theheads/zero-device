
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Mic = require(__dirname + '/src/mic.js');
const Alarm = require(__dirname + '/config/alarm.js')
const Player = require(__dirname + '/src/player.js')

const zetta = require('zetta');
const LED = require('zetta-led-mock-driver');

zetta()
  .name('Device')
  .use(LED)
  .link('http://hello-zetta.herokuapp.com/')
  .listen(1338, function(){
     console.log('Zetta is running at http://127.0.0.1:1337');
});

Alarm.set(18, 25)
console.log('alarm')

console.log('Initializing application...')

app.on('prompt', function(req) {
  // trigger API request for prompt
})

app.set('port', process.env.PORT || 3001)
app.use(bodyParser.json());

// Cors support
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.all('/alarm', (req, res) => {
  if (req.body.stop === true) {
    Player.stop()
  }
  if (req.body.pause === true) {
    Player.pause()
  }
  if (req.body.next === true && req.body.url) {
    Player.play(req.body.url)
  }
  if (req.body.start === true && req.body.url) {
    Player.play(req.body.url)
  }
})

app.all('/start', (req, res) => {
  if (global.COMPLETED === true) {
    Mic.triggerListening()
  } else {
    console.log('initial trigger still waiting')
  }
  res.send({})
})

app.listen(process.env.PORT || 3001)

module.exports = app;
