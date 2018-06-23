import { ISlackMessage } from '../models/Slack';
import { SlackController } from 'botkit';
import witService from '../services/WitService';

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

        this.controller.hears(['gratitude'], 'direct_message', witService.hears, (bot, message: any) => {

            bot.createConversation(message, async (err, convo) => {
                convo.say({ text: firstGratitude[Math.floor(Math.random() * 4)] });
                convo.say({ text: secondGratitude[Math.floor(Math.random() * 4)] });
                convo.activate();
            });
        });

    }

}
