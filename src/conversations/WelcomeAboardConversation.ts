import { ISlackBot, ISlackTeam } from '../models/Slack';
import { SlackController } from 'botkit';
import * as debug from 'debug';

debug('botkit:onboarding');

export class WelcomeAboardConversation {

    private controller: any;

    constructor(controller: any) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.on('welcome', (bot: ISlackBot, team: ISlackTeam) => {

            debug('Starting an onboarding experience!');
            this.controller.storage.users.find({ team_id: team.id }, (err, response) => {
                if (err) {
                    console.log(err);
                } else {
                    response.forEach((element) => {
                        bot.startPrivateConversation({ user: element.id }, (err, convo) => {
                            if (err) {
                                console.log(err);
                            } else {
                                convo.say('I am a bot that has just joined your team');
                                convo.say('Soon i\'ll be able to do some cool stuff! :smile:');
                            }
                        });
                    });
                }
            });

        });
    }
}
