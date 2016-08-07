const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Mic = require(__dirname + '/src/mic.js');

// const led = require(__dirname + '/config/led.js')
var led = {
  value: null,
  init: () => {
    this.value = 0
  },
  change: (value) => {
    this.value = value
    console.log('Led brightness is.. ' + this.value)
  }
}
console.log('Initializing application...')


app.set('port', process.env.PORT || 3001)
app.use(bodyParser.json());

// Cors support
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.all('/start', (req, res) => {
  // led.change(50) // trigger LED light
  if (global.COMPLETED === true) {
    Mic.triggerListening()
  } else {
    console.log('initial trigger still waiting')
    // queue up listening or handle multipler responses?
  }
  res.send({})
  // led.change(0) // trigger LED light
})

led.init()

app.listen(process.env.PORT || 3001)


module.exports = app;
