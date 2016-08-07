const utils = require('./utils');
const showerror = require('./views/showerror');
const showError = showerror.showError;

// Mini WS callback API, so we can initialize
// with model and token in URI, plus
// start message

// Initialize closure, which holds maximum getToken call count
const tokenGenerator = utils.createTokenGenerator();

const initSocket = exports.initSocket = (options, onopen, onlistening, onmessage, onerror, onclose) => {
  const listening;
  //  withDefault(val, defaultVal) {
  //   return typeof val === 'undefined' ? defaultVal : val;
  // }
  const socket;
  const token = options.token;
  const model = options.model || localStorage.getItem('currentModel');
  const message = options.message || {'action': 'start'};
  // const sessionPermissions = withDefault(options.sessionPermissions,
  //   JSON.parse(localStorage.getItem('sessionPermissions')));
  // const sessionPermissionsQueryParam = sessionPermissions ? '0' : '1';
  // TODO: add '&X-Watson-Learning-Opt-Out=' + sessionPermissionsQueryParam once
  // we find why it's not accepted as query parameter
  // const url = options.serviceURI || 'wss://stream-d.watsonplatform.net/speech-to-text/api/v1/recognize?watson-token=';
  const url = options.serviceURI || 'wss://stream.watsonplatform.net/speech-to-text/api/v1/recognize?watson-token=';
  url += token + '&model=' + model;
  console.log('URL model', model);
  try {
    socket = new WebSocket(url);
  } catch (err) {
    console.error('WS connection error: ', err);
  }
  socket.onopen = () {
    listening = false;
    $.subscribe('hardsocketstop', () {
      console.log('MICROPHONE: close.');
      socket.send(JSON.stringify({action:'stop'}));
      socket.close();
    });
    $.subscribe('socketstop', () {
      console.log('MICROPHONE: close.');
      socket.close();
    });
    socket.send(JSON.stringify(message));
    onopen(socket);
  };
  socket.onmessage = (evt) {
    const msg = JSON.parse(evt.data);
    if (msg.error) {
      showError(msg.error);
      $.publish('hardsocketstop');
      return;
    }
    if (msg.state === 'listening') {
      // Early cut off, without notification
      if (!listening) {
        onlistening(socket);
        listening = true;
      } else {
        console.log('MICROPHONE: Closing socket.');
        socket.close();
      }
    }
    onmessage(msg, socket);
  };

  socket.onerror = (evt) => {
    console.log('WS onerror: ', evt);
    showError('Application error ' + evt.code + ': please refresh your browser and try again');
    $.publish('clearscreen');
    onerror(evt);
  };

  socket.onclose = (evt) => {
    console.log('WS onclose: ', evt);
    if (evt.code === 1006) {
      // Authentication error, try to reconnect
      console.log('generator count', tokenGenerator.getCount());
      if (tokenGenerator.getCount() > 1) {
        $.publish('hardsocketstop');
        throw new Error('No authorization token is currently available');
      }
      tokenGenerator.getToken((err, token) => {
        if (err) {
          $.publish('hardsocketstop');
          return false;
        }
        console.log('Fetching additional token...');
        options.token = token;
        initSocket(options, onopen, onlistening, onmessage, onerror, onclose);
      });
      return false;
    }
    if (evt.code === 1011) {
      console.error('Server error ' + evt.code + ': please refresh your browser and try again');
      return false;
    }
    if (evt.code > 1000) {
      console.error('Server error ' + evt.code + ': please refresh your browser and try again');
      return false;
    }
    // Made it through, normal close
    $.unsubscribe('hardsocketstop');
    $.unsubscribe('socketstop');
    onclose(evt);
  };

};
