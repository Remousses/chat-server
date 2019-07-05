"use strict"
//require
require('dotenv').config();
var moment = require('moment'),
    http = require('http'),
    server = http.createServer().listen(process.env.APP_PORT, function () {
        console.log('Server listening on port : ' + process.env.APP_PORT)
    }),
    io = require('socket.io').listen(server);

var users = [];
var sockets = [];

io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
    socket.emit('id', socket.id);
    socket.on('new_user', function (message) {
        console.log('new user', message);

        socket.username = message.username;
        users.push({
            username: socket.username
        });
        sockets.push(socket);
        _sendUserList(users);
        // _getOldMessage();
    })
    socket.on('new-message', function (message) {
        message.timestamp = moment(message.timestamp).format('HH:mm:ss');
        io.emit('message2all', message);
    });
    // Delete Old Unused Socket 
    socket.on('old_socket_remover', function (message) {
        console.log('socket id to remove', message);
        // var socket = sockets.find(socket => {
        //     return socket.id = message;
        // });
        var socket = null;
        for (let i = 0; i < sockets.length; i++) {
            if (sockets[i].id == message) {
                socket = sockets[i];
            } else {
                console.log(sockets[i].id, 'not the same as ', message);
            }
        }
        if(socket != null){
            console.log('*** socket to remove founded ***\n',socket.id, socket.username);
            var index = sockets.indexOf(socket);
            var username = socket.username;
            sockets.splice(index, 1);
    
            index = users.indexOf(username);
            users.splice(index, 1);
            _sendUserList(users);
        }
        else {
            console.log('old socket not found');
        }
    });
});

function _sendUserList(users) {
    io.emit('userlist', users);
}