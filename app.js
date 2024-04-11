var fs = require('fs');
var https = require('https');

var express = require('express');
var app = express();

var options = {
    key: fs.readFileSync('./file.pem'),
    cert: fs.readFileSync('./file.crt')
};
var serverPort = 40009;

var server = https.createServer(options, app);
//var io = require('socket.io')(server);
var io = require('socket.io')(server, { wsEngine: 'ws' });

app.get('/', function(req, res) {
    //res.sendFile(__dirname + '/public/index.html');
    res.send('<h1>Chat server</h1>');
});

server.listen(serverPort, function() {
    console.log('server up and running at %s port', serverPort);
});



var users = [];

io.on('connection', function(socket) {

    //console.log("user connected, with id " + socket.id)

    socket.on('JOIN_CHANNEL', function(data) {
        const { channelID } = data;
    
        // Join the specified channel room
        socket.join(channelID);
    
        // Optionally, you can emit a confirmation back to the client
        console.log("channel is now : ", channelID);
        socket.emit('CHANNEL_JOINED', { channelID });
    });

    socket.on("SEND_USER_MESSAGE", function(data) {

        console.log("send user ", data.recipient.username);

        //io.sockets.connected[data.id].emit("PRIVATE_MESSAGE", data);
        /*
        for (var i in users) {

            if (data.recipient.username == users[i].username) 
            {              
                io.sockets.connected[users[i].id].emit("PRIVATE_MESSAGE", data);
                //break;
            }            
        }*/

        io.sockets.emit("PRIVATE_MESSAGE", data);

        //this.handleUserPrivateMsg(data);
    });

    socket.on("SEND_OWNER_MESSAGE", function(data) {

        io.emit('OWNER_MESSAGE', data);
        //this.handleUserPrivateMsg(data);
    });

    /*Register connected user*/
    socket.on('REGISTER', function(user) {
        console.log("user connected, with id " + socket.id + " " + user.username)

        //remove if ever there is same userid
        /*
        for (var i in users) {
            if (users[i].userid === user.userid) {
                delete users[i];
                break;
            }
        }*/

        users = users.filter(function(element) {
            return element !== undefined;
        });

        users.push({
            'id': socket.id,
            'userid': user.userid,
            'username': user.username,
            'user_image': user.user_image,
            'nickname': user.nickname,
            'status': user.status,
            'type': user.type,
        });


        update_user_list();
    });


    //THIS WILL EMIT THE USER LIST TO CLIENT SIDE
    function update_user_list() {

        io.emit('update_user_list', users);
    }

    //Removing the socket on disconnect
    socket.on('disconnect', function() {
        for (var i in users) {
            if (users[i].id === socket.id) {
                delete users[i];
                break;
            }
        }

        users = users.filter(function(element) {
            return element !== undefined;
        });

        update_user_list();
    });

    //default (public)
    socket.on('SEND_MESSAGE', function(data) {
        io.emit('MESSAGE', data)
    });



    // Private message handling
    socket.on('SEND_PRIVATE_MESSAGE', function(data) {

        console.log("SEND_PRIVATE_MESSAGE", data.recipientID);

        io.to('' + data.recipientID + '').emit("PRIVATE_MESSAGE_SENT", data);
    });


});