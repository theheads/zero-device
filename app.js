
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Mic = require(__dirname + '/src/mic.js');
const Alarm = require(__dirname + '/config/alarm.js')
const Player = require(__dirname + '/src/player.js')
const zetta = require('zetta');
const LED = require('zetta-led-mock-driver');
//
//
// var StateMachineScout = require(__dirname + '/zetta/scout.js')
// var StateMachineDevice =require(__dirname + '/zetta/device.js')
// var StateMachineApp = function(server) {
//
//   var StateMachine_1_Query = server.where({type: 'state_machine', name: 'machine_1'});
//   var StateMachine_2_Query = server.where({type: 'state_machine', name: 'machine_2'});
//   var StateMachine_3_Query = server.where({type: 'state_machine', name: 'machine_3'});
//
//   server.observe([StateMachine_1_Query, StateMachine_2_Query, StateMachine_3_Query], function(machine_1, machine_2, machine_3) {
//
//     console.log("State Machine came online: " + machine_1.name + ", " + machine_2.name + ", " + machine_3.name);
//     machine_1.on('turn-off', function() {
//       machine_2.call('turn-off');
//       machine_3.call('turn-off');
//     });
//
//     machine_1.on('turn-on', function() {
//       machine_2.call('turn-on');
//       machine_3.call('turn-on');
//     });
//   });
// }
//
//
// zetta()
//   .name('State Machine Server')
//   .use(StateMachineDevice)
//   .use(StateMachineApp)
//   .use(StateMachineScout)
//   .use(LED)
//   .link('http://hello-zetta.herokuapp.com/')
//   .listen(1338, function(){
//      console.log('Zetta is running at http://127.0.0.1:1338');
// });

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


const axios = require('axios')
const player = require('player')

var callbackNext = function() {
  axios.post('https://af542d74.ngrok.io/process', {text: 'next'})
    .then((response) => {
      var data = response.data
      callback(data)
    })
}
var callback = function(data) {
  console.log(data.url, data.text)
  Mic.say(data.text, () => {
    if (data.url) {
      var player1 = new player(data.url)
      player1.play()
      setTimeout(function(){ player1.stop()},5000)
      player1.on('playend',(item) => {
        console.log('completed')
        apiCall(callbackNext)
      });
    }
  })
}


var apiCall = function(callback) {
axios.post('https://af542d74.ngrok.io/process', {text: 'start routine'})
  .then((response) => {
    var data = response.data
    callback(data)
  })
}

apiCall(callback)

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
