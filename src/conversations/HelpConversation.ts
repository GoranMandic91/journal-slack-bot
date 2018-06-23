import { SlackController } from 'botkit';

export class HelpConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.hears(['help'], 'direct_message', (bot, message) => {
            bot.createConversation(message, (err, convo) => {
                if (!err) {
                    convo.say('Type');
                    convo.say('- `news` for news :point_up::skin-tone-2:');
                    convo.say('- `weather` to get weather forecast :v::skin-tone-2:');
                    convo.say('- `settings` to edit settings to get daily or weekly dose of journal :gear:');

                    convo.activate();
                }
            });
        });

    }
}
