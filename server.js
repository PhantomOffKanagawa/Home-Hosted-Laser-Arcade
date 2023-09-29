var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var request = require("request");
var JsonDB = require('node-json-db');
var db = new JsonDB("games", true, true);
var linq = require("linq");

var pause = false,
    gameLength = 90 * 1000,
    game30Seconds = 30 * 1000,
    game10Seconds = 10 * 1000;

var deviceDb = new JsonDB("devicesTemplate", false, true);
var devices = deviceDb.getData("/devices");

app.use('/static', express.static('public'));

io.on('connection', function(socket) {
    socket.on('score update', function(team, score) {
        io.emit('score update', team);
    });
    socket.on('update', function() {
        io.emit('end game', db.getData("/games"));
        io.emit('score update', 0, db.getData("/currentGame/t0"));
        io.emit('score update', 1, db.getData("/currentGame/t1"));
        io.emit('score update', 2, db.getData("/currentGame/t2"));
    });
});

http.listen(8080, function() {
    console.log('listening on *:8080');
});

app.get('/dino', function(req, res) { //Dino Roars
    res.sendFile(__dirname + '/sound.html');
});

app.get('/footstep', function(req, res) { //Footsteps
    res.sendFile(__dirname + '/sound1.html');
});

app.get('/host', function(req, res) { //Host Sounds: 10 Seconds Left & Game Over
    res.sendFile(__dirname + '/sound2.html');
});

app.get('/scores', function(req, res) { //Page For Viewing Scores And Previous Games
    res.sendFile(__dirname + '/scores.html');
});

app.get('/newgame', function(req, res) {
    io.emit('sound', "start"); //Play start sound on master sound controller
    var curGame = db.getData("/currentGame"); //Get the Current Game (What is now the last game) data

    db.push("/games[]", curGame); //Push current game to end of games

    curGame = {
        'startTime': new Date().getTime(),
        'alerts': 0,
        'startDate': new Date().toUTCString(),
        't0': 0,
        't1': 0,
        't2': 0,
        'targets': deviceDb.getData("/devices")
    }; //Reset game metrics

    db.push("/currentGame", curGame); //Reset Current Game Object

    /* Reset Scores on Scores Page */
    io.emit('score update', 0, 0); 
    io.emit('score update', 1, 0);
    io.emit('score update', 2, 0);
    pause = false; //Un-Pause game if paused
    res.end();
});

app.get('/receive', function(req, res) {
    res.end();
    post(req, res); //Accept and manage update from ESP8266
});

function post(req, res) {
    if (!pause) { //Ignore all updates if game is paused
        /* Manage and Parse Url Information */
        var query = req.url;
        var device = parseInt(query.slice(-3, -1).replace("?", ""));
        console.log(query.slice(-3, -1).replace("?", ""));
        var team = parseInt(query.slice(-1));

        var target = linq.from(devices).first(function(value, index) { return value.uni_code === device; }); //Get device via the device template
        console.log("Team " + team + " Hit " + target.name);

        if (db.getData("/currentGame/targets[" + device + "]/status/active")) { //Check if device is currently able to be shot
            db.push("/currentGame/t" + team, db.getData("/currentGame/t" + team) + target.point_reward); //Add points to team's score
            db.push("/currentGame/targets[" + device + "]/status/last_activation", new Date().getTime()); //Update "last_activation"
            io.emit('score update', team, db.getData("/currentGame/t" + team)); //Update Scores webpage
            if (target.iot_type == "Smartthings") { //If Smartthings device
                try { //Make Smartthings Call With Target Info (A real pain to get working)
                    request.put("https://foobar.api.smartthings.com:443/api/smartapps/installations/uuid/switches/" + target.iot_name + "/0", {
                        headers: {
                            Authorization: "Bearer uuid"
                        }
                    });
                } catch(err) {
                    console.log("SmartThings bad thing happened"); //Shouldn't happen if setup correctly
                }

                console.log("Smartthings " + target.iot_name);
            } else if (target.iot_type == "Apex") { //If Apex device
                try { //Make local call to server for Apex
                request.post("http://apex@192.168.100.100:8800/status.sht?" + target.iot_name + "_state=1&Update=Update", {});
                } catch(err) {
                    console.log("APEX Bad Thing Happened"); // Probably maybe won't happen
                }
                console.log("APEX " + target.iot_name);
            } else if (target.iot_type == "Sound") { //If a sound player
                io.emit('sound', target.iot_name); //Socket io emit sound player
                console.log("Sound");
            }
            db.push("/currentGame/targets[" + device + "]/status/active", false);
        }
    }
}

/* Looped function for updating devices and checking if they should be on or off */
function update() {
    for (var i = 0; i < db.getData("/currentGame/targets").length; i++) { //Loop through devices
        //Check if the target is past its timeout
        if (new Date().getTime() > db.getData("/currentGame/targets[" + i + "]/status/last_activation") + db.getData("/currentGame/targets[" + i + "]/timeout")) {
            //Check if the target thinks it should be deactivated
            if (!db.getData("/currentGame/targets[" + i + "]/status/active")) {
                db.push("/currentGame/targets[" + i + "]/status/active", true); //Update status to be active

                /* Reverse of previous IoT requests to reactivate items instead of deactivating them */
                if (db.getData("/currentGame/targets[" + i + "]/iot_type") == "Smartthings") {
                    try {
                    request.put("https://foobar.api.smartthings.com:443/api/smartapps/installations/uuid/switches/" + db.getData("/currentGame/targets[" + i + "]/iot_name") + "/1", {
                        headers: {
                            Authorization: "Bearer  tokenUuid"
                        }
                    });
                } catch(err) {
                    console.log("SmartThings bad thing happened");
                }
                    console.log("Smartthings " + db.getData("/currentGame/targets[" + i + "]/iot_name"));
                } else if (db.getData("/currentGame/targets[" + i + "]/iot_type") == "Apex") {
                    try {
                    request.post("http://apex@192.168.100.100:8800/status.sht?" + db.getData("/currentGame/targets[" + i + "]/iot_name") + "_state=0&Update=Update", {});
                    } catch(err)  {
                        console.log("APEX Bad Thing Happened");
                    }
                    console.log("APEX " + db.getData("/currentGame/targets[" + i + "]/iot_name"));
                }
            }
        }
    }
    if (new Date().getTime() > db.getData("/currentGame/startTime") + gameLength) { //Check that current time is greater than the time the game should end
        if (db.getData("/currentGame/alerts") == 10) { //Check if last alert on game was 10 seconds left
            io.emit('sound', "over"); //Emit gameover sound on master sound controller
            db.push("/currentGame/alerts", 'over'); //Set current game alert to over

            var curGame = db.getData("/currentGame"); //Get current game data
            db.push("/games[-1]", curGame, false); //Push current game to end of archived games
            io.emit('end game', db.getData("/games")); //Tell scores page game has ended
            pause = true; //Pause target and gametime manager
            console.log("Game Over");
        }
    } else if (new Date().getTime() > db.getData("/currentGame/startTime") + (gameLength - game10Seconds)) { //Check if there is 10 or less seconds left
        if (db.getData("/currentGame/alerts") == 30) { //Check that last alert was 30 seonds left
            io.emit('sound', 10); //Emit 10 seconds left sound on master sound controller
            db.push("/currentGame/alerts", 10); //Set current game alert to over
            console.log("10 Seconds Left");
        }
    } else if (new Date().getTime() > db.getData("/currentGame/startTime") + (gameLength - game30Seconds)) { //Check if there is 30 or less seconds left
        if (db.getData("/currentGame/alerts") == 0) { //Check that last alert was blank
            io.emit('sound', 30); //Emit 30 seconds left sound on master sound controller
            db.push("/currentGame/alerts", 30); //Set current game alert to over
            console.log("30 Seconds Left");
        }
    }
}
setInterval(update, 500);