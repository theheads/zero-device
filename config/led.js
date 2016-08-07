const SerialPort = require("serialport")
// TODO connect with actual RPI serial port
const serialPort = new SerialPort("/dev/ttyACM0", { baudrate: 115200 });
const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);	//web socket server
server.listen(9090); //start the webserver on port 9090


module.exports = {
  brightness: 0,
  socket: null,
  init: () => {
    this.brightness = 0; //static variable to hold the current brightness
    io.on('connection', (socket) => { //gets called whenever a client connects
        this.socket = socket
        this.socket.emit('led', {value: this.brightness}); //send the new client the current brightness
        this.socket.on('led', (data) => { //makes the socket react to 'led' packets by calling this
            this.brightness = data.value;  //updates this.brightness from the data object
            const buf = new Buffer(1); //creates a new 1-byte buffer
            buf.writeUInt8(this.brightness, 0); //writes the pwm value to the buffer
            serialPort.write(buf); //transmits the buffer to the arduino
            io.sockets.emit('led', {value: this.brightness}); //sends the updated brightness to all connected clients
        });
        console.log('running')
    }.bind(this));
  },
  change: (value) => {
    this.brightness = value
    this.socket.emit('led', { value: this.brightness });
    this.socket.on('led', (data) => { //makes the socket react to 'led' packets by calling this
        this.brightness = data.value;  //updates this.brightness from the data object
        const buf = new Buffer(1); //creates a new 1-byte buffer
        buf.writeUInt8(this.brightness, 0); //writes the pwm value to the buffer
        serialPort.write(buf); //transmits the buffer to the arduino
        io.sockets.emit('led', {value: this.brightness}); //sends the updated brightness to all connected clients
    });
  }
}
