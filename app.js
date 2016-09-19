
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
     console.log('Zetta is running at http://127.0.0.1:1338');
});

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

//
const axios = require('axios')
// const player = require('player')
//
// var callbackNext = function() {
//   axios.post('https://af542d74.ngrok.io/process', {text: 'next'})
//     .then((response) => {
//       var data = response.data
//       callback(data)
//     })
// }
// var callback = function(data) {
//   console.log(data.url, data.text)
//   Mic.say(data.text, () => {
//     if (data.url) {
//       var player1 = new player(data.url)
//       player1.play()
//       setTimeout(function(){ player1.stop();
//         callbackNext()
//       },5000)
//       player1.on('playend',(item) => {
//         console.log('completed')
//       });
//     }
//   })
// }
//
//
// var apiCall = function(callback) {
// axios.post('https://af542d74.ngrok.io/process', {text: 'start routine'})
//   .then((response) => {
//     var data = response.data
//     callback(data)
//   })
// }
//
// apiCall(callback)

app.all('/start', (req, res) => {
  if (global.COMPLETED === true) {
    Mic.triggerListening()
  } else {
    console.log('initial trigger still waiting')
  }
  res.send({})
})

app.all('/alarm', (req, res) => {
  if (req.body.action === 'stop') {
    Player.stop()
  }
  if (req.body.action === 'pause') {
    Player.pause()
  }
  if (req.body.action === 'start' && req.body.steps) {
    routineManager.steps = req.body.steps
    routineManager.nextStep()
  }
  res.send({})
})


var routineManager = {
  steps: [],
  count: 0,
  nextStep: function() {
    console.log(this.steps, this.count)
    if (this.steps[this.count].match(/http/)) {
      Player.play(this.steps[this.count], this.nextStep.bind(this))
    } else {
      Mic.say(this.steps[this.count], this.nextStep.bind(this))
    }
    this.count++
  }
}

app.listen(process.env.PORT || 3001)

module.exports = app;
