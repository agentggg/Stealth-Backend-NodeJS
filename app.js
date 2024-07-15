const debug = require('debug')('api:server');
debug('Starting the server...');
const mongoose = require('mongoose');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');

const app = express();

/**
 * Get port from environment and store in Express.
 */
const PORT = process.env.PORT || 3000;
app.set('port', PORT);

// Function to connect to the database
async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://development:Gq9a9ijoDAJFruOm@r-nation.95mnxgm.mongodb.net/Stealth_DEV', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    debug('Database connected successfully');
  } catch (error) {
    debug('Database connection error:', error);
    process.exit(1); // Exit the process with a failure code
  }
}
connectDB();

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

module.exports = app;
