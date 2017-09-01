var app = require('express')();
var http = require('http');
var score = 0;
var request = require('request');
http.createServer(function(req, res) {
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
}).listen(8080);