import { SlackController } from 'botkit';

const firstDefaultMessage = [
    'I don\'t understand what you mean :thinking_face:.',
    'Hmm :thinking_face:,  I\'m not quite sure what you want.',
    'I\'m bot, but not super bot :disappointed:.',
    'Oh man I don\'t get it:face_palm::skin-tone-2:',
];

const secondDefaultMessage = [
    'Type `help` to see what I can!',
    'Please, text me `help` to get instructions.',
    'Try with `help` to see what can I do for you :bowtie:',
    'Text me `help` and I will help you :smile:',
];
export class DefaultConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.hears(['(.*)'], 'direct_message', (bot, message) => {
            bot.createConversation(message, (err, convo) => {
                if (!err) {
                    convo.say({ text: firstDefaultMessage[Math.floor(Math.random() * 4)] });
                    convo.say({ text: secondDefaultMessage[Math.floor(Math.random() * 4)] });
                    convo.activate();
                }
            });
        });

    }
}
