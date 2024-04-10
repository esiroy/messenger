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
var roomUsers = [];

io.on('connection', function(socket) {
    //console.log("user connected, with id " + socket.id)


    /*****************************************/
    /*  CANVAS AUDIO PLAYER CONTROL SERVER
    /*****************************************/

    socket.on("PLAY_AUDIO", (data) => {
        console.log("> PLAY_AUDIO", data);
        io.to(data.channelid).emit("PLAY_AUDIO", data);
        //io.sockets.emit("PAUSE_AUDIO", data);
    });

    socket.on("GOTO_AUDIO", (data) => {
        console.log(">>| GOTO_AUDIO", data);
        io.to(data.channelid).emit("GOTO_AUDIO", data);
        //io.sockets.emit("PAUSE_AUDIO", data);
    });

    socket.on("PAUSE_AUDIO", (data) => {
        console.log("|| PAUSE_AUDIO", data);
        io.to(data.channelid).emit("PAUSE_AUDIO", data);
        //io.sockets.emit("PAUSE_AUDIO", data);
    });

    socket.on("NEXT_AUDIO", (data) => {
        console.log(">> next audio file", data);
        io.to(data.channelid).emit("NEXT_AUDIO", data);
        //io.sockets.emit("NEXT_AUDIO", data);
    });

    socket.on("PREV_AUDIO", (data) => {
        console.log("<< previous audio file", data)
        io.to(data.channelid).emit("PREV_AUDIO", data);
        //io.sockets.emit("PREV_AUDIO_FILE", data);
    });

    socket.on("SEEK_AUDIO", (data) => {
        console.log("<<Time>> SEEK", data)
        io.to(data.channelid).emit("SEEK_AUDIO", data);
        //io.sockets.emit("PREV_AUDIO_FILE", data);
    });


    /*****************************************/
    /*  MEMBER ALL PAGE CALL TO ACTIONS
    /*****************************************/

    socket.on("CALL_USER", (data) => {
        //io.to('' + data.channelid + '').emit("CALL_USER", data);
        io.sockets.emit("CALL_USER", data);
    });

    socket.on("CALL_USER_PINGBACK", (data) => {
        io.to('' + data.channelid + '').emit("CALL_USER_PINGBACK", data);
    });


    socket.on("ACCEPT_CALL", (data) => {
        io.sockets.emit("ACCEPT_CALL", data);
    });


    socket.on("DROP_CALL", (data) => {
        io.sockets.emit("DROP_CALL", data);
    });


    /*****************************************/
    /*  SESSION ACTIONS
    /*****************************************/

    socket.on("JOIN_SESSION", (data) => {
        io.to('' + data.channelid + '').emit("JOIN_SESSION", data);
    });

    //@desc: this will send a ping to determin if online
    socket.on("JOIN_SESSION_PINGBACK", (data) => {
        io.to('' + data.channelid + '').emit("JOIN_SESSION_PINGBACK", data);
    });


    //@desc: this will send a pingback to sender to signal online status
    socket.on("TUTOR_JOINED", (data) => {
        io.to('' + data.channelid + '').emit("TUTOR_JOINED", data);
    });


    socket.on("MEMBER_JOINED", (data) => {
        io.to('' + data.channelid + '').emit("MEMBER_JOINED", data);
    });

    //socket.on("LEAVE_CANVAS_SESSION", (data) => {
        //WHEN USER LEFT THE SESSION, MAKE THE CANVAS USER LEAVE TO
       //io.to('' + data.channelid + '').emit("LEAVE_CANVAS_SESSION", data);
    //});


    socket.on("START_SESSION", (data) => {
        io.to('' + data.channelid + '').emit("START_SESSION", data);
    });

    socket.on("CANCEL_SESSION", (data) => {
        io.to('' + data.channelid + '').emit("CANCEL_SESSION", data);
    });

    socket.on("END_SESSION", (data) => {
        io.to('' + data.channelid + '').emit("END_SESSION", data);
    });



    socket.on("START_MEMBER_TIMER", (data) => {
        io.to('' + data.channelid + '').emit("START_MEMBER_TIMER", data);
    });

    socket.on("PAUSE_MEMBER_TIMER", (data) => {
        io.to('' + data.channelid + '').emit("PAUSE_MEMBER_TIMER", data);
    });

    socket.on("STOP_MEMBER_TIMER", (data) => {
        io.to('' + data.channelid + '').emit("STOP_MEMBER_TIMER", data);
    });

    /*****************************************/
    /*  CANVAS SERVER
    /*****************************************/


    socket.on("START_SLIDER", (data) => {
        io.sockets.emit("START_SLIDER", data);
    });

    socket.on("SEND_DRAWING", (data) => {
        io.to('' + data.channelid + '').emit('UPDATE_DRAWING', data);
    });

    socket.on("CREATE_NEW_SLIDE", (data) => {
        io.to('' + data.channelid + '').emit("CREATE_NEW_SLIDE", data);
    });


    socket.on("GOTO_SLIDE", (data) => {
        io.to('' + data.channelid + '').emit("GOTO_SLIDE", data);
    });


    socket.on("SEND_SLIDE_PRIVATE_MESSAGE", (data) => {
        io.to('' + data.channelid + '').emit("SEND_SLIDE_PRIVATE_MESSAGE", data);
    });


    socket.on("TUTOR_SELECTED_NEW_SLIDES", (data) => {
        io.to('' + data.channelid + '').emit("TUTOR_SELECTED_NEW_SLIDES", data);
    });



    /*****************************************/
    /*  ADMIN CHAT SUPPORT MESSENGER 
    /*****************************************/

    socket.on("SEND_USER_MESSAGE", function(data) {

        console.log("SEND_USER_MESSAGE ", data.recipient.username);

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

    socket.on('JOIN_CHANNEL', function(data) {
        const { channelID } = data;
    
        // Join the specified channel room
        socket.join(channelID);
    
        // Optionally, you can emit a confirmation back to the client
        socket.emit('CHANNEL_JOINED', { channelID });
    });
    
    /*Register connected user*/
    socket.on('REGISTER', function(user) {

        console.log("joined", user);

        //console.log("user connected, with id " + socket.id + " " + user.username)

        //remove if ever there is same userid
        /*
        for (var i in users) {
            if (users[i].userid === user.userid) {
                delete users[i];
                break;
            }
        }*/

        socket.join(user.channelid);


        users = users.filter(function(element) {
            return element !== undefined;
        });

        users.push({
            'id': socket.id,
            'channelid': user.channelid,
            'userid': user.userid,
            'username': user.username,
            'user_image': user.user_image,
            'nickname': user.nickname,
            'status': user.status,
            'type': user.type,
            'chat_type': user.chat_type
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
                if (users[i].channelid == null) {

                    console.log("user left session",  users[i])
                    io.emit('LEAVE_SESSION', users[i]);

                } else if (users[i].chat_type == 'canvas' ) {

                    console.log("user left CANVAS session",  users[i])               
                    io.to('' + users[i].channelid + '').emit("LEAVE_CANVAS_SESSION", users[i]);
                }                
                
                //delete users[i];
                users.splice(i, 1); // Remove the user from the array
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

        console.log("'SEND_PRIVATE_MESSAGE ", data);

        //io.to(data.channelid).emit("PRIVATE_MESSAGE_SENT",data);

        io.to(recipientID).emit("PRIVATE_MESSAGE_SENT",data);
    });

    // Private message handling
    socket.on('SEND_PRIVATE_MESSAGE_TEST', function(data) {

        console.log("'SEND_PRIVATE_MESSAGE_TEST ", data);

        // Extract necessary information from the data object
        const { recipient, message } = data;
        
        // Check if the recipient is valid and online
        const recipientSocket = io.sockets.sockets[recipient];

        if (recipientSocket) {
            // Send the private message to the recipient
            recipientSocket.emit('PRIVATE_MESSAGE', { sender: socket.id, message });
            // Optionally, you can also send an acknowledgment back to the sender
            socket.emit('PRIVATE_MESSAGE_SENT', { recipient, message });
        } else {
            // Handle the case where the recipient is not online or does not exist
            socket.emit('PRIVATE_MESSAGE_FAILED', { recipient, message, error: 'Recipient not found or offline' });
        }
    });
    
    
});