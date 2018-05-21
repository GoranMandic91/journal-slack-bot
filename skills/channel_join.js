var debug = require('debug')('botkit:channel_join');

module.exports = (controller) => {

    controller.on('bot_channel_join', (bot, message) => {

        bot.reply(message, 'Hi folks :robot_face: I\'m here to serve you :rocket:');

    });

}
