module.exports = {
  schedules: {},
  scheduleJob: function(name, time, callback) {
    var job = callback
    this.schedules[name] = job;
  },
  descheduleJob: function(name, callback) {
    if(this.schedules[name]) {
      this.schedules[name].cancel()
      delete this.schedules[name]
    }
    callback(this.schedules)
  }
}
