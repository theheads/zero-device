'use strict';

const express = require('express')
const setup = require(__dirname + '/config/setup.js')
const app = express()

require('dotenv').load({silent: true})
require('./config/error-handler')(app)

// const co = require('co')
  // co(function *(){
  //   // resolve multiple promises in parallel
  //   var a = Promise.resolve(function() { return 1 + 2});
  //   var b = Promise.resolve(2);
  //   var c = Promise.resolve(3);
  //   var res = yield [a, b, c];
  //   console.log(res[0]);
  //   // => [1, 2, 3]
  // }).catch(console.log);

setup(app)

module.exports = app;
