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

    public customHearsHandler(pattern: string, message: ISlackMessage) {
        let isMatch = false;
        if (message.entities && message.entities.intent && message.entities.intent[0] && message.entities.intent[0].value && message.entities.intent[0].value === pattern[0]) {
            isMatch = true;
        }
        return isMatch;
    }
}
