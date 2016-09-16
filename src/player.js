var Player = require('player')
const mic = require(__dirname + '/mic.js')

module.exports = {
  player: null,
  play: function(url, text) {
    var count = 0
    mic.say(text[count])

    this.player = new Player(url)
    this.player.play()

    // event: on playing
    this.player.on('playing',function(item){
      console.log('im playing... src:' + item);
    });

    // event: on playend
    this.player.on('playend',function(item){
      count++
      mic.say(text[count])
      console.log('src:' + item + ' play done, switching to next one ...');
    });

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
