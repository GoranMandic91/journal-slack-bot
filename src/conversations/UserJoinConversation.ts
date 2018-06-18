import { SlackController } from 'botkit';

export class UserJoinConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.on('user_group_join', (bot, message) => {
            bot.api.users.info({ user: message.user }, (error, response) => {
                bot.startPrivateConversation({ user: message.user }, (err, convo) => {
                    if (err) {
                        console.log(err);
                    } else {
                        convo.say('I am a bot that has just joined your team');
                        convo.say('To see what can I do, type `help` :smile:');
                    }
                });
            });

        });
    }
}
