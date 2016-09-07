
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Mic = require(__dirname + '/src/mic.js');

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
