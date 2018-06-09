import { ISlackMessage } from './../models/Slack';
import { SlackController } from 'botkit';

export class GreetingConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();

    }

    public configure() {

        this.controller.hears(['greeting'], 'direct_message', this.customHearsHandler, (bot, message: any) => {

            bot.createConversation(message, async (err, convo) => {
                convo.say({ text: 'Hello :man-raising-hand::skin-tone-2:' });
                convo.say({ text: 'What can I do for you? :simple_smile:' });
                convo.activate();
            });
        });

    }

    public customHearsHandler(test: string, message: ISlackMessage) {
        let isMatch = false;
        if (message.intents && message.intents[0] && message.intents[0].entities && message.intents[0].entities.intent) {
            message.intents[0].entities.intent.forEach((intent) => {
                isMatch = intent.value.match(test);
            });
        }
        return isMatch;
    }
}
