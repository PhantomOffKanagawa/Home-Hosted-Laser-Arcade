/**
 *  ESP8266 Manager
 *
 *  Copyright 2017 BlueishThings
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */


mappings {
 path("/switches") {
  action: [
   GET: "listSwitches"
  ]
 }
 path("/switches/:command") {
  action: [
   PUT: "updateSwitches"
  ]
 }
}

definition(
 name: "ESP8266 Manager",
 namespace: "Blue",
 author: "BlueishThings",
 description: "Its to manage a ESP8266 Manager",
 category: "My Apps",
 iconUrl: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience.png",
 iconX2Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
 iconX3Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png")


preferences {
 section("Allow external service to control these things...") {
  input "switches", "capability.switch", title: "Switches", multiple: true, required: false
 }
}

// returns a list like
// [[name: "kitchen lamp", value: "off"], [name: "bathroom", value: "on"]]
def listSwitches() {
 def resp = []
 switches.each {
  resp << [name: it.displayName, value: it.currentValue("switch")]
 }
 return resp
}

void updateSwitches() {
  // use the built-in request object to get the command parameter
 def command = params.command
 def deviceName = command.reverse().take(1).reverse()
  // all switches have the command
  // execute the command on all switches
  // (note we can do this on the array - the command will be invoked on every element
 switches.each {
  if (it.displayName == deviceName) {
   if (it.currentValue("switch") == "on") {
    it.off()
   } else {
    it.on()
   }
  }
 }
 log.error(command)
}