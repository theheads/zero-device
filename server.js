'use strict';


switch (process.platform) {
  case "darwin":
    console.log('System is using Mac')
    global.SYSTEM === 'mac'
    global.VOICE === 'kathy'
    break;
  case "linux":
    console.log("System is using Linux");
    global.SYSTEM === 'linux'
    global.VOICE === 'festvox-kallpc16k'
    break;
  default:
    console.log("Please use a system that is supported (Linux/Mac)");
    throw;
}

var app = require('./app.js');
