import { ISlackMessage } from '../models/Slack';
import { SlackController } from 'botkit';

const firstParting = [
    'See you :wave::skin-tone-2:',
    'Goodbye :wave::skin-tone-2:',
    'Cheerio :wave::skin-tone-2:',
    'Au revoir :wave::skin-tone-2:',
];
const secondParting = [
    'Hope I hear you soon. :simple_smile:',
    'Come back soon!',
    'I will not say goodbye to you! I`ll say see you soon!',
    'It is not forever, it is not the end. It just means that we`ll soon meet again!',
];
export class PartingConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();

    }

    public configure() {

        this.controller.hears(['parting'], 'direct_message', this.customHearsHandler, (bot, message: any) => {

            bot.createConversation(message, async (err, convo) => {
                convo.say({ text: firstParting[Math.floor(Math.random() * 4)] });
                convo.say({ text: secondParting[Math.floor(Math.random() * 4)] });
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
