#!/usr/bin/env node
var sprintf = require('printf');
var exec = require('child_process').exec;

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

      exec(powerCmd, function(err) {
        if (err) {
          throw err;
        }

        console.log(sprintf('Set alarm for %02d:%02d', alarmHour, alarmMinute));
        console.log(sprintf('Set wakup for %02d:%02d', powerHour, powerMinute));

        process.setuid('felix');
      });

      this.interval = setInterval(function() {
        var now = new Date;
        var hour = now.getHours();
        var minute = now.getMinutes();

        if (hour == alarmHour) { //&& minute == alarmMinute) {
          console.log(sprintf('Set alarm for %02d:%02d', alarmHour, alarmMinute || 0));
          play(file);
          clearInterval(this.interval);
        }
      }, 60000);
    }
  }
}

var play = file => {
  if (!file)file = __dirname + '/../audio/espn.mp3'

  console.log('playing', file);

  var player = new Player(file)
  player.play()
  player.on('playend',function(item){
    console.log('alarm finished')
  });
}
