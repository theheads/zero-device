'use strict';

module.exports = (app) => {
  console.log("Do not user the error-handler.js module")
  // catch 404 and forward to error handler
  // app.use((req, res, next) => {
  //   var err = new Error('Not Found');
  //   err.code = 404;
  //   err.message = 'Not Found';
  //   next(err);
  // });

  // error handler
  // app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  //   var error = {
  //     code: err.code || 500,
  //     error: err.error || err.message
  //   };
  //   console.log('error:', error);
  //
  //   if (err.code === 'EBADCSRFTOKEN') {
  //     error = {
  //       code: 403,
  //       error: 'http://goo.gl/mGOksD'
  //     };
  //   }
  //   res.status(error.code).json(error);
  // });

};
