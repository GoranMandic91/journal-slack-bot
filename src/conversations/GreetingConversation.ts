import { ISlackMessage } from '../models/Slack';
import { SlackController } from 'botkit';

const firstGreeting = [
    'Hello :man-raising-hand::skin-tone-2:',
    'Hi :male-technologist::skin-tone-2:',
    'Bonjour :hand::skin-tone-2:',
    'Salut :robot_face:',
];
const secondGreeting = [
    'What can I do for you? :simple_smile:',
    'How can I help you? :blush:',
    'I hope you\'re having a wonderful day. :upside_down_face:',
    'Is there anything I could do for you? :simple_smile:',
];
export class GreetingConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();

    }

    public configure() {

        this.controller.hears(['greeting'], 'direct_message', this.customHearsHandler, (bot, message: any) => {

            bot.createConversation(message, async (err, convo) => {

                convo.say({ text: firstGreeting[Math.floor(Math.random() * 4)] });
                convo.say({ text: secondGreeting[Math.floor(Math.random() * 4)] });
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
