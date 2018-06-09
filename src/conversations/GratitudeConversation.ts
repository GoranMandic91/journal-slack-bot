import { ISlackMessage } from '../models/Slack';
import { SlackController } from 'botkit';

export class GratitudeConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();

    }

    public configure() {

        this.controller.hears(['gratitude'], 'direct_message', this.customHearsHandler, (bot, message: any) => {

            bot.createConversation(message, async (err, convo) => {
                convo.say({ text: 'You\'re welcome :sunglasses:' });
                convo.say({ text: 'I\'m always here for you!' });
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
