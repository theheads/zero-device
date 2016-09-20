
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Mic = require(__dirname + '/src/mic.js');
const Alarm = require(__dirname + '/config/alarm.js')
const Player = require(__dirname + '/src/player.js')
const zetta = require('zetta');
const LED = require('zetta-led-mock-driver');

const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://broker.hivemq.com')

client.on('connect', () => {
  client.publish('alarm/connected', 'true')
})

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
})

client.publish('alarm/connected', 'true')



// zetta()
//   .name('Device')
//   .use(LED)
//   .link('http://hello-zetta.herokuapp.com/')
//   .listen(1338, function(){
//      console.log('Zetta is running at http://127.0.0.1:1338');
// });

console.log('Initializing application...')


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

app.set('port', process.env.PORT || 3001)
app.use(bodyParser.json());

// Cors support
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.all('/start', (req, res) => {
  if (global.COMPLETED === true) {
    Mic.triggerListening()
  } else {
    console.log('initial trigger still waiting')
  }
  res.send({})
})

app.all('/alarm', (req, res) => {
  console.log('got here')
  client.publish('alarm/connected', 'true')
  client.publish('alarm/state', 'on')
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
    if (this.count === this.steps.length && this.steps.length !== 0) {
      client.publish('alarm/state', 'off')
    }
    this.count++
  }
}


process.on('exit', function() {
  client.publish('alarm/connected', 'false')
  // Add shutdown logic here.
});

app.listen(process.env.PORT || 3001)

module.exports = app;
