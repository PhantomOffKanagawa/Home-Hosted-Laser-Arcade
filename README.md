# Foobar ![CI status](https://img.shields.io/badge/build-passing-brightgreen.svg)![CI status](https://img.shields.io/badge/build-passing-brightgreen.svg)![CI status](https://img.shields.io/badge/build-passing-brightgreen.svg)

A basic code server and ESP8266 script to manage a home-made laser tag game

## Usage
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

## License
[MIT](https://choosealicense.com/licenses/mit/)
