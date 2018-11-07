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


let rooms = {}

app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/public/html/intro.html'));
});


app.post('/join', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/public/html/intro.html'));
});


app.get('/speechTest', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/public/html/index.html'));
});


// socket.io events
io.on( "connection", function( socket )
{
    console.log( "A user connected", socket.id);
    socket.on('join', (data) => {
      console.log(data)
      if (rooms[data.roomName] == null) {
        rooms[data.roomName] = [];
      }
        let userObj = {
          username:data.userName,
          socketid: socket.id
        }
        rooms[data.roomName].push(userObj);
        console.log(rooms);
        socket.emit('joined')
    })

    socket.on('message', (data) => {
      let users = rooms[data.room]
      // data["user"] =
      // let msg = data.message;
      // let name = data.name;
      // let msgtimestamp = data.timestamp;


      // console.log("new message: " + msg);

    if(users != null && users.length >= 1){
      // console.log("No users: "+ users.length);
      // let counter = 0;
        users.map((user) => {
        if (user.socketid != socket.id) {
          // console.log("speach emit  ",user.socketid);
          // counter++;
          // io.to(users.socketid).emit('speech', {msg:data.message})
          io.sockets.to(user.socketid).emit('speech', data)
          // socket.broadcast.to(users.socketid).emit('speech', {msg:data.message});
          // console.log("counter: " + counter);
        }
      })
    }
    })



});


module.exports = app;
