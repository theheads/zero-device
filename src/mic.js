const mic = require('mic')
const fs = require('fs')
const Say = require("say")
const exec = require('child_process').exec
const microsoftSpeechAPI = require(__dirname + '/../services/microsoft-speech.js')
const googleSpeechAPI = require(__dirname + '/../services/google-speech.js')
const witSpeechAPI = require(__dirname + '/../services/witai-speech.js')
const aws = require(__dirname + '/aws.js')
const axios = require("axios")
const natural = require('natural')
const Player = require('player')
const http = require('http')
const request = require('request')
const co = require('co')

var Mic = {
  alwaysListening: function() {
    Mic.listen(console.log, false, true)
  },
  say: function(text, callback) {
    Say.speak(text, 'Agnes', 0.9, callback)
  },
  record: function(toUser, callback) {
    var micInstance = mic({ 'rate': '44100', 'channels': '1', 'debug': true, 'exitOnSilence': 8 });
    var micInputStream = micInstance.getAudioStream();
    var outputFileStream = fs.WriteStream('sound.raw');

    micInputStream.pipe(outputFileStream);

    micInputStream.on('data', function(data) {
      console.log("Received Input Stream: " + data.length);
    });

    micInputStream.on('silence', function() {
      setTimeout(function() {
        micInstance.stop();

        var cmd = 'sox -b 16 -e signed -c 1 -r 44100 sound.raw -r 44100 sound.wav';

        exec(cmd, function(error, stdout, stderr) {
          var stream  = fs.createReadStream(__dirname + '/../sound.wav')
          var file = ''

          stream.on('data', function(data){
            file += data
          })
          stream.on('end', function (){
            // todo name it the users contact + file name
            var fileName = 'file' + Date.now() + '.wav'
            var user = "johnnywu"
            aws.upload(fileName, file, user, console.log)

            axios.post('http://85060886.ngrok.io/record', {
            // axios.post('https://zero-api.herokuapp.com/record', {
                file: fileName,
                from: user,
                to: toUser
              })
              .then(function (response) {
                processResponse(response.data.text)
              })
              .catch(function (error) {
                console.log(error);
              });
          })
        });
      }, 2000);
    });
    micInstance.start();
  },
  listen: function(alwaysOn) {
    var micInstance = mic({ 'rate': '44100', 'channels': '1', 'debug': true, 'exitOnSilence': 4 });
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
                axios.post('http://85060886.ngrok.io/process', {text: text})
                // axios.post('https://zero-api.herokuapp.com/process', { text: text})
                  .then(function(response) {
                    console.log(response)
                  })
              } else {
                Mic.alwaysListening()
              }
            })
          } else {
            if (count  === 1) {
                // microsoftSpeechAPI.process(function(err, text) {})
                // googleSpeechAPI.process(function(err, text) {})

                witSpeechAPI.process(function(err, text) {
                  console.log(text, 'text')

                  if (text === '' || text === null || text === undefined) {
                    console.log('no text found')
                    Mic.listen()
                  } else {
                    axios.post('https://85060886.ngrok.io/process', {text: text})
                    // axios.post('https://zero-api.herokuapp.com/process', {text: text})
                      .then(function(response) {
                        var data = response.data
                        if (data.text === 'no_match') {
                          Mic.listen()
                        } else {
                          if (response.data.name) {
                            Mic.say('What do you want to record?', function() {
                              Mic.record(response.data.name, console.log)
                            })
                          } else {
                            return processResponse(data.text, data.url, data.name)
                          }
                        }
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

var onerror = function(err) {
  console.error(err.stack)
}

var processNegativeResponse = function() {
  Mic.say('I did not understand that please try again', Mic.listen)
}
var processResponse = function(text, url, name) {
  console.log('process response', text, url)

  if (text) {
    Mic.say(text, function() {
      if (url) {
        var player = new Player(url)
        player.play()
        player.on('playend',function(item){
          Mic.listen()
        });
      } else {
        Mic.listen()
      }
    })
  } else {
    Mic.listen()
  }
}

module.exports = Mic;


;
