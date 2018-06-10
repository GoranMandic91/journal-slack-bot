import { SlackController } from 'botkit';
import { ISlackMessage } from '../models/Slack';
export class InteractiveMessageSkill {

    private controller: SlackController;

    constructor(controller: SlackController) {
        this.controller = controller;
        this.configure();
    }

    public configure() {

        // create special handlers for certain actions in buttons
        // if the button action is 'say', act as if user said that thing
        this.controller.middleware.receive.use((bot, message: ISlackMessage, next) => {
            if (message.type === 'interactive_message_callback') {
                if (message.actions[0].name.match(/^day_list$/) || message.actions[0].name.match(/^hour_list$/)) {
                    const reply = message.original_message;

                    for (let a = 0; a < reply.attachments.length; a++) {
                        reply.attachments[a].actions = null;
                    }

                    let person = '<@' + message.user + '>';
                    if (message.channel[0] === 'D') {
                        person = 'You';
                    }

                    reply.attachments.push(
                        {
                            text: person + ' choosed `' + message.actions[0].selected_options[0].value + '`',
                        }
                    );

                    bot.replyInteractive(message, reply);

                }
            }

            next();

        });

    }
}
