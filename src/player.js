var Player = require('player')
const mic = require(__dirname + '/mic.js')

module.exports = {
  player: null,
  play: function(url, callback) {
    this.player = new Player(url)
    this.player.play(function(err, player){
      callback()
    });
    this.player.on('error', function(err) {
      callback()
    })
  },
  stop: function() {
    this.player.stop()
  },
  pause: function() {
    this.player.pause()
  },
  next: function() {
    this.player.next()
  }
}
