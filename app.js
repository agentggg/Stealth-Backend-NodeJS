require('dotenv').config();
const debugServer = require('debug')('api:server');
const debugDb = require('debug')('api:database')
const mongoose = require('mongoose');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');
const workoutManagementRouter = require('./routes/workoutManagement');
const recordsRouter = require('./routes/records');


const app = express();

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || 3000;
app.set('port', port);

// Function to connect to the database
async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://development:Gq9a9ijoDAJFruOm@r-nation.95mnxgm.mongodb.net/Stealth_DEV');
    debugDb('Database connected successfully');
  } catch (error) {
    debugDb('Database connection error:', error);
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
app.use('/workout', workoutManagementRouter)
// app.use('/api', recordsRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    message: err.message,
    error: err
  });
});
// Conditionally start the server if this file is run directly
if (require.main === module) {
  /** 
   * Create HTTP server.
   */
  const server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  /**
   * Normalize a port into a number, string, or false.
   */
  function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }

  /**
   * Event listener for HTTP server "error" event.
   */
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        debugServer(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        debugServer(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`;
    debugServer('Listening on ' + bind);
    debugServer(`Server is listening on ${bind}`);
  }
}

module.exports = app;
