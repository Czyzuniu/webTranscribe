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
  res.sendFile(path.join(__dirname + '/public/html/index.html'));
});


app.post('/join', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/public/html/intro.html'));
});


// socket.io events
io.on( "connection", function( socket )
{
    console.log( "A user connected", socket.id);
    socket.on('join', (data) => {

      let colour = generateRandomColour()
      console.log('colour', colour)
      console.log(data)
      if (rooms[data.roomName] == null) {
        rooms[data.roomName] = [];
      }
        let userObj = {
          username: data.userName,
          socketid: socket.id,
          avatarColor:colour
        }
        rooms[data.roomName].push(userObj);
        data.roomUsers = rooms[data.roomName]
        socket.emit('joined', data)
        rooms[data.roomName].map((user) => {
            if (user.socketid != socket.id) {
                console.log('new user joined')
                io.sockets.to(user.socketid).emit('newUserJoined', data)
            }
        })
    })

    socket.on('message', (data) => {
        console.log(data, 'here')
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
          console.log(data)

          io.sockets.to(user.socketid).emit('speech', data)
          // socket.broadcast.to(users.socketid).emit('speech', {msg:data.message});
          // console.log("counter: " + counter);
        }
      })
    }
    })



});


function generateRandomColour() {
    return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
}


module.exports = app;
