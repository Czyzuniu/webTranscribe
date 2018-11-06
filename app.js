var express      = require( "express"   );
var socket_io    = require( "socket.io" );
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
// Socket.io
var io           = socket_io();
app.io           = io;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/public/html/intro.html'));
});


app.get('/speechTest', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/public/html/index.html'));
});

// socket.io events
io.on( "connection", function( socket )
{
    console.log( "A user connected" );
});


module.exports = app;
