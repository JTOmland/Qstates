
var express = require('express');
var app = express();
var server = app.listen(3000);


app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newConnection);

function newConnection(socket) {
    
    console.log('new connection: ' + socket.id);

    socket.on('mouse', mouseMsg);
    function mouseMsg(data) {
        socket.broadcast.emit('mouse', data);
        //console.log('calling test get a value', test.getAvalue());
        //io.sockets.emit('mouse', data)  will send to all connections.  Above excludes sender;
        console.log(data);
    }
}


console.log('my socket server is runnings!');
