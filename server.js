var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});









/*http.createServer(function(req, res) {
    //res.writeHead(200, { 'Content-Type': 'text/html' });
    //Get Query
    var query = req.url;
    var team = query.slice(1, 2);
    var ptxt = query.slice(2);
    var points = parseInt(ptxt, 10);
    score += points;
    //res.write(team);
    //res.write("<br />");
    //res.write(score.toString());
    res.end();

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
}).listen(8080);*/