const google = require('googleapis');
const async = require('async');
const fs = require('fs');
const Buffer = require('buffer')

const GoogleAPI = {
  process: (callback) => {
    _processData(__dirname + '/../sound.wav', callback)
  }
}

const url = 'https://speech.googleapis.com/$discovery/rest';

const getSpeechService = (callback) => {
  // Acquire credentials
  google.auth.getApplicationDefault((err, authClient) => {
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
    }, (err, speechService) => {
      if (err) {
        return callback(err);
      }
      callback(null, speechService, authClient);
    });
  });
}

const prepareRequest = (inputFile, callback) => {
  fs.readFile(inputFile, (err, audioFile) => {
    if (err) { return callback(err); }

    const encoded = new Buffer(audioFile).toString('base64');
    const payload = {
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

const _processData =  (inputFile, callback) => {
  var requestPayload = null

  async.waterfall([
    (cb) => {
      prepareRequest(inputFile, cb);
    },
    (payload, cb) => {
      requestPayload = payload;
      getSpeechService(cb);
    },
    (speechService, authClient, cb) => {
      speechService.speech.recognize({
        auth: authClient,
        resource: requestPayload
      }, (err, result) => {
        if (err) { return cb(err); }
        console.log('result:', JSON.stringify(result, null, 2));
        cb(null, result);
      });
    }
  ], callback);
}

module.exports = GoogleAPI
