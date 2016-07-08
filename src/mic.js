const mic = require('mic');
const fs = require('fs');
const Say = require("say");
const exec = require('child_process').exec;
const microsoftSpeechAPI = require(__dirname + '/../services/microsoft-speech.js');
const googleSpeechAPI = require(__dirname + '/../services/google-speech.js');
const witSpeechAPI = require(__dirname + '/../services/witai-speech.js');
const axios = require("axios")
const natural = require('natural');
const Player = require('player')
var Mic = {
  alwaysListening: function() {
    Mic.listen(console.log, false, true)
  },
  speak: function(text, callback) {
    Say.speak(text, 'Alex', 1, callback)
  },
  listen: function(callback, isConversation, alwaysOn) {
    var micInstance = mic({ 'rate': '44100', 'channels': '1', 'debug': true, 'exitOnSilence': 2 });
    var micInputStream = micInstance.getAudioStream();
    var outputFileStream = fs.WriteStream('sound.raw');
    var count = 0;
    micInputStream.pipe(outputFileStream);

    micInputStream.on('data', function(data) {
      console.log("Received Input Stream: " + data.length);
    });

    micInputStream.on('silence', function() {
      setTimeout(function() {
        micInstance.stop();

        var cmd = 'sox -b 16 -e signed -c 1 -r 44100 sound.raw -r 44100 sound.wav';

        exec(cmd, function(error, stdout, stderr) {
          count++

          if (alwaysOn) {
            witSpeechAPI.process(function(err, text) {
              if (text.match(/zero/))  {
                axios.post(' http://6808bc76.ngrok.io/api/process', { text: text})
                  .then(function(response) {
                    console.log(response)
                  })
              } else {
                Mic.alwaysListening()
              }
            })
          } else {
            if (count  === 1) {
                // microsoftSpeechAPI.process(function(err, text) {
                // })
                // googleSpeechAPI.process(function(err, text) {
                // })

                witSpeechAPI.process(function(err, text) {
                  console.log(text, 'text')
                  if (text === '' || text === null) {
                    callback()
                  } else {
                    axios.post('http://6808bc76.ngrok.io/process', {text: text})
                      .then(function(response) {
                        var data = response.data
                        processResponse(data.text, data.url, isConversation, callback)
                      })
                  }
                })
            }
          }

        });
      }, 2000);
    });
    micInstance.start();
  }
}

var processResponse = function(text, url, isConversation, callback) {
  Mic.speak(text, function() {
    if (url) {
      var player = new Player(url)
      player.play()
      player.on('playend',function(item){
        callback()
      });
    } else {
      callback()
    }
  })
}

module.exports = Mic;


;
