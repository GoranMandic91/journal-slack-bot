import { SlackController } from 'botkit';

module.exports = (controller: SlackController) => {

    controller.on('user_channel_join,user_group_join', (bot, message) => {
        bot.api.users.info({ user: message.user }, (error, response) => {
            const { name, real_name } = response.user;
            bot.reply(message, 'Welcome, ' + real_name + ' :simple_smile:');
        });
    });
};
