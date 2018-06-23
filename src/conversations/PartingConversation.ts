import { ISlackMessage } from '../models/Slack';
import { SlackController } from 'botkit';
import witService from '../services/WitService';

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

        this.controller.hears(['parting'], 'direct_message', witService.hears, (bot, message: any) => {

            bot.createConversation(message, async (err, convo) => {
                convo.say({ text: firstParting[Math.floor(Math.random() * 4)] });
                convo.say({ text: secondParting[Math.floor(Math.random() * 4)] });
                convo.activate();
            });
        });

    }

}
