var util = require('util');
var Scout = require('zetta').Scout;


var StateMachineScout = module.exports = function(name) {
}

StateMachineScout.prototype.init = function(next) {
   var self = this;
   setTimeout(function() {
     self.discover(StateMachine, 'machine_1');
     self.discover(StateMachine, 'machine_2');
     self.discover(StateMachine, 'machine_3');
   }, 1000);
   next();
 }

 util.inherits(StateMachineScout, Scout);
