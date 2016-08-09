const mic = require('mic')
const fs = require('fs')
const Say = require("say")
const exec = require('child_process').exec
const witSpeechAPI = require(__dirname + '/../services/witai-speech.js')
const aws = require(__dirname + '/aws.js')
const axios = require("axios")
const Player = require('player')
const setAlarm = require(__dirname + "/../config/alarm")

console.log("Initializing microphone")

var Mic = {
  triggerListening: () => {
    Mic.say('Hi', Mic.listen)
  },
  say: (text, callback) => {
    Say.speak(text, global.VOICE || 'kathy', 1, callback)
  },
  record: (toUser, callback) => {
    var micInstance = mic({ 'rate': '44100', 'channels': '1', 'debug': true, 'exitOnSilence': 8 });
    var micInputStream = micInstance.getAudioStream();
    var outputFileStream = fs.WriteStream('sound.raw');

    micInputStream.pipe(outputFileStream);

    micInputStream.on('data',(data) => {
      console.log("Received Input Stream: " + data.length);
    });

    micInputStream.on('silence', () => {
      setTimeout(() => {
        micInstance.stop();

        var cmd = 'sox -b 16 -e signed -c 1 -r 44100 sound.raw -r 44100 sound.wav';

        exec(cmd, (error, stdout, stderr) => {
          console.log(error, stdout, stderr)
          var stream  = fs.createReadStream(__dirname + '/../sound.wav')
          var file = ''

          stream.on('data', (data) => {
            file += data
          })
          stream.on('end',() => {
            var fileName = 'file' + Date.now() + '.wav'
            var user = "user"

            // TODO: upload fix to AWS
            // aws.upload(fileName, file, user, console.log)

            axios.post('http://518fbf76.ngrok.io/record', {
            // axios.post('https://zero-api.herokuapp.com/record', {
                file: fileName,
                from: user,
                to: toUser
              })
              .then((response) => {
                console.log(response.data.url)
                processResponse(response.data.text, response.data.url)
                callback()
              })
              .catch((error) => {
                processNoResponse(error)
              });
          })
        });
      }, 2000);
    });
    micInstance.start();
  },
  listen: () => {
    var micInstance = mic({ 'rate': '44100', 'channels': '1', 'debug': true, 'exitOnSilence': 4 });
    var micInputStream = micInstance.getAudioStream();
    var outputFileStream = fs.WriteStream('sound.raw');
    var count = 0;

    global.COMPLETED = false

    micInputStream.pipe(outputFileStream);

    micInputStream.on('data', (data) => {
      console.log("Received Input Stream: " + data.length);
    });

    micInputStream.on('silence', () => {
      setTimeout(() => {
        micInstance.stop();
        var cmd = 'sox -b 16 -e signed -c 1 -r 44100 sound.raw -r 44100 sound.wav';
        count++
        exec(cmd, (error) => {
          if (error) { console.log(error) }

          if (count === 1) {
            witSpeechAPI.process((err, text) => {
              console.log(text, 'text')
              global.COMPLETED = true

              if (text === '' || text === null || text === undefined) {
                processNoResponse()
              } else {
                // axios.post('https://518fbf76.ngrok.io/process', {text: text})
                axios.post('https://zero-api.herokuapp.com/process', {text: text})
                  .then((response) => {
                    var data = response.data
                    if (data.text === 'no_match') {
                      processNoResponse()
                    } else {
                      if (response.data.name) {
                        Mic.say('What do you want to record?', () => {
                          Mic.record(response.data.name, console.log)
                        })
                      } else {
                        return processResponse(data.text, data.url, data.name, data.alarm)
                      }
                    }
                  })
              }
            })
          }

        });
      }, 2000);
    });
    micInstance.start();
  }
}

var processNoResponse = () => {
  Mic.say('I did not understand that please try again', Mic.listen)
}

var processAlarm = (alarm) => {
  if (alarm.set === true) {
    setAlarm(alarm.hour, null, false)
  }
  if (alarm.set === false) {
    setAlarm(null, null, true)
  }
}

var processResponse = (text, url, name, alarm) => {
  console.log('process response', text, url)
  if (text) {
    Mic.say(text, () => {
      if (alarm) { processAlarm(alarm) }
      if (url) {
        var player = new Player(url)
        player.play()
        player.on('playend',(item) => { console.log('item finsihed' + item)});
      }
    })
  }
}

module.exports = Mic;
