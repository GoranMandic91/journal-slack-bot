import { SlackController } from 'botkit';

export class SampleEventsSkill {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.on('user_channel_join,user_group_join', (bot, message) => {
            bot.api.users.info({ user: message.user }, (error, response) => {
                const { name, real_name } = response.user;
                bot.reply(message, 'Welcome, ' + real_name + ' :simple_smile:');
            });
        });
    }
}
