# node-mqtt-notification

[![npm version](https://badge.fury.io/js/mqtt-notification.svg)](https://badge.fury.io/js/mqtt-notification)

This small node program allows your computer to display native notifications, that are send from a mqtt server.

Usage:

- Display message when an error occurred on with one of your apps.
- Show "Someone at the door" notification.
- Someone opened a door.

You can also use this to remote lock your computer. (Currently only tested on MacOS)

# Install and Config

You would typically run this app in the background, but first you have to configure it.

```bash
git clone https://github.com/svrooij/evohome2mqtt.git
cd evohome2mqtt
npm install
nano config/local.json
```

Edit this file to your needs `config/local.json` with the following config. And see [default.json](config/default.json) for the other config items. See [mqtt.connect](https://www.npmjs.com/package/mqtt#connect) for options how to format the host. `mqtt://ip_address:port` is the easiest.

```json
{
  "mqtt": {
    "host":"mqtt://ip_or_host_of_mqtt_server"
  },
  "topics": {
    "lockTopic":"the/topic/to/subscribe/to/for/locking",
    "notificationTopic":"the/notification/topic"
  }
}
```

Try to start the application by running `npm start` or directly by `node receiver.js`, and try to send a notification (or a lock command).

# Running in the background

If everything works as expected, you should make the app run in the background automatically. Personally I use PM2 for this. And they have a great [guide for this](http://pm2.keymetrics.io/docs/usage/quick-start/).

When PM2 is running (and starting on startup). `pm2 start receiver.js --name mqtt-notifications`
