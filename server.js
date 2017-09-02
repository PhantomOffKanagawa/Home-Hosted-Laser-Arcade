var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var request = require("request");

http.listen(3000, function() {
    console.log('listening on *:3000');
});

var score = 0;
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');

    var query = req.url;
    var team = query.slice(1, 2);
    var ptxt = query.slice(2);
    var points = parseInt(ptxt, 10);
    score += points;

    request.put("https://locationPartOfAddress.api.smartthings.com:443/api/smartapps/installations/uuid/switches/toggle", {
            headers: {
                Authorization: "Bearer  tokenUuid"
            }
        },
        function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body);
        })
});

io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});