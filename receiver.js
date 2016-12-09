const config = require('config')
const path = require('path')
const notifier = require('node-notifier') // Sending the notifications

/* ------- Config part ----- */
var mqttConf = config.get('mqtt')
if (!mqttConf.host) {
  console.error('Set at least the mqtt host!')
  process.exit(4)
}
var mqttOptions = {}
if (mqttConf.user && mqttConf.password) {
  mqttOptions.username = mqttConf.user
  mqttOptions.password = mqttConf.password
}

var topicConfig = config.get('topics')
if (!(topicConfig.lockTopic || topicConfig.notificationTopic)) {
  console.error('Set a lockTopic and/or a notification topic!')
  process.exit(5)
}

var notificationConfig = config.get('notificationDefaults')

/* -----------------  MQTT Part --------------- */
const mqtt = require('mqtt')
const client = mqtt.connect(mqttConf.host, mqttOptions)
client.on('connect', () => {
  if (topicConfig.lockTopic) {
    client.subscribe(topicConfig.lockTopic)
  }
  if (topicConfig.notificationTopic) {
    client.subscribe(topicConfig.notificationTopic)
  }
})

client.on('error', (err) => {
  console.error(err)
  // Should an error do something else?
})
client.on('message', (topic, message) => {
  switch (topic) {
    case topicConfig.notificationTopic:
      handleNotification(topic, message)
      break
    case topicConfig.lockTopic:
      lockcomputer()
      break
    default:
      console.debug('Got %s on unknow topic %s', message, topic)
  }
})

function handleNotification (topic, message) {
  var notification = {
    sound: notificationConfig.sound,
    title: notificationConfig.title,
    icon: path.join(__dirname, notificationConfig.iconFolder, notificationConfig.icon)
  }
  var data = tryParseJSON(message)
  if (data !== false) {
    // Got an object
    if (data.message) {
      notification.message = data.message.toString()
    }
    if (data.title) {
      notification.title = data.title.toString()
    }
    if (data.icon) {
      notification.icon = data.icon.toString()
    }
  } else { // threath as string message
    notification.message = message.toString()
  }

  notifier.notify(notification)
}

function tryParseJSON (jsonString) {
  try {
    var o = JSON.parse(jsonString)

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object",
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (o && typeof o === 'object') {
      return o
    }
  } catch (e) {
    // We don't want this error, how naugthy.
  }
  return false
}

/* -------------- Locking the computer ------------
 * Needs some work, for supporting other platforms.
 * If you know the command that need to be executed, let me know.
*/
const os = require('os') // Finding out the platform
const spawn = require('child_process').spawn
function lockcomputer () {
  var platform = os.platform()
  // Execute right command based on platform. Need pull-request!
  switch (platform) {
    case 'darwin':
      console.log('Trying to start screensaver on your mac.')
      spawn('open', ['-a', 'ScreenSaverEngine'])
      break
    case 'win32':
      console.log('Trying to lock your pc')
      // Does this work? Found on http://superuser.com/questions/21179/command-line-cmd-command-to-lock-a-windows-machine
      spawn('rundll32.exe', ['user32.dll,LockWorkStation'])
      break
    default:
      console.warn("Platform %s doesn't support locking (yet)!", platform)
  }
}
