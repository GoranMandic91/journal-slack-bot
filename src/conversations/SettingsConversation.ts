import { SlackController, Conversation, SlackBot } from 'botkit';
import { ISlackUser, ISlackMessage, ISlackAttachment, ISlackBot } from '../models/Slack';
import settingsService from '../services/SettingsService';
import geocodeService from '../services/GeocodeService';

export const DAY_REPEAT = ['every day', 'every Monday', 'every Tuesday', 'every Wednesday', 'every Thursday', 'every Friday', 'every Saturday', 'every Sunday'];

export class SettingsConversation {

    private controller: any;
    private pattern: any;
    private user: ISlackUser;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.pattern = null;
        this.user = null;

        this.configure();
    }

    public configure() {

        this.controller.hears(['settings'], 'direct_message', (bot, message) => {
            bot.createConversation(message, async (err, convo) => {
                if (!err) {
                    await this.controller.storage.users.get(message.user, async (err, user: ISlackUser) => {
                        if (!user) {
                            await bot.api.users.info({ user: message.user }, (error, response) => {
                                user = response.user;
                                user.cron = null;
                                user.address = null;
                                user.is_active_journal = false;
                                this.user = user;
                                convo.setVar('user', this.user);
                                this.saveUser(user, convo);
                            });
                        } else {
                            this.user = user;
                            convo.setVar('user', this.user);
                        }

                        convo.addQuestion({
                            text: 'Please type your address and I will do the rest :simple_smile:',
                        }, async (message: ISlackMessage, convo) => {
                            const address = await geocodeService.geocode(message.text);
                            if (address) {
                                this.saveSettings(bot, message, convo, 'address', address);
                            } else {
                                convo.say({ text: 'Given location is not valid!' });
                                convo.next();
                            }
                        }, {}, 'address_thread');

                        convo.addQuestion({
                            attachments: settingsService.getTimeAttachment(true),
                        }, (message: ISlackMessage, convo) => {

                            const dayRepeat = message.actions[0].selected_options[0].value;
                            this.pattern = DAY_REPEAT.indexOf(dayRepeat) ? ' * * ' + DAY_REPEAT.indexOf(dayRepeat) % 7 : ' * * *';

                            convo.ask({
                                attachments: settingsService.getTimeAttachment(false),
                            }, (message: ISlackMessage, convo) => {
                                const hourRepeat = message.actions[0].selected_options[0].value;
                                this.pattern = {
                                    formatted: dayRepeat + ' at ' + hourRepeat,
                                    pattern: '00 00 ' + hourRepeat.split(':')[0] + this.pattern,
                                };
                                this.saveSettings(bot, message, convo, 'cron', this.pattern);
                            });
                            convo.next();
                        }, {}, 'time_thread');

                        convo.beforeThread('enable_thread', async (convo, next) => {
                            if (this.user.is_active_journal && this.user.address && this.user.cron) {
                                await this.saveSettings(bot, message, convo, 'is_active_journal', false);
                                convo.addMessage({
                                    text: 'You succesfully disable journal.',
                                    action: 'default',
                                }, 'enable_thread');
                                convo.next();
                            } else {
                                if (!this.user.address || !this.user.cron) {
                                    convo.addMessage({
                                        text: 'You must first set address and time settings and then enable journal.',
                                        action: 'default',
                                    }, 'enable_thread');
                                    convo.next();
                                } else {
                                    await this.saveSettings(bot, message, convo, 'is_active_journal', true);
                                    convo.addMessage({
                                        text: 'You succesfully enable journal.',
                                        action: 'stop',
                                    }, 'enable_thread');
                                    convo.next();
                                }
                            }
                            next('');
                        });

                        convo.addMessage({
                            text: 'Come again at any time if you change your mind. Just type `settings`.',
                            action: 'stop',
                        }, 'quit_thread');

                        convo.ask({ attachments: settingsService.getGlobalAttachment(this.user) }, settingsService.getCallbackBranch(bot));

                        convo.activate();
                    });
                } else {
                    convo.say({ text: 'Some error occured! Please, try again later.' });
                    convo.activate();
                }
            });
        });
    }

    private async saveSettings(bot, message: ISlackMessage, convo, settingsName: string, settingsValue: any) {
        await this.controller.storage.users.get(message.user, async (err, user: ISlackUser) => {
            if (!user) {
                await bot.api.users.info({ user: message.user }, (error, response) => {
                    this.user = response.user;
                    this.user[settingsName] = settingsValue;
                    this.saveUser(this.user, convo);
                });
            } else {
                this.user = user;
                this.user[settingsName] = settingsValue;
                this.saveUser(this.user, convo);
            }
        });
    }

    private async saveUser(user: ISlackUser, convo: Conversation<ISlackMessage>) {
        await this.controller.storage.users.save(user, (err, saved) => {
            if (err) {
                convo.say({ text: 'I experienced an error saving settings:' + err });
            } else {
                this.controller.trigger('cron:restart', [user, convo]);
                convo.setVar('user', user);
                convo.say({ text: 'Settings saved succesfully!', action: 'default', });
            }
        });
        convo.next();
    }

}
