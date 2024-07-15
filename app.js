const debug = require('debug')('api:server');
debug('Starting the server...');
var mongoose = require('mongoose');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();
const port = 10000;

// Function to connect to the database and start the server
async function startServer() {
  try {
    await mongoose.connect('mongodb+srv://development:Gq9a9ijoDAJFruOm@r-nation.95mnxgm.mongodb.net/Stealth_DEV')
    debug('Database connected successfully');
    
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', indexRouter);
    app.use('/users', usersRouter);
    app.use('/api', apiRouter);


    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      next(createError(404));
    });

    // error handler
    app.use(function(err, req, res, next) {
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      debug('Error handling activated');

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    
  } catch (error) {
    debug('Database connection error:', error);
    process.exit(1); // Exit the process with a failure code
  }
}

startServer();

module.exports = app;
