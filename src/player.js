var Player = require('player')


module.exports = {
  player: null,
  play: function(url) {
    this.player = new Player(url)
    this.player.play()
  },
  stop: function() {
    this.player.stop()
  },
  pause: function() {
    this.player.pause()
  }
}
