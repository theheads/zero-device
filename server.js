'use strict';


console.log('Starting processes...')

switch (process.platform) {
  case "darwin":
    console.log('System detected is a Mac setup')
    global.SYSTEM === 'mac'
    global.VOICE === 'kathy'
    break;
  case "linux":
    console.log("System detected is a Linux setup");
    global.SYSTEM === 'linux'
    global.VOICE === 'festvox-kallpc16k'
    break;
  default:
    console.log("Please use a system that is supported (Linux/Mac)")
}

var app = require('./app.js');
