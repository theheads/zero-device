#!/usr/bin/env node
var sprintf = require('printf');
var exec = require('child_process').exec;
var Player = require('player'
)
module.exports = {
  interval: null,
  set: (hour, minute, cancel) => {
    if (cancel === true) {
      clearInterval(this.interval)
    }
    if (cancel !== true) {
      var alarmHour = parseInt(hour, 10);
      var alarmMinute = parseInt(minute || 0, 10);

      if (isNaN(alarmHour) || alarmHour < 0 || alarmHour > 23) {
        throw new Error('invalid hour: ' + alarmHour);
      }
      if (isNaN(alarmMinute) || alarmMinute < 0 || alarmMinute > 59) {
        throw new Error('invalid minute: ' + alarmMinute);
      }

      var powerHour = alarmHour;
      var powerMinute = alarmMinute;

      if (powerMinute > 5) {
        powerMinute -= 5;
      } else {
        powerMinute = 60 + powerMinute - 5;
        powerHour -= 1;
      }

      var powerCmd = sprintf(
        'pmset repeat wakeorpoweron MTWRFSU %02d:%02d:00',
        powerHour,
        powerMinute
      );

      exec(powerCmd, (err) => {
        if (err) {
          throw err;
        }

        console.log(sprintf('Set alarm for %02d:%02d', alarmHour, alarmMinute));
        console.log(sprintf('Set wakup for %02d:%02d', powerHour, powerMinute));

        process.setuid('felix');
      });

      this.interval = setInterval(() =>{
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        if (hour === alarmHour) { //&& minute == alarmMinute) {
          console.log(sprintf('Set alarm for %02d:%02d', alarmHour, alarmMinute || 0));
          play(__dirname + '../audio/news.mp3');
          clearInterval(this.interval);
        }
      }, 60000);
    }
  }
}

var play = (file) => {
  if (!file) { file = __dirname + '/../audio/espn.mp3' }

  console.log('playing', file);

  var player = new Player(file)
  player.play()
  player.on('playend',(item) => {
    console.log('alarm finished', item)
  });
}
