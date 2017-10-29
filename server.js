var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var request = require("request");
var JsonDB = require('node-json-db');
var db = new JsonDB("oldGames", true, true);
var linq = require("linq");

var deviceDb = new JsonDB("devicesTemplate", false, true);
var devices = deviceDb.getData("/devices");
console.log(devices);
app.use('/static', express.static('public'))

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

app.get('/dino', function(req, res) {
    res.sendFile(__dirname + '/sound.html');
});

app.get('/footstep', function(req, res) {
    res.sendFile(__dirname + '/sound1.html');
});

app.get('/host', function(req, res) {
    res.sendFile(__dirname + '/sound2.html');
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
   if (target.iot_type == "Smartthings") {
    request.put("https://locationPartOfAddress.api.smartthings.com:443/api/smartapps/installations/uuid/switches/" + target.iot_name + "/0", {
            headers: {
                Authorization: "Bearer  tokenUuid"
            }
        })
        console.log("Smartthings " + target.iot_name);
    } else if (target.iot_type == "Apex") {
        request.post("http://apexIp:port/status.sht?" + target.iot_name + "_state=1&Update=Update", {})
        console.log("APEX " + target.iot_name);
    } else if (target.iot_type == "Sound") {
        io.emit('sound',target.iot_name);
        console.log("Sound");
    }
        db.push("/currentGame/targets[" + device + "]/status/active", false);
}}

function update() {
    for (var i = 0; i < db.getData("/currentGame/targets").length; i++ ){
        if (new Date().getTime() > db.getData("/currentGame/targets[" + i + "]/status/last_activation") + db.getData("/currentGame/targets[" + i + "]/timeout")) {
            if (!db.getData("/currentGame/targets[" + i + "]/status/active")) {
         db.push("/currentGame/targets[" + i + "]/status/active", true);
   if (db.getData("/currentGame/targets[" + i + "]/iot_type") == "Smartthings") {
         request.put("https://locationPartOfAddress.api.smartthings.com:443/api/smartapps/installations/uuid/switches/" + db.getData("/currentGame/targets[" + i + "]/iot_name") + "/1", {
            headers: {
                Authorization: "Bearer  tokenUuid"
            }
        })
        console.log("Smartthings " + db.getData("/currentGame/targets[" + i + "]/iot_name"));
        } else if (db.getData("/currentGame/targets[" + i + "]/iot_type") == "Apex") {
            request.post("http://apexIp:port/status.sht?" + db.getData("/currentGame/targets[" + i + "]/iot_name") + "_state=0&Update=Update", {})
            console.log("APEX " + db.getData("/currentGame/targets[" + i + "]/iot_name"));
        }
        }
     }
    }
 }
 setInterval(update, 500);