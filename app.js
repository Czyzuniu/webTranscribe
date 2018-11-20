const fs = require('fs');

var express      = require( "express"   );
var socket_io    = require( "socket.io" );
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var stringSimilarity = require('string-similarity');
var natural = require('natural');

var app = express();
// Socket.io
var io           = socket_io();
app.io           = io;

let voiceCounter = 3
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
      if (data != null ){
        console.log(data)
        if (rooms[data.roomName] == null) {
          rooms[data.roomName] = {
            people:[],
            msgs:[]
          };
        }
      let colour = generateRandomColour()
        let userObj = {
          username: data.userName,
          socketid: socket.id,
          avatarColor:colour,
          voiceIndex: ++voiceCounter
        }
        rooms[data.roomName]["people"].push(userObj);
        console.log(rooms);

        rooms[data.roomName]["people"].map((user) => {
          if (user.socketid != socket.id) {
            console.log('new user joined')
            io.sockets.to(user.socketid).emit('newUserJoined', rooms[data.roomName]["people"])
          }
        })
      }

      let res = {
        users:rooms[data.roomName]["people"],
        myVoice:voiceCounter
      }

      socket.emit('joined', res)

    })

    socket.on('message', (data) => {
      // console.log(data);
      let roomData = rooms[data.room];
      if(roomData != null){

            let users = roomData["people"];
            data["similarity"] = [];
            data["usersocket"] = socket.id;

            if(roomData["msgs"].length == 0){
              addToFile(roomData,data);
            }else{
                roomData["msgs"].forEach(function(msg) {
                  if( data.usersocket != msg.usersocket){
                    if( ((data.timestamp - msg.timestamp) /1000) <= 30){
                        var similarity = stringSimilarity.compareTwoStrings(data.message, msg.message);
                        // var temp_natural = natural.LevenshteinDistance(msg.message, data.message, {search: true})
                        data["similarity"].push(
                          {"text":msg.message,
                          "sim":similarity//,
                          // "natutal_substring":temp_natural.substring,
                          // "natutal_distance":temp_natural.distance
                          }
                        );

                        let data_micVolMax = Math.max(...data["mic"]);
                        let msg_micVolMax = Math.max(...msg["mic"]);

                        console.log("*****************************************");
                        console.log("data_micVolMax: "+data_micVolMax +" / msg_micVolMax: "+msg_micVolMax);
                        console.log("data: " + data.message +"  &  msg: "+msg.message + "  = " +similarity);

                        if(users != null && users.length >= 1){
                          if(similarity >= 0.80 && msg_micVolMax > data_micVolMax){
                                users.map((user) => {
                                  io.sockets.to(user.socketid).emit('cancelmsg', data["msgid"]);
                                });
                            }else if(similarity >= 0.80 && data_micVolMax > msg_micVolMax){
                              users.map((user) => {
                                io.sockets.to(user.socketid).emit('cancelmsg', msg["msgid"]);
                              })
                            }
                          }

                    }else {
                      console.log("false - more than 30 sec");
                    }
                  }else{
                    console.log("false - data and msg are same user ");
                  }
                });
                addToFile(roomData,data);


            }
          if(users != null && users.length >= 1){

              users.map((user) => {
              if (user.socketid != socket.id) {
                // console.log(data)
                io.sockets.to(user.socketid).emit('speech', data)

              }
            })
          }
        }
    })
});


function generateRandomColour() {
    return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
}

function addToFile(roomData,data) {
  roomData["msgs"].push(data);
  var stream = fs.createWriteStream("tempFile.txt", {flags:'a'});
    stream.write(data.name + " (" + new Date(data.timestamp).toLocaleTimeString() + ") : " + ((parseFloat(data.confidence))*100).toFixed(2) + " - ["+data.mic.toString() + "] : "+data.message + "\n");
    data.similarity.forEach(function(msg) {
      stream.write("\t\t - " + msg.text + " @ " + parseFloat(msg.sim).toFixed(2));

      // stream.write(" | " + msg.natutal_substring + " : " + msg.natutal_distance + "\n");


     stream.write("\n");
    });
  stream.end();
}
module.exports = app;
