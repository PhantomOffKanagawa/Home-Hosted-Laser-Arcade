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
 name: "Laser Tag Controller",
 namespace: "Phantom",
 author: "PhantomOffKanagawa",
 description: "Acts as a controller for the laser tag server",
 category: "My Apps",
 iconUrl: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience.png",
 iconX2Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
 iconX3Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png")


preferences {
 section("Allow server to change these devices...") {
  input "switches", "capability.switch", title: "Devices", multiple: true, required: false
  input "invSwitches", "capability.switch", title: "Inverted Devices", multiple: true, required: false
 }
}

// returns a list like
// [[name: "kitchen lamp", value: "off"], [name: "bathroom", value: "on"]]
def listSwitches() {
 def resp = []
 switches.each {
  resp << [name: it.displayName, value: it.currentValue("switch")]
 }
 invSwitches.each {
  resp << [name: it.displayName, value: it.currentValue("switch")]
 }
 return resp
}

void updateSwitches() {

 def command = params.command == "1"
 def deviceName = params.device
 
 switches.each {
  if (it.displayName == deviceName) {
    command = !command
   if (command) {
    it.on()
   } else {
    it.off()
   }
  }
 }
 invSwitches.each {
  if (it.displayName == deviceName) {
    command = !command
   if (command) {
    it.on()
   } else {
    it.off()
   }
  }
 }
}