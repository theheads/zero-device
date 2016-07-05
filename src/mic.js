const mic = require('mic');
const fs = require('fs');
const Say = require("say");
const exec = require('child_process').exec;
const microsoftSpeechAPI = require(__dirname + '/../services/microsoft-speech.js');
const googleSpeechAPI = require(__dirname + '/../services/google-speech.js');
const witSpeechAPI = require(__dirname + '/../services/witai-speech.js');
const axios = require("axios")
const natural = require('natural');

var Mic = {
  alwaysListening: function() {
    Mic.listen(console.log, false, true)
  },
  speak: function(text, callback) {
    Say.speak(text, 'Alex', 1, callback)
  },
  listen: function(callback, isConversation, alwaysOn) {
    var processor = require(__dirname + '/processor.js');
    var micInstance = mic({ 'rate': '44100', 'channels': '1', 'debug': true, 'exitOnSilence': 2 });
    var micInputStream = micInstance.getAudioStream();
    var outputFileStream = fs.WriteStream('test.raw');
    var count = 0;
    micInputStream.pipe(outputFileStream);

    micInputStream.on('data', function(data) {
      console.log("Received Input Stream: " + data.length);
    });

    micInputStream.on('silence', function() {
      setTimeout(function() {
        micInstance.stop();

        var cmd = 'sox -b 16 -e signed -c 1 -r 44100 /../audio/test.raw -r 44100 /../audio/test.wav';

        exec(cmd, function(error, stdout, stderr) {
          count++
          if (alwaysOn) {
            witSpeechAPI.process(function(err, text) {
              if (text.match(/zero/))  {
                // process response
                console.log(text)
                // processor.parse(text)
              } else {
                Mic.alwaysListening()
              }
            })
          } else {
            if (count  === 1) {
              witSpeechAPI.process(function(err, text) {
                // send to API
                processResponse(err, text, isConversation, callback)
              })
            }
          }

        });
      }, 2000);
    });
    micInstance.start();
  }
}

var processResponse = function(err, text, isConversation, callback) {
  if (callback) callback(text)
  if (err) console.log(err)
  if (isConversation) processor.parse(text)
}

module.exports = Mic;


// googleSpeechAPI.process(function(err, text) {
//   processResponse(err, text, isConversation, callback)
// })
//
// microsoftSpeechAPI.process(function(err, text) {
//   processResponse(err, text, isConversation, callback)
// });
