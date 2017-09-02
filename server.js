var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var request = require("request");

io.on('connection', function(socket) {
    socket.on('score update', function(msg) {
        console.log("foo" + msg);
        io.emit('score update', msg);
    });
});

http.listen(8080, function() {
    console.log('listening on *:8080');
});

var score = 0;
app.get('/scores', function(req, res) {
    res.sendFile(__dirname + '/scores.html');
});

app.get('/receive', function(req, res) {
    var query = req.url;
    var team = query.slice(9, 10);
    var ptxt = query.slice(10);
    var points = parseInt(ptxt, 10);
    score += points;
    io.emit('score update', '1');
    console.log("asd");
    /*request.put("https://locationPartOfAddress.api.smartthings.com:443/api/smartapps/installations/uuid/switches/toggle", {
            headers: {
                Authorization: "Bearer  tokenUuid"
            }
        },
        function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body);
        })*/
    res.end();
});