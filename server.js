'use strict';

var app = require('./app.js');

var port = process.env.VCAP_APP_PORT || 3001;
app.listen(port);
console.log('listening at:', port);
