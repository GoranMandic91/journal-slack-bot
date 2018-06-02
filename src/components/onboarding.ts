import { ISlackBot } from './../models/SlackUser';
import { SlackController } from 'botkit';
import * as debug from 'debug';

debug('botkit:onboarding');

export class Onboarding {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.on('onboard', (bot: ISlackBot) => {

            debug('Starting an onboarding experience!');

            bot.startPrivateConversation({ user: bot.config.createdBy }, (err, convo) => {
                if (err) {
                    console.log(err);
                } else {
                    convo.say('I am a bot that has just joined your team');
                    convo.say('You must now /invite me to a channel so that I can be of use!');
                }
            });
        });

    }
}
