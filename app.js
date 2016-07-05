'use strict';

const express = require('express')
const setup = require(__dirname + '/config/setup.js')
const app = express()

require('dotenv').load({silent: true})
require('./config/error-handler')(app)

setup(app)

module.exports = app;
