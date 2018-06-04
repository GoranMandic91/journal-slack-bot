import { SlackController } from 'botkit';

export class DefaultSkill {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.hears(['(.*)'], 'direct_message,direct_mention', (bot, message) => {
            bot.createConversation(message, (err, convo) => {
                if (!err) {
                    convo.say(
                        'I don\'t understand what you want :thinking_face:. Type `help` to see what I can!'
                    );
                    convo.activate();
                }
            });
        });

    }
}
