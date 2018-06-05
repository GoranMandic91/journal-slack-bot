import { SlackController } from 'botkit';

export class HelpSkill {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.hears(['help'], 'direct_message', (bot, message) => {
            bot.createConversation(message, (err, convo) => {
                if (!err) {
                    convo.say(
                        'Type: \n- `news` for news :point_up::skin-tone-2: \n- `weather` to get weather forecast :v::skin-tone-2: \n- `journal` to get news and weather forecast :crossed_fingers::skin-tone-2:'
                    );
                    convo.activate();
                }
            });
        });

    }
}
