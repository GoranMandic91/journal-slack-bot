import { ISlackMessage, ISlackUser } from './../models/Slack';
import { SlackController, Conversation, SlackBot } from 'botkit';
import geocodeService from '../services/GeocodeService';

export class AddressConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.hears(['address'], 'direct_message', (bot, message) => {
            bot.createConversation(message, (err, convo) => {
                if (!err) {
                    convo.addQuestion({
                        text: 'Ok. Please type your address and I will do the rest :simple_smile:',
                    }, async (message: ISlackMessage, convo) => {
                        this.saveAddress(bot, message, convo);
                    }, {}, 'yes_thread');

                    convo.addMessage({
                        text: 'That\'s ok. Come again at any time if you change your mind about it. Just type `address`.',
                        action: 'stop', // this marks the converation as unsuccessful
                    }, 'no_thread');

                    convo.addMessage({
                        text: 'Sorry I did not understand. Say `yes` or `no`',
                        action: 'default',
                    }, 'bad_response');

                    convo.ask('Do you want to set address to get daily/weekly latest news and weather forecast?', this.callbackBranch(bot));

                    convo.activate();
                }
            });
        });
    }

    private async saveAddress(bot, message: ISlackMessage, convo) {
        const address = await geocodeService.geocode(message.text);

        if (address) {
            await this.controller.storage.users.get(message.user, async (err, user: ISlackUser) => {
                if (!user) {
                    await bot.api.users.info({ user: message.user }, (error, response) => {
                        user = response.user;
                        user.address = address;
                        this.saveUser(user, convo);
                    });
                } else {
                    user.address = address;
                    this.saveUser(user, convo);
                }
            });
        } else {
            convo.say({ text: 'Given location is not valid!' });
        }
        convo.next();

    }

    private callbackBranch(bot: SlackBot) {
        return [{
            pattern: bot.utterances.yes,
            callback: (response, convo) => {
                convo.gotoThread('yes_thread');
            },
        },
        {
            pattern: bot.utterances.no,
            callback: (response, convo) => {
                convo.gotoThread('no_thread');
            },
        },
        {
            default: true,
            callback: (response, convo) => {
                convo.gotoThread('bad_response');
            },
        }];
    }

    private async saveUser(user: ISlackUser, convo) {
        await this.controller.storage.users.save(user, (err, saved) => {
            if (err) {
                convo.say({ text: 'I experienced an error adding your address:' + err });
            } else {
                convo.say({ text: 'Address saved succesfully' });
            }
        });
    }
}
