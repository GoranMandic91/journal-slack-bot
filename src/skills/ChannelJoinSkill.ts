import { SlackController } from 'botkit';
import * as debug from 'debug';
debug('botkit:channel_join');
export class ChannelJoinSkill {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {
        this.controller.on('bot_channel_join', (bot, message) => {

            bot.reply(message, 'Hi folks :robot_face: I\'m here to serve you :rocket:');

        });

    }

}
