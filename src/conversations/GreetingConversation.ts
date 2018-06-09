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
                let greeting = this.getGreetingEntity(message.intents);
                greeting = greeting ? greeting[0].toUpperCase() + greeting.slice(1) : 'Hi';
                convo.say({ text: greeting + ' :man-raising-hand::skin-tone-2:' });
                convo.say({ text: 'What can i do for you? :simple_smile:' });
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

    private getGreetingEntity(intents: any) {
        let greetingEntity = '';
        if (intents && intents[0] && intents[0]._text) {
            greetingEntity = intents[0]._text;
        }
        return greetingEntity;
    }
}
