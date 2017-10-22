var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var request = require("request");
var JsonDB = require('node-json-db');
var db = new JsonDB("oldGames", true, true);
var linq = require("linq");

var deviceDb = new JsonDB("devicesTemplate", false, true);
var devices = deviceDb.getData("/devices");
console.log(devices);

var gamesC = 0;

io.on('connection', function(socket) {
    socket.on('score update', function(team, score) {
        io.emit('score update', team);
    });
    socket.on('update', function() {
        io.emit('new game', db.getData("/games"));
        io.emit('score update', 0, db.getData("/currentGame/t0"));
        io.emit('score update', 1, db.getData("/currentGame/t1"));
        io.emit('score update', 2, db.getData("/currentGame/t2"));
    });
});

http.listen(8080, function() {
    console.log('listening on *:8080');
});

app.get('/panel', function(req, res) {
    res.sendFile(__dirname + '/control.html');
});

app.get('/smartT', function(req, res) {
    var query = req.url;
    if (query.length >= 11) {
        res.redirect("https://graph.api.smartthings.com/oauth/authorize?response_type=code&client_id=" + req.query.client_id + "&scope=app&redirect_uri=" + req.query.url);
    }
    res.end();
});

app.get('/scores', function(req, res) {
    res.sendFile(__dirname + '/scores.html');
});

app.get('/newgame', function(req, res) {
    var curGame = db.getData("/currentGame");

    db.push("/games[-1]", curGame, false);
    io.emit('new game', db.getData("/games"));
    
    curGame = {
        'startDate' : new Date().toUTCString(),
        't0' : 0,
        't1' : 0,
        't2' : 0,
        'targets' : deviceDb.getData("/devices")
    };

    db.push("/games[]", curGame)

    db.push("/currentGame", curGame);
    
    io.emit('score update', 0, 0);
    io.emit('score update', 1, 0);
    io.emit('score update', 2, 0);
    gamesC++;
    res.end();
});

app.get('/receive', function(req, res) {
    res.end();
    post(req, res);
});

function post(req, res) {
    var query = req.url;
    var device = parseInt(query.slice(-3, -1).replace("?", ""));
    console.log(query.slice(-3, -1).replace("?", ""));
    var team = parseInt(query.slice(-1));
    var target = linq.from(devices).first(function(value, index) { return value.uni_code === device;});
    console.log("Team " + team + " Hit " + target.name);
    if (db.getData("/currentGame/targets[" + device + "]/status/active")) {
    db.push("/currentGame/t" + team, db.getData("/currentGame/t" + team) + target.point_reward);
    db.push("/currentGame/targets[" + device + "]/status/last_activation", new Date().getTime());
    io.emit('score update', team, db.getData("/currentGame/t" + team));
    request.put("https://locationPartOfAddress.api.smartthings.com:443/api/smartapps/installations/uuid/switches/" + target.iot_name + "/0", {
            headers: {
                Authorization: "Bearer  tokenUuid"
            }
        },
        function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log(body);
        })
        db.push("/currentGame/targets[" + device + "]/status/active", false);
}}

function update() {
    for (var i = 0; i < db.getData("/currentGame/targets").length; i++ ){
        if (new Date().getTime() > db.getData("/currentGame/targets[" + i + "]/status/last_activation") + db.getData("/currentGame/targets[" + i + "]/timeout")) {
            if (!db.getData("/currentGame/targets[" + i + "]/status/active")) {
         db.push("/currentGame/targets[" + i + "]/status/active", true);
         request.put("https://locationPartOfAddress.api.smartthings.com:443/api/smartapps/installations/uuid/switches/" + db.getData("/currentGame/targets[" + i + "]/iot_name") + "/1", {
            headers: {
                Authorization: "Bearer  tokenUuid"
            }
        },
        function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Put Request Successful');
        })
        }
     }
    }
 }
 setInterval(update, 500);