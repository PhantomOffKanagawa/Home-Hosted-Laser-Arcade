mappings {
 path("/switches") {
  action: [
   GET: "listSwitches"
  ]
 }
 path("/switches/:device/:command") {
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

 def command = params.command
 def deviceName = params.device
 
 switches.each {
  if (it.displayName == deviceName) {
   if (command == "1") {
    it.on()
   } else {
    it.off()
   }
  }
 }
}