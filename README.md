# 🔫 Home Hosted Laser Arcade

> A Nerf Laser Gun powered Arcade which used ESP8266 bords with IR receivers to detect shots and activate IoT devices. Node.js server with an embedded ESP8266 script to manage a IoT based home-made laser tag arcade game.

> It was a super fun project to design and see working despite the jank of early code. I honestly hope to clean it up and be able to put it to use again in the future.

>[!NOTE]
> This is an old project from Freshman year High School that was made with a hard deadline that I quickly cleaned up 2 years ago but still needs to be cleaned up more. I haven't had the time to do so nor the access to the hardware to test it. Hopefully, I will be able to clean it up more in the future.

>[!WARNING]
> This project was designed to interact with SmartThings and the Apex IoT platform. The SmartThings API has changed significantly since this project was created, my recommendation and personal next step is to migrate to a Home Assistant setup. I have not tested this project with the new SmartThings API and it may not work as intended.

![Image: Laser Arcade](image.png)

## Usage
Things that need to be replaced:
- `ESP8266\ESP8266 Code\main.cpp` SERVERIP:8080 is the ip and port of the computer running NodeServer
- `ESP8266\ESP8266 Code\main.cpp` WIFINAME & PASSWORD are the SSID and Password for the network for the ESP8266
- `Node Server\Node Server\server.js` REPLACE_UUID is a uuid passed by smartthings for your endpoint
- `Node Server\Node Server\server.js` STENDPOINT is the smartthings locale address
- `Node Server\Node Server\server.js` APEXIP:PORT is the ip and port for your apex endpoint

The main server is found in the "NodeServer" folder and can be run with:

```
node server.js;
```
Or from the main directory with:

```
cd NodeServer
node server.js;
```

## ESP8266
### Platform IO
The PlatformIO extension for VS Code was used to create the code for the ESP8266 and its use is reccomended for loading the code onto the boards

### Basic IR Test
Is the code used to test the IR setup with ESP8266s and is an example from one of the libraries used [Found Here](https://github.com/markszabo/IRremoteESP8266)

### ESP8266 Code
Contains the code used to accept the IR signals and send the PUT request to the server

The code for the device is hard-coded to each device and the variable 'device' must be changed for each writing to the module

## Node Server
The Node Server code is evidently in the folder named "NodeServer"

### server.js
Read comments in file

### runServer.cmd
A simple commandlet that launches the "server.js" with NodeJS and restarts the server in the event that it crashes, something that admittedly happened quite a bit.

### devicesTemplate.json
Serves as the template for the devices that are checked through when a request is sent. It is also used when a new game instance is created. It should be tailored to your use case

`"name"` Devices name
`"uni_code"`  The code used in the server code to check target attributes
`"iot_type"` Either 'Apex', 'Smartthings', or 'Sound' to tell the code what type of call to make
`"iot_name"` The name to use with the IoT service
`"timeout"` The length of time a device stays activated
`"point_reward"` Simply put the Point Reward
`"hits_per"` The number of hits required to activate a device
`"status" & "analytics"` used for status and analytics and so should be left alone

### gamesTemplate.json
A template for the `games.json` file should it need replacing or to serve as a non-changing smaller file to check how the `games.json` file will be layed out

### games.json
A list of games that are completed and the currentGame object which represents the currently playing game

### receive.html
Not sure why it's there, just left so nothing breaks but 99.99% chance you can delete it

### sounds""-"2".html
HTML pages for the 3 sound pages accessed through "/dino", "/footstep", & "/host"

 - `/sound.html` plays dino roar sounds
 - `/sound1.html` plays footstep sounds
 - `/sound2.html` plays host sounds such as "10 Seconds Left" & "Game over man, GAME OVER"

### scores.html
HTML for "/scores.html" shows scores and has a table to show data for previous games

## License
[MIT](https://choosealicense.com/licenses/mit/)
