import { SlackController } from 'botkit';
const debug = require('debug')('botkit:channel_join');

export class SampleConversationSkill {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        this.controller.hears(['color'], 'direct_message,direct_mention', (bot, message) => {

            bot.startConversation(message, (err, convo) => {
                convo.say('This is an example of using convo.ask with a single callback.');

                // tslint:disable-next-line:no-shadowed-variable
                convo.ask('What is your favorite color?', (response, convo) => {

                    convo.say('Cool, I like ' + response.text + ' too!');
                    convo.next();

                });
            });

        });

        this.controller.hears(['proceed'], 'direct_message,direct_mention', (bot, message) => {

            bot.startConversation(message, (err, convo) => {

                const attachment = [{
                    title: 'Do you want to proceed?',
                    callback_id: '123',
                    attachment_type: 'default',
                    actions: [
                        {
                            name: 'say',
                            text: 'Yes',
                            value: 'yes',
                            type: 'button',
                        },
                        {
                            name: 'say',
                            text: 'No',
                            value: 'no',
                            type: 'button',
                        },
                    ],
                }];

                convo.ask({
                    attachments: attachment,
                }, [
                        {
                            pattern: 'yes',
                            callback: (reply, convo) => {
                                convo.say('FABULOUS!');
                                convo.next();
                            },
                        },
                        {
                            pattern: 'no',
                            callback: (reply, convo) => {
                                convo.say('Too bad');
                                convo.next();
                            },
                        },
                        {
                            default: true,
                            callback: (reply, convo) => {
                                convo.say('Unsupported answer');
                            },
                        },
                    ]);
            });

        });

        this.controller.hears(['question'], 'direct_message,direct_mention', (bot, message) => {

            bot.createConversation(message, (err, convo) => {

                // create a path for when a user says YES
                convo.addMessage({
                    text: 'How wonderful.',
                }, 'yes_thread');

                // create a path for when a user says NO
                // mark the conversation as unsuccessful at the end
                convo.addMessage({
                    text: 'Cheese! It is not for everyone.',
                    action: 'stop', // this marks the converation as unsuccessful
                }, 'no_thread');

                // create a path where neither option was matched
                // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
                convo.addMessage({
                    text: 'Sorry I did not understand. Say `yes` or `no`',
                    action: 'default',
                }, 'bad_response');

                // Create a yes/no question in the default thread...
                convo.ask('Do you like cheese?', [
                    {
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
                    },
                ]);

                convo.activate();

                // capture the results of the conversation and see what happened...
                convo.on('end', (convo) => {

                    if (convo.status === 'completed') {
                        // this still works to send individual replies...
                        bot.reply(message, 'Let us eat some!');

                        // and now deliver cheese via tcp/ip...
                    }

                });
            });

        });

    }

}