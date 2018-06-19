import { ISlackMessage } from '../models/Slack';
import { SlackController } from 'botkit';

const firstGratitude = [
    'You\'re welcome. :sunglasses:',
    'No problem. :slightly_smiling_face:',
    'It\'s alright. :wink:',
    'Anytime! :hugging_face:',
];
const secondGratitude = [
    'I\'m always here for you!',
    'It\'s my pleasure to help you!',
    'Thanks for getting in touch.',
    'I\'m happy to help.',
];
export class GratitudeConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();

    }

    public configure() {

        this.controller.hears(['gratitude'], 'direct_message', this.customHearsHandler, (bot, message: any) => {

            bot.createConversation(message, async (err, convo) => {
                convo.say({ text: firstGratitude[Math.floor(Math.random() * 4)] });
                convo.say({ text: secondGratitude[Math.floor(Math.random() * 4)] });
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
