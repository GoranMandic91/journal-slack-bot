import { ISlackMessage, ISlackUser, ISlackBot, ISlackAttachment } from './../models/Slack';
import { SlackController, SlackBot, Conversation } from 'botkit';

const DAY_REPEAT = ['every day', 'every Monday', 'every Tuesday', 'every Wednesday', 'every Thursday', 'every Friday', 'every Saturday', 'every Sunday'];

export class TimeConversation {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.hears(['time'], 'direct_message', (bot, message) => {
            bot.createConversation(message, (err, convo) => {
                if (!err) {
                    let pattern = '';

                    convo.addQuestion({
                        attachments: this.getAttachment(true),
                    }, (message: ISlackMessage, convo) => {

                        const dayRepeat = message.actions[0].selected_options[0].value;
                        pattern = DAY_REPEAT.indexOf(dayRepeat) ? ' * * ' + DAY_REPEAT.indexOf(dayRepeat) % 7 : ' * * *';

                        convo.ask({
                            attachments: this.getAttachment(false),
                        }, (message: ISlackMessage, convo) => {
                            const hourRepeat = message.actions[0].selected_options[0].value;
                            pattern = '00 00 ' + hourRepeat.split(':')[0] + pattern;
                            const humanPattern = dayRepeat + ' at ' + hourRepeat;
                            this.saveTime(bot, message, convo, pattern, humanPattern);
                        });
                        convo.next();
                    }, {}, 'yes_thread');

                    convo.addMessage({
                        text: 'That\'s ok. Come again at any time if you change your mind about it. Just type me `time`.',
                        action: 'stop', // this marks the converation as unsuccessful
                    }, 'no_thread');

                    convo.addMessage({
                        text: 'Sorry I did not understand. Say `yes` or `no`',
                        action: 'default',
                    }, 'bad_response');

                    convo.ask('Do you want to set time preference to get daily/weekly latest news and weather forecast?', this.callbackBranch(bot));

                    convo.activate();
                }
            });
        });
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

    private async saveTime(bot: ISlackBot, message: ISlackMessage, convo: Conversation<ISlackMessage>, pattern: string, humanPattern: string) {

        await this.controller.storage.users.get(message.user, async (err, user: ISlackUser) => {
            if (!user) {
                await bot.api.users.info({ user: message.user }, (error, response) => {
                    user = response.user;
                    user.cron_pattern = pattern;
                    this.saveUser(user, convo, humanPattern);
                });
            } else {
                user.cron_pattern = pattern;
                this.saveUser(user, convo, humanPattern);
            }
        });
        convo.next();
    }

    private async saveUser(user: ISlackUser, convo: Conversation<ISlackMessage>, humanPattern: string) {
        await this.controller.storage.users.save(user, (err, saved) => {
            if (err) {
                convo.say({ text: 'I experienced an error adding your time preference:' + err });
            } else {
                convo.say({ text: `Time preference \`${humanPattern}\` saved succesfully` });
            }
        });
    }

    private getAttachment(day: boolean): ISlackAttachment[] {
        const attachment = {
            text: day ? 'Choose a day repeat option' : 'Choose a hour repeat option',
            color: '#28b395',
            attachment_type: 'default',
            callback_id: 'time_selection',
            actions: [{
                name: day ? 'day_list' : 'hour_list',
                text: 'Pick a option...',
                type: 'select',
                options: [],
            }],
        };
        if (!day) {
            for (let index = 0; index < 24; index++) {
                attachment.actions[0].options.push({
                    text: index < 10 ? '0' + index + ':00' : index + ':00',
                    value: index < 10 ? '0' + index + ':00' : index + ':00',
                });
            }
        } else {
            DAY_REPEAT.forEach((element) => {
                attachment.actions[0].options.push({
                    text: element,
                    value: element,
                });
            });
        }
        return [attachment];
    }
}
