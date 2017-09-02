var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var request = require("request");
var JsonDB = require('node-json-db');
var db = new JsonDB("oldGames", true, true);

var gamesC = 0;
var currentGObj = [];

io.on('connection', function(socket) {
    socket.on('score update', function(team, score) {
        io.emit('score update', team);
    });
    socket.on('update', function() {
        io.emit('score update', 0, db.getData("/currentGame[0]"));
        io.emit('score update', 1, db.getData("/currentGame[1]"));
        io.emit('score update', 2, db.getData("/currentGame[2]"));
    });
});

http.listen(8080, function() {
    console.log('listening on *:8080');
});

app.get('/scores', function(req, res) {
    res.sendFile(__dirname + '/scores.html');
});

app.get('/newgame', function(req, res) {
    var obj = {
        't0' : db.getData("/currentGame[0]"),
        't1' : db.getData("/currentGame[1]"),
        't2' : db.getData("/currentGame[2]")
    };

    db.push("/games[-1]", obj, false);
    db.push("/games[]", {'startDate' : new Date().toUTCString()})

    var currentGObj = [0,0,0];
    db.push("/currentGame", currentGObj)
    
    io.emit('score update', 0, 0);
    io.emit('score update', 1, 0);
    io.emit('score update', 2, 0);
    gamesC++;
    res.end();
});

app.get('/receive', function(req, res) {
    var query = req.url;
    var team = query.slice(9, 10);
    var ptxt = query.slice(10);
    var points = parseInt(ptxt, 10);
    db.push("/currentGame[" + team + "]", db.getData("/currentGame[" + team + "]") + points);
    io.emit('score update', team, db.getData("/currentGame[" + team + "]"));
    request.put("https://locationPartOfAddress.api.smartthings.com:443/api/smartapps/installations/uuid/switches/" + team, {
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
    res.end();
});