const axios = require("axios")
const google = require('googleapis');
const async = require('async');
const fs = require('fs');

var GoogleAPI = {
  process: function(callback) {
    _processData(__dirname + '/../audio/test.wav', callback)
  }
}

var url = 'https://speech.googleapis.com/$discovery/rest';

function getSpeechService (callback) {
  // Acquire credentials
  google.auth.getApplicationDefault(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    // The createScopedRequired method returns true when running on GAE or a
    // local developer machine. In that case, the desired scopes must be passed
    // in manually. When the code is  running in GCE or a Managed VM, the scopes
    // are pulled from the GCE metadata server.
    // See https://cloud.google.com/compute/docs/authentication for more
    // information.
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      // Scopes can be specified either as an array or as a single,
      // space-delimited string.
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/cloud-platform'
      ]);
    }

    // Load the speach service using acquired credentials
    console.log('Loading speech service...');
    google.discoverAPI({
      url: url,
      version: 'v1',
      auth: authClient
    }, function (err, speechService) {
      if (err) {
        return callback(err);
      }
      callback(null, speechService, authClient);
    });
  });
}

function prepareRequest (inputFile, callback) {
  fs.readFile(inputFile, function (err, audioFile) {
    if (err) {
      return callback(err);
    }
    console.log('Got audio file!');
    var encoded = new Buffer(audioFile).toString('base64');
    var payload = {
      initialRequest: {
        encoding: 'LINEAR16',
        sampleRate: 44000
      },
      audioRequest: {
        content: encoded
      }
    };
    return callback(null, payload);
  });
}

function _processData (inputFile, callback) {
  var requestPayload;

  async.waterfall([
    function (cb) {
      prepareRequest(inputFile, cb);
    },
    function (payload, cb) {
      requestPayload = payload;
      getSpeechService(cb);
    },
    function sendRequest (speechService, authClient, cb) {
      console.log('Analyzing speech...');
      speechService.speech.recognize({
        auth: authClient,
        resource: requestPayload
      }, function (err, result) {
        if (err) {
          return cb(err);
        }
        console.log('result:', JSON.stringify(result, null, 2));
        cb(null, result);
      });
    }
  ], callback);
}

module.exports = GoogleAPI
