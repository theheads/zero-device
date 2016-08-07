'use strict';

// security.js
const secure = require('express-secure-only')
const rateLimit = require('express-rate-limit')
const csrf = require('csurf')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')

module.exports = (app) => {
  app.enable('trust proxy');

  // 1. redirects http to https
  app.use(secure());

  // 2. helmet with defaults
  app.use(helmet());

  // 3. setup cookies
  var secret = Math.random().toString(36).substring(7);
  app.use(cookieParser(secret));

  // 4. csrf
  // part 1: generate a csrf token for homepage views
  var csrfProtection = csrf({cookie: true});
  app.get('/', csrfProtection, (req, res, next) => {
    req._csrfToken = req.csrfToken();
    next();
  });
  // part 2: require token on /api/* requests
  app.use('/api/', csrfProtection);

  // 5. rate limiting.
  app.use('/api/', rateLimit({
    windowMs: 30 * 1000, // seconds
    delayMs: 0,
    max: 3,
    message: JSON.stringify({
      error:'Too many requests, please try again in 30 seconds.',
      code: 429
    })
  }));
};
